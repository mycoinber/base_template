<script setup>
import { ref, useSSRContext, onMounted } from "vue";
import { parse } from "node-html-parser";

const props = defineProps({
  data: {
    type: Object,
    default: () => ({}),
  },
});

const ssrContext = import.meta.server ? useSSRContext() : null;
const contentHtml = ref("");

const parseHTML = (html) => {
  if (import.meta.server) {
    return parse(html);
  } else {
    const parser = new DOMParser();
    return parser.parseFromString(html, "text/html");
  }
};

const processHtmlContent = (htmlString) => {
  const doc = parseHTML(htmlString);
  return import.meta.server ? doc.toString() : doc.body.innerHTML;
};

if (import.meta.server && props.data.type === "section") {
  const modifiedHtml = processHtmlContent(props.data.content);
  ssrContext.modifiedHtml = modifiedHtml;
  contentHtml.value = modifiedHtml;
}

onMounted(() => {
  contentHtml.value =
    ssrContext?.modifiedHtml || processHtmlContent(props.data.content);
});

</script>

<template>
  <section :id="data._id" class="my-8 max-[541px]:my-4">
    <div class="container">
      <div class="flex flex-nowrap gap-8 w-full max-[541px]:flex-col">
        <div v-html="contentHtml" class="flex-1 [&_a]:text-color-01"></div>

        <div v-if="data.imageUrl?.length" class="flex-1 rounded-[0.625rem] overflow-hidden">
          <img :src="`/media${data.imageUrl[0]?.path || ''}`" :alt="data.imageUrl[0]?.alt || 'image'" class="w-full h-full object-cover" />
        </div>
      </div>
    </div>
  </section>
</template>

