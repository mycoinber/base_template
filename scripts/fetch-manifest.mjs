#!/usr/bin/env node

import { fileURLToPath } from 'node:url';
import { dirname, join, basename, extname } from 'node:path';
import { existsSync, readFileSync } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');
const publicDir = join(projectRoot, 'public');

loadEnvFile(join(projectRoot, '.env'));

const siteId = (process.env.SITE_ID || '').trim();
const manifestUrl = resolveManifestUrl();
const storageBase = (process.env.MEDIA_STORAGE_URL || '').trim().replace(/\/$/, '');

if (!manifestUrl) {
  console.error('[fetch-manifest] MANIFEST_URL or SITE_ID/BACK_HOST must be provided');
  process.exit(1);
}

console.log(`[fetch-manifest] Fetching manifest from ${manifestUrl}`);

const manifestResponse = await fetch(manifestUrl, {
  headers: { accept: 'application/json' },
});

if (!manifestResponse.ok) {
  console.error(
    `[fetch-manifest] Failed to fetch manifest: ${manifestResponse.status} ${manifestResponse.statusText}`,
  );
  process.exit(1);
}

const manifest = await manifestResponse.json();

const assets = collectAssetsFromManifest(manifest, storageBase);

if (!assets.size) {
  console.warn('[fetch-manifest] No assets discovered in manifest');
  process.exit(0);
}

await mkdir(publicDir, { recursive: true });

let successCount = 0;
for (const [targetName, sourceUrl] of assets.entries()) {
  console.log(`[fetch-manifest] Downloading ${sourceUrl} → ${targetName}`);
  try {
    await downloadAsset(sourceUrl, join(publicDir, targetName));
    successCount += 1;
  } catch (error) {
    console.error(`[fetch-manifest] Failed to download ${sourceUrl}:`, error);
    process.exit(1);
  }
}

console.log(`[fetch-manifest] Downloaded ${successCount} asset(s) to ${publicDir}`);

function resolveManifestUrl() {
  const explicit = (process.env.MANIFEST_URL || '').trim();
  if (explicit) {
    return explicit;
  }

  const backHost = (process.env.BACK_HOST || process.env.BACK_HOST_SV || '').trim();
  if (!siteId || !backHost) {
    return null;
  }

  const normalizedHost = backHost.replace(/\/$/, '');
  return `${normalizedHost}/pages/${siteId}/manifest`;
}

function collectAssetsFromManifest(manifestPayload, storageBaseUrl) {
  const assetMap = new Map();

  const addAsset = (source, target) => {
    if (!source || !target) {
      return;
    }
    assetMap.set(target, source);
  };

  const icons = Array.isArray(manifestPayload?.icons) ? manifestPayload.icons : [];
  for (const icon of icons) {
    const rawUrl = icon?.s3Url || icon?.href;
    const resolved = resolveAssetUrl(rawUrl, storageBaseUrl);
    const filename = icon?.fileName || (rawUrl ? basename(rawUrl) : null);
    addAsset(resolved, filename);
  }

  const allowedExtensions = new Set([
    '.png',
    '.svg',
    '.ico',
    '.json',
    '.xml',
    '.webmanifest',
  ]);
  const metaEntries = manifestPayload?.meta && typeof manifestPayload.meta === 'object'
    ? Object.entries(manifestPayload.meta)
    : [];
  for (const [, value] of metaEntries) {
    if (typeof value !== 'string') {
      continue;
    }
    const trimmed = value.trim();
    if (!trimmed) {
      continue;
    }
    const ext = extname(trimmed).toLowerCase();
    if (!allowedExtensions.has(ext)) {
      continue;
    }
    const resolved = resolveAssetUrl(trimmed, storageBaseUrl);
    addAsset(resolved, basename(trimmed));
  }

  return assetMap;
}

async function downloadAsset(sourceUrl, destinationPath) {
  if (!/^https?:\/\//i.test(sourceUrl)) {
    throw new Error(`Only http/https sources supported. Received: ${sourceUrl}`);
  }

  const response = await fetch(sourceUrl);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} ${response.statusText}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  await writeFile(destinationPath, Buffer.from(arrayBuffer));
}

function resolveAssetUrl(rawUrl, storageBaseUrl) {
  if (!rawUrl) {
    return null;
  }

  if (/^https?:\/\//i.test(rawUrl)) {
    return rawUrl;
  }

  if (!storageBaseUrl) {
    throw new Error(
      `MEDIA_STORAGE_URL is required to resolve relative asset path: ${rawUrl}`,
    );
  }

  return `${storageBaseUrl}${rawUrl}`;
}

function loadEnvFile(envPath) {
  if (!existsSync(envPath)) {
    return;
  }

  const content = readFileSync(envPath, 'utf-8');
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }

    const eqIndex = trimmed.indexOf('=');
    if (eqIndex === -1) {
      continue;
    }

    const key = trimmed.slice(0, eqIndex).trim();
    if (!key || key in process.env) {
      continue;
    }

    let value = trimmed.slice(eqIndex + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    process.env[key] = value;
  }
}
