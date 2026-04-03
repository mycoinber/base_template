/**
 * Core useSiteManifest Composable
 * ============================================================================
 *
 * Headless site manifest management для PBN Template System.
 *
 * Этот composable является частью Core Layer и отвечает за:
 * - Загрузку site-manifest.json (SSR и client)
 * - Кэширование manifest данных
 * - Предоставление computed helper'ов для часто используемых полей
 * - Валидацию и нормализацию manifest данных
 *
 * Theme Layer использует этот composable для получения:
 * - Favicon, Logo, Site Title
 * - Domain, Description
 * - Assets и metadata
 *
 * @example
 * ```typescript
 * // В layout или компоненте темы:
 * const {
 *   data: manifest,
 *   favicon,
 *   logo,
 *   title
 * } = await useSiteManifest();
 * ```
 */

import { computed, type Ref, type ComputedRef } from 'vue';
import type { WebsiteManifestPayload, ArticleImage, SiteAsset } from '@/core/types/page';

// ============================================================================
// Constants
// ============================================================================

const MANIFEST_STATE_KEY = 'siteManifest';
const MANIFEST_FILE_NAME = 'site-manifest.json';
const MANIFEST_LOADING_KEY = 'siteManifestLoading';
const MANIFEST_ERROR_KEY = 'siteManifestError';

// ============================================================================
// Types
// ============================================================================

/**
 * Serializable error type for useState (Error objects cannot be serialized by devalue)
 */
export interface ManifestError {
  message: string;
  code?: string;
}

/**
 * Return type для useSiteManifest composable
 */
export interface UseSiteManifestReturn {
  /** Raw manifest data */
  data: Ref<WebsiteManifestPayload | null>;

  /** Refresh manifest data */
  refresh: () => Promise<WebsiteManifestPayload | null>;

  /** Loading state */
  isLoading: Ref<boolean>;

  /** Error state (serializable) */
  error: Ref<ManifestError | null>;

  // ========================================
  // Helper computed properties
  // ========================================

  /** Favicon URL */
  favicon: ComputedRef<string | null>;

  /** Logo URL or path */
  logo: ComputedRef<string | null>;

  /** Logo as ArticleImage for theme components */
  logoImage: ComputedRef<ArticleImage | null>;

  /** Site title */
  title: ComputedRef<string | null>;

  /** Site description */
  description: ComputedRef<string | null>;

  /** Site domain */
  domain: ComputedRef<string | null>;

  /** Site ID */
  siteId: ComputedRef<string | null>;
}

// ============================================================================
// Main Composable
// ============================================================================

/**
 * Headless composable для управления site manifest.
 *
 * Поддерживает SSR и client-side loading.
 * Автоматически кэширует данные через useState.
 */
export async function useSiteManifest(): Promise<UseSiteManifestReturn> {
  // Shared state (persists across requests on server, across navigations on client)
  const manifestState = useState<WebsiteManifestPayload | null>(
    MANIFEST_STATE_KEY,
    () => null
  );

  const isLoading = useState<boolean>(MANIFEST_LOADING_KEY, () => false);
  const error = useState<ManifestError | null>(MANIFEST_ERROR_KEY, () => null);

  // ========================================
  // Helper Computed Properties
  // ========================================

  const favicon = computed<string | null>(() => {
    return manifestState.value?.favicon || getFaviconFromManifest(manifestState.value) || null;
  });

  const logo = computed<string | null>(() => {
    return manifestState.value?.logo || getLogoFromManifest(manifestState.value) || null;
  });

  const logoImage = computed<ArticleImage | null>(() => {
    const logoUrl = manifestState.value?.logo;
    if (!logoUrl) return null;

    return {
      path: logoUrl,
      alt: manifestState.value?.title || 'Site Logo',
    };
  });

  const title = computed<string | null>(() => {
    return manifestState.value?.title || null;
  });

  const description = computed<string | null>(() => {
    return manifestState.value?.description || null;
  });

  const domain = computed<string | null>(() => {
    return manifestState.value?.domain || null;
  });

  const siteId = computed<string | null>(() => {
    return manifestState.value?.siteId || null;
  });

  // ========================================
  // Fetch Logic
  // ========================================

  const fetchManifest = async (): Promise<WebsiteManifestPayload | null> => {
    try {
      isLoading.value = true;
      error.value = null;

      // Server-side: read manifest file directly without HTTP recursion
      if (import.meta.server) {
        const manifest = await readManifestFromDisk();
        if (manifest) {
          manifestState.value = validateManifest(manifest);
        }
        return manifestState.value;
      }

      // Client-side: fetch via HTTP
      const data = await $fetch<WebsiteManifestPayload>(`/${MANIFEST_FILE_NAME}`);

      if (data) {
        manifestState.value = validateManifest(data);
      }

      return manifestState.value;
    } catch (err) {
      // Store serializable error (not Error object)
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch manifest';
      error.value = { message: errorMessage, code: 'FETCH_ERROR' };

      if (process.dev) {
        console.error('[useSiteManifest] Fetch error:', errorMessage);
      }

      return null;
    } finally {
      isLoading.value = false;
    }
  };

  // ========================================
  // Initial Load
  // ========================================

  // Only fetch if not already loaded
  if (manifestState.value === null) {
    await fetchManifest();
  }

  // ========================================
  // Return Interface
  // ========================================

  return {
    data: manifestState,
    refresh: fetchManifest,
    isLoading,
    error,

    // Computed helpers
    favicon,
    logo,
    logoImage,
    title,
    description,
    domain,
    siteId,
  };
}

