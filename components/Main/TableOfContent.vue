<script setup>
import { ref } from "vue";

const props = defineProps({
  data: {
    type: Object,
    default: () => ({}),
  },
});

const isOpen = ref(false);

function toggle() {
  isOpen.value = !isOpen.value;
}
</script>

<template>
  <section v-if="data.article?.blocks.length" class="my-8 max-[541px]:my-4">
    <div class="container">
      <!-- Frame 10: width: 1362px, height: 65px, background: #F8FF13 -->
      <nav class="w-full max-w-[85.125rem] mx-auto overflow-hidden">

        <!-- Cookies Link + Icon: height: 65px, padding: 24px -->
        <div
            class="flex items-center justify-between cursor-pointer select-none bg-pm-yellow h-[4.063rem] pl-6 pr-6 transition-colors duration-300"
            @click="toggle"
        >
          <!-- Cookies Link: font-size: 14px, font-weight: 700, line-height: 17px, uppercase, color: black -->
          <span class="text-[0.875rem] leading-[1.063rem] font-bold font-font-02 uppercase text-black">
            {{ $t('table_of_content') }}
          </span>

          <!-- Frame 11: Plus Icon 24x24px (Union + 2 Rectangles) - Bigger, Bolder, Centered -->
          <span :class="['inline-flex items-center justify-center transition-transform duration-300 text-[1.5rem] text-black', { 'rotate-45': isOpen }]">
            <Icon name="carbon:add" class="stroke-[3] scale-110" style="stroke-width: 3px; font-weight: 900;" />
          </span>
        </div>

        <!-- Dropdown content -->
        <div :class="['overflow-hidden transition-all duration-300 bg-background-02', { 'max-h-[25rem] opacity-100': isOpen }, { 'max-h-0 opacity-0': !isOpen }]">
          <ul class="flex flex-col gap-2 list-none py-4 m-0" itemscope itemtype="https://schema.org/ItemList">
            <li v-for="(item, index) in data.article.blocks" :key="item._id"
                class="relative pl-8 transition-all duration-300 text-sm m-0 text-pm-grey hover:text-pm-yellow"
                itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem">

              <span class="absolute left-0 top-1/2 -translate-y-1/2">{{ index + 1 }}.</span>

              <a :href="'#' + item._id" class="text-inherit text-sm block" itemprop="url">
                <meta itemprop="position" :content="index + 1" />
                <span itemprop="name">{{ item.H2 }}</span>
              </a>
            </li>
          </ul>
        </div>
      </nav>
    </div>
  </section>
</template>