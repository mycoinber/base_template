<script setup>
import { onMounted, ref, useSSRContext } from 'vue';
import { parse } from 'node-html-parser';

const props = defineProps({
  block: {
    type: Object,
    default: () => ({}),
  },
  page: {
    type: Object,
    default: () => ({}),
  },
});

const ssrContext = import.meta.server ? useSSRContext() : null;
const contentHtml = ref('');

const parseHTML = (html) => {
  if (!html) return '';
  if (import.meta.server) {
    const doc = parse(html);
    return doc.toString();
  }
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  return doc.body.innerHTML;
};

const updateHtml = () => {
  const raw = props.block?.content || '';
  contentHtml.value = parseHTML(raw);
};

if (import.meta.server) {
  ssrContext && (ssrContext[`block-${props.block?._id}`] = contentHtml.value);
  updateHtml();
} else {
  onMounted(updateHtml);
}

const image = computed(() => {
  if (Array.isArray(props.block?.imageUrl) && props.block.imageUrl.length) {
    return props.block.imageUrl[0];
  }
  if (props.block?.image && props.block.image.path) return props.block.image;
  return null;
});
</script>

<template>
  <section :id="block._id" class="my-8 max-[541px]:my-4">
    <div class="container">
      <div class="flex flex-nowrap gap-8 w-full max-[541px]:flex-col">
        <div class="flex-1 [&_a]:text-color-01">
          <h2 v-if="block.headline" class="mb-4">{{ block.headline }}</h2>
          <div v-html="contentHtml" />
        </div>

        <div v-if="image" class="flex-1 rounded-[0.625rem] overflow-hidden">
          <NuxtImg
            :src="image.path"
            :alt="image.alt || block.headline || 'section image'"
            class="w-full h-full object-cover"
          />
        </div>
      </div>
    </div>
  </section>
</template>
