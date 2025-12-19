<template>
  <main>
    <Main v-if="data?.type" :data="data" />
  </main>
  <!-- SSR-rendered body code blocks -->
  <div v-for="(code, i) in bodyHtmlCodes" :key="'bh-'+i" v-html="code" />
  <component v-for="(code, i) in bodyJsCodes" :key="'bjs-'+i" :is="'script'" type="text/javascript">{{ code }}</component>
</template>

<script setup>
import { useI18n } from "vue-i18n";
const { locale } = useI18n();
const url = useRequestURL();
const siteDomain = `${url.protocol}//${url.host}`;
const config = useRuntimeConfig();
const route = useRoute();

const siteId = import.meta.server ? config.server.siteId : config.public.siteId;

// Сборка slug-а из catch-all
const rawSlug = route.params.slug;

const slugArray = Array.isArray(rawSlug)
  ? rawSlug
  : typeof rawSlug === "string"
    ? rawSlug.split("/")
    : [];

const slug = slugArray[slugArray.length - 1] || "";
// Получаем данные страницы
const { data, status, error } = await usePageData(siteId, slug);

// --- HEAD LOGIC ---

const pageHead = computed(() => data.value?.head || {});
const pageLang = computed(() => data.value?.lang || "en");
const pageDomain = computed(() => data.value?.domain || siteDomain);
const pageSlug = computed(() => data.value?.slug || slug || "");

