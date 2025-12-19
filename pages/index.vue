<template>
  <main>
    <Main :data="data" />
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
const slug = route.params.slug || null;

const { data, status, error } = await usePageData(siteId, slug);

// ---------- HEAD LOGIC ----------

// 1. Все необходимые данные
const pageHead = computed(() => data.value?.head || {});
const pageLang = computed(() => data.value?.lang || "en");
const pageDomain = computed(() => data.value?.domain || siteDomain);
const pageSlug = computed(() => data.value?.slug || "");

const globalHeadRaw = import.meta.server
  ? config.server.globalHead
  : config.public.globalHead;

// 2. Глобальные meta/link (из строки в объект)
const globalHead = {
  link: (globalHeadRaw || [])
    .filter(tag => tag.startsWith("<link"))
    .map(tag => Object.fromEntries(Array.from(tag.matchAll(/(\w+)=["'](.*?)["']/g)).map(([_, name, value]) => [name, value]))),
  meta: (globalHeadRaw || [])
    .filter(tag => tag.startsWith("<meta"))
    .map(tag => Object.fromEntries(Array.from(tag.matchAll(/(\w+)=["'](.*?)["']/g)).map(([_, name, value]) => [name, value]))),
};

// 3. Сбор всех meta с учетом robots и robots.metaTags
const headMeta = computed(() => {
  // 1. Базовые meta-теги (description, og, twitter)
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

  // Page meta (индивидуальные теги)
  const metaArray = Array.isArray(pageHead.value.meta) ? pageHead.value.meta : [];
  // Глобальные meta
  const globalMeta = globalHead.meta || [];
  // robots.metaTags (все из глобального robots-объекта)
  const robotsMetaTags = Array.isArray(data.value?.robots?.metaTags) ? data.value.robots.metaTags : [];

  // 1. Оставляем только один robots (приоритет: page meta > robots.metaTags)
  let robotsMeta = metaArray.find(m => m.key === "robots" && m.type === "name")
    || robotsMetaTags.find(m => m.name === "robots");

  // 2. Остальные robots.metaTags (кроме robots)
  const robotsOtherMeta = robotsMetaTags.filter(m => m.name !== "robots");

  // 3. Все meta из pageHead, кроме robots
  const metaWithoutRobots = metaArray.filter(m => m.key !== "robots");

  // 4. Добавляем robotsOtherMeta только если их нет в page meta и global meta
  // (по name)
  const usedNames = new Set([
    ...metaWithoutRobots.map(m => m.key),
    ...(globalMeta.map(m => m.name).filter(Boolean)),
  ]);
  const robotsOtherMetaFiltered = robotsOtherMeta.filter(m => !usedNames.has(m.name));

  // Итоговая сборка
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
      content: robotsMeta.content || robotsMeta.value // под разные форматы
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

// 4. Сбор всех link
const headLinks = computed(() => [
  { rel: "canonical", href: `${pageDomain.value}/` },
  { rel: "alternate", hreflang: pageLang.value, href: `${siteDomain}/` },
  ...(Array.isArray(data.value?.alters) ? data.value.alters.map(alter => ({
    rel: "alternate",
    hreflang: alter.hreflang,
    href: `${siteDomain}/${alter.slug}/`
  })) : []),
  ...(globalHead.link || []),
]);

// 5. Сбор всех script
const headScripts = computed(() => [
  // Facebook Pixel
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
  // Google Tag Manager
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

// 6. Сбор всех noscript
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

// 7. Один вызов useHead
// 9. Custom code blocks from Site
const headBlocks = computed(() => Array.isArray(data.value?.headCodeBlocks) ? data.value.headCodeBlocks : []);
const bodyBlocks = computed(() => Array.isArray(data.value?.bodyCodeBlocks) ? data.value.bodyCodeBlocks : []);

const extractCode = (html) => {
  if (!html) return "";
  let s = String(html);
  const match = s.match(/<pre[^>]*><code[^>]*>([\s\S]*?)<\/code><\/pre>/i);
  if (match) s = match[1];
  // decode common entities from legacy saved content
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

// 9a. Support head blocks of type 'html': split into meta/link/script/style/noscript
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

useHead({
  htmlAttrs: { lang: pageLang.value },
  title: pageHead.value.title || "Website",
  meta: [...headMeta.value, ...toHeadHtmlMeta.value],
  link: [...headLinks.value, ...toHeadHtmlLinks.value],
  script: [...headScripts.value, ...toHeadScripts.value, ...toHeadLdJson.value, ...toHeadHtmlScripts.value],
  style: [...toHeadStyles.value, ...toHeadHtmlStyles.value],
  noscript: [...headNoScripts.value, ...toHeadHtmlNoScripts.value],
});

// 8. Установи локаль, если нужно
if (data.value?.lang) {
  locale.value = data.value.lang;
}

// 10. Body SSR helpers
const bodyHtmlCodes = computed(() => bodyBlocks.value
  .filter(b => ['html', 'text', 'universal'].includes(b?.type))
  .map(b => extractCode(b.content))
);
const bodyJsCodes = computed(() => bodyBlocks.value
  .filter(b => b?.type === 'js')
  .map(b => extractCode(b.content))
);
</script>
