import { computed, watch, type Ref } from 'vue';
import { useI18n } from 'vue-i18n';
import type { PageData } from '@/core/types/page';
import { useSeo } from './useSeo';
import { useSiteManifest } from './useSiteManifest';

interface HeadEntry {
  [key: string]: string | undefined;
}

interface UsePageDocumentOptions {
  slugFallback?: string | null;
  includeBreadcrumbs?: boolean;
  includeFAQ?: boolean;
  logLabel?: string;
}

interface UsePageDocumentReturn {
  bodyHtmlCodes: Ref<string[]>;
  bodyJsCodes: Ref<string[]>;
}

interface HeadPayload {
  meta: HeadEntry[];
  link: HeadEntry[];
}

export async function usePageDocument(
  pageData: Ref<PageData | null>,
  options: UsePageDocumentOptions = {},
): Promise<UsePageDocumentReturn> {
  const {
    slugFallback = '',
    includeBreadcrumbs = true,
    includeFAQ = true,
    logLabel = 'Page',
  } = options;

  const { locale } = useI18n();
  const url = useRequestURL();
  const siteDomain = `${url.protocol}//${url.host}`;
  const config = useRuntimeConfig();

  const { head, structuredData } = useSeo(pageData, {
    generateStructuredData: true,
    includeOpenGraph: true,
    includeTwitter: true,
    includeBreadcrumbs,
    includeFAQ,
    applyHead: false,
  });

  const { data: siteManifestRaw } = await useSiteManifest();

  const manifestHead = computed(() => manifestToHead(siteManifestRaw.value as any));
  const pageHead = computed(() => pageData.value?.head || {});
  const pageLang = computed(() => pageData.value?.lang || 'en');
  const pageDomain = computed(() => pageData.value?.domain || siteDomain);
  const pageSlug = computed(() => pageData.value?.slug || slugFallback || '');

  const globalHeadRaw = import.meta.server ? config.server.globalHead : config.public.globalHead;
  const globalHeadSource = Array.isArray(globalHeadRaw) ? globalHeadRaw : [];
  const globalHead = {
    link: globalHeadSource
      .filter((tag) => tag.startsWith('<link'))
      .map((tag) => Object.fromEntries(Array.from(tag.matchAll(/(\w+)=["'](.*?)["']/g)).map(([_, name, value]) => [name, value]))),
    meta: globalHeadSource
      .filter((tag) => tag.startsWith('<meta'))
      .map((tag) => Object.fromEntries(Array.from(tag.matchAll(/(\w+)=["'](.*?)["']/g)).map(([_, name, value]) => [name, value]))),
  };

  const headMeta = computed(() => {
    const baseMeta = Array.isArray(head.value.meta) ? [...head.value.meta] : [];
    const globalMeta = globalHead.meta || [];
    const manifestMetaEntries = manifestHead.value.meta || [];
    const robotsMetaTags = Array.isArray((pageData.value as any)?.robots?.metaTags)
      ? (pageData.value as any).robots.metaTags
      : Array.isArray(pageHead.value?.robots?.metaTags)
        ? pageHead.value.robots.metaTags
        : [];

    const manifestNames = manifestMetaEntries
      .map((entry) => entry?.name)
      .filter(Boolean);

    const usedNames = new Set([
      ...baseMeta.map((meta) => meta.name || meta.property || meta.httpEquiv).filter(Boolean),
      ...manifestNames,
      ...globalMeta.map((meta) => meta.name || meta.property || meta.httpEquiv).filter(Boolean),
    ]);

    const robotsOtherEntries = robotsMetaTags
      .map((meta) => {
        const name = meta?.name != null ? String(meta.name) : '';
        if (!name || usedNames.has(name)) return null;
        const content = toContentString(meta?.content ?? meta?.value);
        const entry: HeadEntry = { name };
        if (content !== undefined) entry.content = content;
        return entry;
      })
      .filter(Boolean) as HeadEntry[];

    return dedupeMeta([
      ...baseMeta,
      ...robotsOtherEntries,
      ...manifestMetaEntries,
      ...globalMeta,
    ]);
  });

  const headLinks = computed(() => {
    const baseLinks = Array.isArray(head.value.link) ? [...head.value.link] : [];
    const manifestLinks = manifestHead.value.link || [];
    const alternateLinks = Array.isArray((pageData.value as any)?.alters)
      ? (pageData.value as any).alters.map((alter: any) => ({
          rel: 'alternate',
          hreflang: alter.hreflang,
          href: `${siteDomain}/${alter.slug}/`,
        }))
      : [];

    const localeLink = pageLang.value
      ? [{ rel: 'alternate', hreflang: pageLang.value, href: `${siteDomain}/${pageSlug.value}` }]
      : [];

    return dedupeLinks([
      ...baseLinks,
      ...localeLink,
      ...alternateLinks,
      ...manifestLinks,
      ...(globalHead.link || []),
    ]);
  });

  const headScripts = computed(() => [
    ...(Array.isArray((pageData.value as any)?.pixel) && (pageData.value as any).pixel.length > 0 ? [{
      innerHTML: `
      !function(f,b,e,v,n,t,s)
      {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
      n.callMethod.apply(n,arguments):n.queue.push(arguments)};
      if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
      n.queue=[];t=b.createElement(e);t.async=!0;
      t.src=v;s=b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t,s)}(window, document,'script',
      'https://connect.facebook.net/en_US/fbevents.js');
      ${(pageData.value as any).pixel.map((pixelId: string) => `fbq('init', '${pixelId}');`).join('\n')}
      fbq('track', 'PageView');
    `,
      type: 'text/javascript',
    }] : []),
    ...(Array.isArray((pageData.value as any)?.gtm)
      ? (pageData.value as any).gtm.map((gtmId: string, index: number) => ({
          key: `gtm-script-${index}`,
          innerHTML: `
      (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
      new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
      j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
      'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
      })(window,document,'script','dataLayer','${gtmId}');
    `,
        }))
      : []),
  ]);

  const headNoScripts = computed(() => [
    ...(Array.isArray((pageData.value as any)?.pixel)
      ? (pageData.value as any).pixel.map((pixelId: string) => ({
          innerHTML: `
      <img height="1" width="1" style="display:none"
      src="https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1"/>
    `,
        }))
      : []),
    ...(Array.isArray((pageData.value as any)?.gtm)
      ? (pageData.value as any).gtm.map((gtmId: string, index: number) => ({
          key: `gtm-noscript-${index}`,
          innerHTML: `
      <iframe src="https://www.googletagmanager.com/ns.html?id=${gtmId}"
      height="0" width="0" style="display:none;visibility:hidden"></iframe>
    `,
        }))
      : []),
  ]);

  useHead({
    htmlAttrs: { lang: pageLang.value },
    title: pageHead.value.title || head.value.title || 'Website',
    meta: headMeta.value,
    link: headLinks.value,
    script: headScripts.value,
    noscript: headNoScripts.value,
  });

  if (pageData.value?.lang) {
    locale.value = pageData.value.lang;
  }

  const headBlocks = computed(() => Array.isArray((pageData.value as any)?.headCodeBlocks) ? (pageData.value as any).headCodeBlocks : []);
  const bodyBlocks = computed(() => Array.isArray((pageData.value as any)?.bodyCodeBlocks) ? (pageData.value as any).bodyCodeBlocks : []);

  const headHtmlBlocks = computed(() => headBlocks.value
    .filter((block: any) => block?.type === 'html')
    .map((block: any) => extractCode(block.content))
  );

  const toHeadScripts = computed(() => headBlocks.value
    .filter((block: any) => block?.type === 'js')
    .map((block: any, index: number) => ({ key: `head-js-${index}`, innerHTML: extractCode(block.content), type: 'text/javascript' }))
  );

  const toHeadStyles = computed(() => headBlocks.value
    .filter((block: any) => block?.type === 'css')
    .map((block: any, index: number) => ({ key: `head-css-${index}`, children: extractCode(block.content) }))
  );

  const toHeadLdJson = computed(() => headBlocks.value
    .filter((block: any) => block?.type === 'blocks')
    .map((block: any, index: number) => ({ key: `head-ld-${index}`, type: 'application/ld+json', children: extractCode(block.content) }))
  );

  const toHeadHtmlScripts = computed(() => {
    const result: Record<string, string>[] = [];
    const pattern = /<script([^>]*)>([\s\S]*?)<\/script>/gi;

    for (const html of headHtmlBlocks.value) {
      let match: RegExpExecArray | null;
      while ((match = pattern.exec(html))) {
        const attrs = parseAttrs(match[1] || '');
        const children = (match[2] || '').trim();
        const entry: Record<string, string> = { ...attrs };
        if (children) entry.innerHTML = children;
        result.push(entry);
      }
    }

    return result;
  });

  const toHeadHtmlStyles = computed(() => {
    const result: Record<string, string>[] = [];
    const pattern = /<style([^>]*)>([\s\S]*?)<\/style>/gi;

    for (const html of headHtmlBlocks.value) {
      let match: RegExpExecArray | null;
      while ((match = pattern.exec(html))) {
        const attrs = parseAttrs(match[1] || '');
        const children = (match[2] || '').trim();
        result.push({ ...attrs, children });
      }
    }

    return result;
  });

  const toHeadHtmlMeta = computed(() => {
    const result: Record<string, string>[] = [];
    const pattern = /<meta([^>]*)>/gi;

    for (const html of headHtmlBlocks.value) {
      let match: RegExpExecArray | null;
      while ((match = pattern.exec(html))) {
        const attrs = parseAttrs(match[1] || '');
        if (Object.keys(attrs).length) result.push(attrs);
      }
    }

    return result;
  });

  const toHeadHtmlLinks = computed(() => {
    const result: Record<string, string>[] = [];
    const pattern = /<link([^>]*)>/gi;

    for (const html of headHtmlBlocks.value) {
      let match: RegExpExecArray | null;
      while ((match = pattern.exec(html))) {
        const attrs = parseAttrs(match[1] || '');
        if (Object.keys(attrs).length) result.push(attrs);
      }
    }

    return result;
  });

  const toHeadHtmlNoScripts = computed(() => {
    const result: Array<{ innerHTML: string }> = [];
    const pattern = /<noscript>([\s\S]*?)<\/noscript>/gi;

    for (const html of headHtmlBlocks.value) {
      let match: RegExpExecArray | null;
      while ((match = pattern.exec(html))) {
        const children = (match[1] || '').trim();
        if (children) result.push({ innerHTML: children });
      }
    }

    return result;
  });

  useHead({
    meta: toHeadHtmlMeta.value,
    link: toHeadHtmlLinks.value,
    script: [...toHeadScripts.value, ...toHeadLdJson.value, ...toHeadHtmlScripts.value],
    style: [...toHeadStyles.value, ...toHeadHtmlStyles.value],
    noscript: toHeadHtmlNoScripts.value,
  });

  const bodyHtmlCodes = computed(() => bodyBlocks.value
    .filter((block: any) => ['html', 'text', 'universal'].includes(block?.type))
    .map((block: any) => extractCode(block.content))
  );

  const bodyJsCodes = computed(() => bodyBlocks.value
    .filter((block: any) => block?.type === 'js')
    .map((block: any) => extractCode(block.content))
  );

  if (process.dev) {
    watch(() => structuredData.value, (schemas) => {
      console.info(`[${logLabel}] Structured data:`, schemas);
    }, { immediate: true });
  }

  return {
    bodyHtmlCodes,
    bodyJsCodes,
  };
}

function toContentString(value: unknown) {
  return value == null ? undefined : String(value);
}

function dedupeMeta(items: HeadEntry[]) {
  const map = new Map<string, boolean>();
  const result: HeadEntry[] = [];

  for (const item of items) {
    if (!item) continue;

    const key =
      typeof item.name === 'string' && item.name.length
        ? `name:${item.name}`
        : typeof item.property === 'string' && item.property.length
          ? `property:${item.property}`
          : typeof item.httpEquiv === 'string' && item.httpEquiv.length
            ? `httpEquiv:${item.httpEquiv}`
            : null;

    if (key) {
      if (map.has(key)) continue;
      map.set(key, true);
    }

    result.push(item);
  }

  return result;
}

function dedupeLinks(items: HeadEntry[]) {
  const map = new Map<string, boolean>();
  const result: HeadEntry[] = [];

  for (const item of items) {
    if (!item) continue;

    const rel = typeof item.rel === 'string' ? item.rel : '';
    const href = typeof item.href === 'string' ? item.href : '';
    const key = rel ? `${rel}|${href}` : href;

    if (key) {
      if (map.has(key)) continue;
      map.set(key, true);
    }

    result.push(item);
  }

  return result;
}

function extractCode(html: unknown) {
  if (!html) return '';

  let content = String(html);
  const match = content.match(/<pre[^>]*><code[^>]*>([\s\S]*?)<\/code><\/pre>/i);
  if (match) content = match[1];

  if (/&lt;|&gt;|&amp;|&quot;|&#039;/.test(content)) {
    content = content
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#039;/g, "'");
  }

  return content;
}

function parseAttrs(source = '') {
  const attrs: Record<string, string> = {};
  const pattern = /(\w[\w:-]*)\s*=\s*("([^"]*)"|'([^']*)'|([^\s>]+))/g;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(source))) {
    const key = match[1];
    const value = match[3] ?? match[4] ?? match[5] ?? '';
    attrs[key] = value;
  }

  return attrs;
}

function manifestToHead(manifest?: any): HeadPayload {
  if (!manifest || typeof manifest !== 'object') {
    return { meta: [], link: [] };
  }

  const meta: HeadEntry[] = [];
  const link: HeadEntry[] = [];
  const rawMeta = manifest.meta || manifest.metadata;
  const rawIcons = manifest.icons || manifest.assets;

  if (rawMeta && typeof rawMeta === 'object') {
    for (const [rawKey, rawValue] of Object.entries(rawMeta)) {
      const key = rawKey?.trim();
      const value = normalizeMetaValue(rawValue);

      if (!key || value == null) continue;
      meta.push({ name: key, content: value });
    }
  }

  if (Array.isArray(rawIcons)) {
    for (const icon of rawIcons) {
      const href = normalizeIconHref(icon);
      if (!href) continue;

      const entry: HeadEntry = {
        rel: icon?.rel || 'icon',
        href,
      };

      if (icon?.type || icon?.mimeType) entry.type = String(icon.type || icon.mimeType);
      if (icon?.sizes || icon?.size) entry.sizes = String(icon.sizes || icon.size);
      if (icon?.media) entry.media = String(icon.media);
      if (icon?.purpose) entry.purpose = String(icon.purpose);

      link.push(entry);
    }
  }

  return { meta, link };
}

function normalizeMetaValue(value: unknown) {
  if (value == null) return null;

  const stringValue = String(value).trim();
  if (!stringValue) return null;

  if (stringValue.startsWith('#') || /^https?:\/\//i.test(stringValue) || stringValue.startsWith('data:')) {
    return stringValue;
  }

  const extensionMatch = stringValue.match(/\.([a-z0-9]+)(?:\?|$)/i);
  if (!extensionMatch) return stringValue;

  const extension = extensionMatch[1]?.toLowerCase();
  if (!extension || !assetExtensions.has(extension)) return stringValue;

  const filename = extractFileName(stringValue);
  return filename ? `/${filename}` : `/${stringValue.replace(/^\/+/, '')}`;
}

function normalizeIconHref(icon: any) {
  if (!icon || typeof icon !== 'object') return null;

  const candidate = icon.fileName || icon.s3Url || icon.href || icon.path || icon.url;
  if (!candidate) return null;

  if (/^https?:\/\//i.test(candidate) || String(candidate).startsWith('data:')) {
    return String(candidate);
  }

  const filename = extractFileName(String(candidate));
  return filename ? `/${filename}` : `/${String(candidate).replace(/^\/+/, '')}`;
}

function extractFileName(path: string) {
  const trimmed = path.trim().replace(/\?.*$/, '');
  if (!trimmed) return null;

  const parts = trimmed.split('/');
  const last = parts[parts.length - 1];
  return last ? last.replace(/^\/+/, '') : null;
}

const assetExtensions = new Set([
  'png',
  'svg',
  'ico',
  'json',
  'xml',
  'webmanifest',
]);
