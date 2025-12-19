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
