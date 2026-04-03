<!--
  Parimatch Theme - Intro Section Component
  Дизайн аналогичен Heading.vue — 50/50 layout, картинка + контент
-->

<script setup lang="ts">
interface Props {
  block: any;
  page?: any;
  isBot?: boolean;
  isLoaded?: boolean;
}

const props = defineProps<Props>();

const imagePath = computed(() => props.block?.images?.[0]?.path || '');
const hasImage = computed(() => Boolean(imagePath.value));
const imageAlt = computed(() => {
  const img = props.block?.images?.[0];
  return img?.alt || img?.title || props.block?.headline || '';
});

// Intro: картинка справа, текст слева — is-reversed
const isReversed = true;

// Оборачиваем таблицы из v-html в .table-scroll-wrapper
const descriptionRef = ref<HTMLElement | null>(null);

function wrapTables() {
  if (!descriptionRef.value) return;
  const tables = descriptionRef.value.querySelectorAll('table:not(.table-wrapped)');
  tables.forEach((table) => {
    const wrapper = document.createElement('div');
    wrapper.className = 'table-scroll-wrapper';
    table.parentNode?.insertBefore(wrapper, table);
    wrapper.appendChild(table);
    table.classList.add('table-wrapped');
  });
}

onMounted(() => nextTick(wrapTables));
watch(() => props.block?.content, () => nextTick(wrapTables));
</script>

<template>
  <section
    class="heading-section"
    :id="block?._id || undefined"
  >
    <div class="container">
      <div
        class="heading-wrapper"
        :class="{
          'is-reversed': isReversed,
          'no-image': !hasImage,
        }"
      >
        <!-- Изображение -->
        <div v-if="hasImage" class="heading-image">
          <NuxtImg
            :src="imagePath"
            :alt="imageAlt"
            class="w-full h-full object-cover"
          />
        </div>

        <!-- Контентная колонка -->
        <div class="heading-content">
          <div class="heading-text">
            <h1
              v-if="block?.headline"
              class="heading-title"
            >{{ block.headline }}</h1>
            <div
              v-if="block?.content"
              ref="descriptionRef"
              v-html="block.content"
              class="heading-description"
            />
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