// Парсим глобальные <meta> и <link>
const globalHeadRaw = import.meta.server ? config.server.globalHead : config.public.globalHead;
const globalHead = {
  link: (globalHeadRaw || [])
    .filter(tag => tag.startsWith("<link"))
    .map(tag => Object.fromEntries(Array.from(tag.matchAll(/(\w+)=["'](.*?)["']/g)).map(([_, name, value]) => [name, value]))),
  meta: (globalHeadRaw || [])
    .filter(tag => tag.startsWith("<meta"))
    .map(tag => Object.fromEntries(Array.from(tag.matchAll(/(\w+)=["'](.*?)["']/g)).map(([_, name, value]) => [name, value]))),
};

// === Универсальный headMeta с поддержкой robots.metaTags ===
const headMeta = computed(() => {
  const baseMeta = [
    { name: "description", content: pageHead.value.description },
    { name: "keywords", content: pageHead.value.keywords },
    { property: "og:title", content: pageHead.value.title },
    { property: "og:description", content: pageHead.value.description },
    { property: "og:image", content: data.value?.article?.introImage?.[0]?.path },
    { property: "og:url", content: `${pageDomain.value}/${pageSlug.value}` },
    { property: "og:type", content: "article" },
    { property: "og:locale", content: pageLang.value },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: pageHead.value.title },
    { name: "twitter:description", content: pageHead.value.description },
    { name: "twitter:image", content: data.value?.article?.introImage?.[0]?.path },
  ];

  const metaArray = Array.isArray(pageHead.value.meta) ? pageHead.value.meta : [];
  const globalMeta = globalHead.meta || [];
  const robotsMetaTags = Array.isArray(data.value?.robots?.metaTags) ? data.value.robots.metaTags : [];

  // Оставляем только один robots (приоритет: page meta > robots.metaTags)
  let robotsMeta = metaArray.find(m => m.key === "robots" && m.type === "name")
    || robotsMetaTags.find(m => m.name === "robots");

  const metaWithoutRobots = metaArray.filter(m => m.key !== "robots");
  const robotsOtherMeta = robotsMetaTags.filter(m => m.name !== "robots");
  const usedNames = new Set([
    ...metaWithoutRobots.map(m => m.key),
    ...(globalMeta.map(m => m.name).filter(Boolean)),
  ]);
  const robotsOtherMetaFiltered = robotsOtherMeta.filter(m => !usedNames.has(m.name));

  // sanitize and coerce to strings to avoid Unhead errors
  const result = [
    ...baseMeta,
    ...metaWithoutRobots
      .map(m => {
        const attrName = m?.type === "property" ? "property" : m?.type === "httpEquiv" ? "httpEquiv" : "name";
        const attrValue = m?.key != null ? String(m.key) : "";
        if (!attrName || !attrValue) return null;
        return {
          [attrName]: attrValue,
          content: m?.content != null ? String(m.content) : undefined,
        };
      })
      .filter(Boolean),
    ...(robotsMeta ? [{
      name: "robots",
      content: robotsMeta.content || robotsMeta.value
    }] : []),
    ...robotsOtherMetaFiltered
      .map(m => ({
        name: m?.name != null ? String(m.name) : "",
        content: m?.content != null ? String(m.content) : undefined,
      }))
      .filter(m => m.name),
    ...globalMeta
  ];
  return result;
});

const headLinks = computed(() => [
  { rel: "canonical", href: `${pageDomain.value}/${pageSlug.value}` },
  { rel: "alternate", hreflang: pageLang.value, href: `${siteDomain}/${pageSlug.value}` },
  ...(Array.isArray(data.value?.alters) ? data.value.alters.map(alter => ({
    rel: "alternate",
    hreflang: alter.hreflang,
    href: `${siteDomain}/${alter.slug}/`
  })) : []),
  ...(globalHead.link || []),
]);

const headScripts = computed(() => [
  ...(Array.isArray(data.value?.pixel) && data.value.pixel.length > 0 ? [{
    innerHTML: `
      !function(f,b,e,v,n,t,s)
      {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
      n.callMethod.apply(n,arguments):n.queue.push(arguments)};
      if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
      n.queue=[];t=b.createElement(e);t.async=!0;
      t.src=v;s=b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t,s)}(window, document,'script',
      'https://connect.facebook.net/en_US/fbevents.js');
      ${data.value.pixel.map(pixelId => `fbq('init', '${pixelId}');`).join('\n')}
      fbq('track', 'PageView');
    `,
    type: "text/javascript"
  }] : []),
  ...(Array.isArray(data.value?.gtm) ? data.value.gtm.map((gtmId, index) => ({
    key: `gtm-script-${index}`,
    innerHTML: `
      (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
      new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
      j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
      'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
      })(window,document,'script','dataLayer','${gtmId}');
    `
  })) : [])
]);

const headNoScripts = computed(() => [
  ...(Array.isArray(data.value?.pixel) ? data.value.pixel.map(pixelId => ({
    innerHTML: `
      <img height="1" width="1" style="display:none"
      src="https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1"/>
    `
  })) : []),
  ...(Array.isArray(data.value?.gtm) ? data.value.gtm.map((gtmId, index) => ({
    key: `gtm-noscript-${index}`,
    innerHTML: `
      <iframe src="https://www.googletagmanager.com/ns.html?id=${gtmId}"
      height="0" width="0" style="display:none;visibility:hidden"></iframe>
    `
  })) : [])
]);

useHead({
  htmlAttrs: { lang: pageLang.value },
  title: pageHead.value.title || "Website",
  meta: headMeta.value,
  link: headLinks.value,
  script: headScripts.value,
  noscript: headNoScripts.value,
});

if (data.value?.lang) {
  locale.value = data.value.lang;
}

// --- Site-level custom code blocks ---
const headBlocks = computed(() => Array.isArray(data.value?.headCodeBlocks) ? data.value.headCodeBlocks : []);
const bodyBlocks = computed(() => Array.isArray(data.value?.bodyCodeBlocks) ? data.value.bodyCodeBlocks : []);

const extractCode = (html) => {
  if (!html) return "";
  let s = String(html);
  const m = s.match(/<pre[^>]*><code[^>]*>([\s\S]*?)<\/code><\/pre>/i);
  if (m) s = m[1];
  if (/&lt;|&gt;|&amp;|&quot;|&#039;/.test(s)) {
    s = s
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&amp;/g, "&")
      .replace(/&quot;/g, '"')
      .replace(/&#039;/g, "'");
  }
  return s;
};

const toHeadScripts = computed(() => headBlocks.value
  .filter(b => b?.type === 'js')
  .map((b, i) => ({ key: `head-js-${i}` , innerHTML: extractCode(b.content), type: 'text/javascript' }))
);
const toHeadStyles = computed(() => headBlocks.value
  .filter(b => b?.type === 'css')
  .map((b, i) => ({ key: `head-css-${i}`, children: extractCode(b.content) }))
);
const toHeadLdJson = computed(() => headBlocks.value
  .filter(b => b?.type === 'blocks')
  .map((b, i) => ({ key: `head-ld-${i}`, type: 'application/ld+json', children: extractCode(b.content) }))
);

// Support head custom HTML blocks: extract meta/link/script/style/noscript
const headHtmlBlocks = computed(() => headBlocks.value
  .filter(b => b?.type === 'html')
  .map(b => extractCode(b.content))
);

const parseAttrs = (str = '') => {
  const attrs = {};
  const re = /(\w[\w:-]*)\s*=\s*("([^"]*)"|'([^']*)'|([^\s>]+))/g;
  let m;
  while ((m = re.exec(str))) {
    const key = m[1];
    const val = m[3] ?? m[4] ?? m[5] ?? '';
    attrs[key] = val;
  }
  return attrs;
};

const toHeadHtmlScripts = computed(() => {
  const res = [];
  const re = /<script([^>]*)>([\s\S]*?)<\/script>/gi;
  for (const html of headHtmlBlocks.value) {
    let m;
    while ((m = re.exec(html))) {
      const attrs = parseAttrs(m[1] || '');
      const children = (m[2] || '').trim();
      const entry = { ...attrs };
      if (children) entry.innerHTML = children;
      res.push(entry);
    }
  }
  return res;
});

const toHeadHtmlStyles = computed(() => {
  const res = [];
  const re = /<style([^>]*)>([\s\S]*?)<\/style>/gi;
  for (const html of headHtmlBlocks.value) {
    let m;
    while ((m = re.exec(html))) {
      const attrs = parseAttrs(m[1] || '');
      const children = (m[2] || '').trim();
      res.push({ ...attrs, children });
    }
  }
  return res;
});

const toHeadHtmlMeta = computed(() => {
  const res = [];
  const re = /<meta([^>]*)>/gi;
  for (const html of headHtmlBlocks.value) {
    let m;
    while ((m = re.exec(html))) {
      const attrs = parseAttrs(m[1] || '');
      if (Object.keys(attrs).length) res.push(attrs);
    }
  }
  return res;
});

const toHeadHtmlLinks = computed(() => {
  const res = [];
  const re = /<link([^>]*)>/gi;
  for (const html of headHtmlBlocks.value) {
    let m;
    while ((m = re.exec(html))) {
      const attrs = parseAttrs(m[1] || '');
      if (Object.keys(attrs).length) res.push(attrs);
    }
  }
  return res;
});

const toHeadHtmlNoScripts = computed(() => {
  const res = [];
  const re = /<noscript>([\s\S]*?)<\/noscript>/gi;
  for (const html of headHtmlBlocks.value) {
    let m;
    while ((m = re.exec(html))) {
      const children = (m[1] || '').trim();
      if (children) res.push({ innerHTML: children });
    }
  }
  return res;
});

// Merge additional head assets from code blocks
useHead({
  meta: toHeadHtmlMeta.value,
  link: toHeadHtmlLinks.value,
  script: [...toHeadScripts.value, ...toHeadLdJson.value, ...toHeadHtmlScripts.value],
  style: [...toHeadStyles.value, ...toHeadHtmlStyles.value],
  noscript: toHeadHtmlNoScripts.value,
});

// Body code prepared for SSR rendering
const bodyHtmlCodes = computed(() => bodyBlocks.value
  .filter(b => ['html', 'text', 'universal'].includes(b?.type))
  .map(b => extractCode(b.content))
);
const bodyJsCodes = computed(() => bodyBlocks.value
  .filter(b => b?.type === 'js')
  .map(b => extractCode(b.content))
);

// SSR редирект
if (data.value?.redirect?.to && import.meta.server) {
  await navigateTo(data.value.redirect.to, { redirectCode: data.value.redirect.statusCode || 301 });
}
</script>