// ============================================================================
// Server-side Helpers
// ============================================================================

/**
 * Read manifest directly from disk on the server without creating an internal HTTP request.
 */
async function readManifestFromDisk(): Promise<WebsiteManifestPayload | null> {
  if (!import.meta.server) {
    if (process.dev) {
      console.warn('[useSiteManifest] readManifestFromDisk called on client');
    }
    return null;
  }

  try {
    const readFile = getBuiltinModule<(path: string, encoding: BufferEncoding) => Promise<string>>('node:fs/promises', 'readFile');
    const resolvePath = getBuiltinModule<(...parts: string[]) => string>('node:path', 'resolve');

    if (!readFile || !resolvePath) {
      if (process.dev) {
        console.warn('[useSiteManifest] Builtin module access is unavailable');
      }
      return null;
    }

    const manifestPath = resolvePath(process.cwd(), 'public', MANIFEST_FILE_NAME);
    const parsed = JSON.parse(await readFile(manifestPath, 'utf-8')) as WebsiteManifestPayload;

    if (process.dev) {
      console.info('[useSiteManifest] Loaded manifest from disk');
    }

    return parsed;
  } catch (err) {
    if (process.dev) {
      console.error('[useSiteManifest] Failed to read manifest from disk:', err);
    }
    return null;
  }
}

function getBuiltinModule<T>(moduleName: string, exportName: string): T | null {
  const loader = (process as typeof process & {
    getBuiltinModule?: (name: string) => Record<string, unknown> | undefined;
  }).getBuiltinModule;

  if (typeof loader !== 'function') {
    return null;
  }

  const mod = loader(moduleName);
  const value = mod?.[exportName];
  return typeof value === 'function' ? (value as T) : null;
}

// ============================================================================
// Validation
// ============================================================================

/**
 * Validate and normalize manifest data
 * Returns null for invalid/empty manifests instead of throwing
 */
function validateManifest(manifest: any): WebsiteManifestPayload | null {
  if (!manifest || typeof manifest !== 'object') {
    if (process.dev) {
      console.warn('[useSiteManifest] Manifest is not an object');
    }
    return null;
  }

  const normalizedSiteId = normalizeManifestSiteId(manifest);
  if (!normalizedSiteId) {
    if (process.dev) {
      console.warn('[useSiteManifest] Manifest has no valid siteId, skipping');
    }
    return null;
  }

  const normalizedTitle = normalizeManifestTitle(manifest);
  if (!normalizedTitle) {
    if (process.dev) {
      console.warn('[useSiteManifest] Manifest has no valid title, skipping');
    }
    return null;
  }

  const normalizedAssets = normalizeManifestAssets(manifest);
  const normalizedFavicon = normalizeManifestFavicon(manifest);
  const normalizedLogo = normalizeManifestLogo(manifest);

  // Return normalized manifest
  return {
    siteId: normalizedSiteId,
    title: normalizedTitle,
    description: normalizeManifestDescription(manifest),
    domain: normalizeManifestDomain(manifest),
    favicon: normalizedFavicon,
    logo: normalizedLogo,
    assets: normalizedAssets,
    metadata: normalizeManifestMetadata(manifest),
  };
}

function normalizeManifestSiteId(manifest: any): string {
  const candidates = [
    manifest.siteId,
    manifest.website,
    manifest.websiteId,
  ];

  for (const candidate of candidates) {
    if (typeof candidate === 'string' && candidate.trim()) {
      return candidate.trim();
    }
  }

  return '';
}

function normalizeManifestTitle(manifest: any): string {
  const meta = manifest.meta && typeof manifest.meta === 'object' ? manifest.meta : {};
  const metadata = manifest.metadata && typeof manifest.metadata === 'object' ? manifest.metadata : {};
  const candidates = [
    manifest.title,
    metadata.title,
    meta['application-name'],
    meta['apple-mobile-web-app-title'],
    meta.name,
  ];

  for (const candidate of candidates) {
    if (typeof candidate === 'string' && candidate.trim()) {
      return candidate.trim();
    }
  }

  return '';
}

