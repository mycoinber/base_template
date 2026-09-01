<script setup>
import { computed } from 'vue'

const props = defineProps({
  data: {
    type: Object,
    default: () => ({}),
  },
})

const tocItems = computed(() => {
  const blocks = Array.isArray(props.data?.article?.blocks) ? props.data.article.blocks : []
  return blocks.filter((block) => {
    const title = String(block?.H2 || block?.headline || block?.title || '').trim()
    return Boolean(title)
  })
})
</script>

<template>
  <section v-if="tocItems.length" class="my-8 max-[541px]:my-4">
    <div class="container">
      <nav class="w-full rounded-[0.625rem] bg-background-02 p-4" style="border: 1px solid var(--border)">
        <details class="group">
          <summary
            class="flex w-full cursor-pointer list-none items-center justify-between select-none bg-transparent p-0 text-left [&::-webkit-details-marker]:hidden"
            data-fastgen-offer-navigation="off"
          >
          <span class="text-2xl font-font-02 uppercase max-[541px]:text-xl">{{
            $t('table_of_content')
          }}</span>
          <span class="inline-block text-2xl transition-transform duration-300 group-open:rotate-180">
            <Icon name="fluent:chevron-down-16-filled" />
          </span>
          </summary>

          <div class="overflow-hidden">
          <ul
            class="flex flex-col gap-2 list-none pt-4 m-0 pl-0"
            itemscope
            itemtype="https://schema.org/ItemList"
          >
            <li
              v-for="(item, index) in tocItems"
              :key="item._id"
              class="text-color-white relative pl-8 transition-all duration-300 opacity-50 text-sm m-0 hover:text-color-01 hover:opacity-100"
              itemprop="itemListElement"
              itemscope
              itemtype="https://schema.org/ListItem"
            >
              <span class="absolute left-0 top-1/2 -translate-y-1/2">{{ index + 1 }}.</span>
              <a :href="'#' + item._id" class="text-inherit text-sm" itemprop="url">
                <meta itemprop="position" :content="index + 1" />
                <span itemprop="name">{{ item.H2 || item.headline || item.title }}</span>
              </a>
            </li>
          </ul>
          </div>
        </details>
      </nav>
    </div>
  </section>
</template>
