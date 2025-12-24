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
import { manifestToHead } from "~/utils/manifestHead";
import { dedupeLinks, dedupeMeta, toContentString } from "~/utils/headUtils";

const { locale } = useI18n();
const url = useRequestURL();
const siteDomain = `${url.protocol}//${url.host}`;
const config = useRuntimeConfig();
const route = useRoute();

const siteId = import.meta.server ? config.server.siteId : config.public.siteId;
const slug = route.params.slug || null;

const { data, status, error } = await usePageData(siteId, slug);

const { data: siteManifestRaw } = await useFetch("/site-manifest.json", {
  key: "site-manifest",
  server: true,
  default: () => null,
});

const manifestHead = computed(() => manifestToHead(siteManifestRaw.value));

const pageHead = computed(() => data.value?.head || {});
const pageLang = computed(() => data.value?.lang || "en");
const pageDomain = computed(() => data.value?.domain || siteDomain);
const pageSlug = computed(() => data.value?.slug || "");

const globalHeadRaw = import.meta.server ? config.server.globalHead : config.public.globalHead;
const globalHeadSource = Array.isArray(globalHeadRaw) ? globalHeadRaw : [];
const globalHead = {
  link: globalHeadSource
    .filter(tag => tag.startsWith("<link"))
    .map(tag => Object.fromEntries(Array.from(tag.matchAll(/(\w+)=["'](.*?)["']/g)).map(([_, name, value]) => [name, value]))),
  meta: globalHeadSource
    .filter(tag => tag.startsWith("<meta"))
    .map(tag => Object.fromEntries(Array.from(tag.matchAll(/(\w+)=["'](.*?)["']/g)).map(([_, name, value]) => [name, value]))),
};

const headMeta = computed(() => {
  const baseMeta = [
    { name: "description", content: toContentString(pageHead.value.description) },
    { name: "keywords", content: toContentString(pageHead.value.keywords) },
    { property: "og:title", content: toContentString(pageHead.value.title) },
    { property: "og:description", content: toContentString(pageHead.value.description) },
    { property: "og:image", content: toContentString(data.value?.article?.introImage?.[0]?.path) },
    { property: "og:url", content: toContentString(`${pageDomain.value}/${pageSlug.value}`) },
    { property: "og:type", content: "article" },
    { property: "og:locale", content: toContentString(pageLang.value) },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: toContentString(pageHead.value.title) },
    { name: "twitter:description", content: toContentString(pageHead.value.description) },
    { name: "twitter:image", content: toContentString(data.value?.article?.introImage?.[0]?.path) },
  ];

  const metaArray = Array.isArray(pageHead.value.meta) ? pageHead.value.meta : [];
  const globalMeta = globalHead.meta || [];
  const manifestMetaEntries = manifestHead.value.meta || [];
  const robotsMetaTags = Array.isArray(data.value?.robots?.metaTags) ? data.value.robots.metaTags : [];

  let robotsMeta = metaArray.find(m => m.key === "robots" && m.type === "name")
    || robotsMetaTags.find(m => m.name === "robots");

  const metaWithoutRobots = metaArray.filter(m => m.key !== "robots");
  const robotsOtherMeta = robotsMetaTags.filter(m => m.name !== "robots");

  const manifestNames = manifestMetaEntries
    .map(entry => entry?.name)
    .filter(Boolean);

  const usedNames = new Set([
    ...metaWithoutRobots.map(m => m.key),
    ...manifestNames,
    ...(globalMeta.map(m => m.name).filter(Boolean)),
  ]);
  const robotsOtherMetaFiltered = robotsOtherMeta.filter(m => !usedNames.has(m.name));

  const pageMetaEntries = metaWithoutRobots
    .map(m => {
      const attrName = m?.type === "property" ? "property" : m?.type === "httpEquiv" ? "httpEquiv" : "name";
      const attrValue = m?.key != null ? String(m.key) : "";
      if (!attrName || !attrValue) return null;
      const entry = { [attrName]: attrValue };
      const content = toContentString(m?.content);
      if (content !== undefined) entry.content = content;
      return entry;
    })
    .filter(Boolean);

  const robotsEntry = robotsMeta
    ? [{
        name: "robots",
        content: toContentString(robotsMeta.content ?? robotsMeta.value),
      }].filter(item => item.content !== undefined)
    : [];

  const robotsOtherEntries = robotsOtherMetaFiltered
    .map(m => {
      const name = m?.name != null ? String(m.name) : "";
      if (!name) return null;
      const content = toContentString(m?.content ?? m?.value);
      const entry = { name };
      if (content !== undefined) entry.content = content;
      return entry;
    })
    .filter(Boolean);

  const combined = [
    ...baseMeta,
    ...pageMetaEntries,
    ...robotsEntry,
    ...robotsOtherEntries,
    ...manifestMetaEntries,
    ...globalMeta,
  ].filter(Boolean);

  return dedupeMeta(combined);
});

const headLinks = computed(() => {
  const manifestLinks = manifestHead.value.link || [];
  const alternateLinks = Array.isArray(data.value?.alters)
    ? data.value.alters.map(alter => ({
        rel: "alternate",
        hreflang: alter.hreflang,
        href: `${siteDomain}/${alter.slug}/`,
      }))
    : [];

  const combined = [
    { rel: "canonical", href: `${pageDomain.value}/${pageSlug.value}` },
    { rel: "alternate", hreflang: pageLang.value, href: `${siteDomain}/${pageSlug.value}` },
    ...alternateLinks,
    ...manifestLinks,
    ...(globalHead.link || []),
  ].filter(Boolean);

  return dedupeLinks(combined);
});

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

const extractCode = (html) => {
  if (!html) return "";
  let s = String(html);
  const match = s.match(/<pre[^>]*><code[^>]*>([\s\S]*?)<\/code><\/pre>/i);
  if (match) s = match[1];
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

if (data.value?.lang) {
  locale.value = data.value.lang;
}

const headBlocks = computed(() => Array.isArray(data.value?.headCodeBlocks) ? data.value.headCodeBlocks : []);
const bodyBlocks = computed(() => Array.isArray(data.value?.bodyCodeBlocks) ? data.value.bodyCodeBlocks : []);

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

useHead({
  meta: toHeadHtmlMeta.value,
  link: toHeadHtmlLinks.value,
  script: [...toHeadScripts.value, ...toHeadLdJson.value, ...toHeadHtmlScripts.value],
  style: [...toHeadStyles.value, ...toHeadHtmlStyles.value],
  noscript: toHeadHtmlNoScripts.value,
});

const bodyHtmlCodes = computed(() => bodyBlocks.value
  .filter(b => ['html', 'text', 'universal'].includes(b?.type))
  .map(b => extractCode(b.content))
);
const bodyJsCodes = computed(() => bodyBlocks.value
  .filter(b => b?.type === 'js')
  .map(b => extractCode(b.content))
);
</script>