function normalizeManifestDescription(manifest: any): string {
  const meta = manifest.meta && typeof manifest.meta === 'object' ? manifest.meta : {};
  const metadata = manifest.metadata && typeof manifest.metadata === 'object' ? manifest.metadata : {};
  const candidates = [
    manifest.description,
    metadata.description,
    meta.description,
  ];

  for (const candidate of candidates) {
    if (typeof candidate === 'string' && candidate.trim()) {
      return candidate.trim();
    }
  }

  return '';
}

function normalizeManifestDomain(manifest: any): string {
  const metadata = manifest.metadata && typeof manifest.metadata === 'object' ? manifest.metadata : {};
  const candidates = [
    manifest.domain,
    metadata.domain,
    metadata.baseUrl,
    metadata.siteUrl,
  ];

  for (const candidate of candidates) {
    if (typeof candidate === 'string' && candidate.trim()) {
      return candidate.trim();
    }
  }

  return '';
}

function normalizeManifestMetadata(manifest: any): Record<string, any> {
  const meta = manifest.meta && typeof manifest.meta === 'object' ? manifest.meta : {};
  const metadata = manifest.metadata && typeof manifest.metadata === 'object' ? manifest.metadata : {};

  return {
    ...meta,
    ...metadata,
  };
}

function normalizeManifestAssets(manifest: any): SiteAsset[] {
  const rawAssets = Array.isArray(manifest.assets)
    ? manifest.assets
    : Array.isArray(manifest.icons)
      ? manifest.icons
      : [];

  return rawAssets
    .map((asset: any) => {
      const path = normalizeAssetPath(asset?.path || asset?.url || asset?.s3Url || asset?.href || asset?.fileName);
      if (!path) return null;

      return {
        type: String(asset?.type || asset?.rel || 'asset'),
        url: path,
        path,
        size: typeof asset?.size === 'number' ? asset.size : undefined,
        mimeType: typeof asset?.mimeType === 'string' ? asset.mimeType : typeof asset?.type === 'string' && asset.type.includes('/') ? asset.type : undefined,
      };
    })
    .filter((asset): asset is SiteAsset => Boolean(asset));
}

function normalizeManifestFavicon(manifest: any): string | null {
  if (typeof manifest.favicon === 'string' && manifest.favicon.trim()) {
    return manifest.favicon.trim();
  }

  const icon = Array.isArray(manifest.icons)
    ? manifest.icons.find((entry: any) => entry?.rel === 'icon' || String(entry?.fileName || '').includes('favicon'))
    : null;

  return normalizeAssetPath(icon?.s3Url || icon?.href || icon?.path || icon?.fileName);
}

function normalizeManifestLogo(manifest: any): string | null {
  if (typeof manifest.logo === 'string' && manifest.logo.trim()) {
    return manifest.logo.trim();
  }

  const metadata = manifest.metadata && typeof manifest.metadata === 'object' ? manifest.metadata : {};
  const candidates = [metadata.logo, metadata.logoUrl, metadata.brandLogo];

  for (const candidate of candidates) {
    const normalized = normalizeAssetPath(candidate);
    if (normalized) return normalized;
  }

  return null;
}

function normalizeAssetPath(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return trimmed;
}

// ============================================================================
// Utility Functions (exported for use in theme components)
// ============================================================================

/**
 * Get asset URL by type from manifest
 */
export function getAssetFromManifest(
  manifest: WebsiteManifestPayload | null,
  assetType: string
): string | null {
  if (!manifest?.assets) return null;

  const asset = manifest.assets.find(a => a.type === assetType);
  return asset?.url || asset?.path || null;
}

/**
 * Get favicon URL from manifest
 */
export function getFaviconFromManifest(
  manifest: WebsiteManifestPayload | null
): string | null {
  return manifest?.favicon || getAssetFromManifest(manifest, 'favicon');
}

/**
 * Get logo URL from manifest
 */
export function getLogoFromManifest(
  manifest: WebsiteManifestPayload | null
): string | null {
  return manifest?.logo || getAssetFromManifest(manifest, 'logo');
}

/**
 * Check if manifest is loaded and valid
 */
export function isManifestLoaded(
  manifest: WebsiteManifestPayload | null
): manifest is WebsiteManifestPayload {
  return Boolean(manifest?.siteId && manifest?.title);
}

/**
 * Get current manifest state without fetching
 */
export function getManifestState(): WebsiteManifestPayload | null {
  return useState<WebsiteManifestPayload | null>(MANIFEST_STATE_KEY, () => null).value;
}

/**
 * Clear manifest state (useful for testing or logout)
 */
export function clearManifestState(): void {
  const state = useState<WebsiteManifestPayload | null>(MANIFEST_STATE_KEY, () => null);
  state.value = null;
}
