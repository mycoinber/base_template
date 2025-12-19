<script setup>
import { ref } from 'vue';

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
    <section v-if="data.sections?.length" class="my-8 max-[541px]:my-4">
        <div class="container">
            <nav class="w-full p-4 rounded-[0.625rem] bg-background-02" style="border: 1px solid var(--border);">
                <div class="flex items-center justify-between cursor-pointer select-none" @click="toggle">
                    <span class="text-2xl font-font-02 uppercase m-0 p-0">Table of Contents</span>

                    <span :class="['inline-block transition-transform duration-300 text-2xl', { 'rotate-180': isOpen }]">
                        <Icon name="fluent:chevron-down-16-filled" />
                    </span>
                </div>

                <transition name="dropdown">
                    <ul v-show="isOpen" class="flex flex-col gap-2 list-none pt-4 m-0" itemscope itemtype="https://schema.org/ItemList">
                        <li v-for="(item, index) in data.sections" :key="item.key" class="text-color-white relative pl-8 transition-colors duration-300 hover:text-color-01"
                            itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem">
                            <span class="absolute left-0 top-1/2 -translate-y-1/2">{{ index + 1 }}.</span>
                            <a :href="'#' + item.key" itemprop="url" class="text-inherit">
                                <meta itemprop="position" :content="index + 1" />

                                <span itemprop="name">{{ item.headline }}</span>
                            </a>
                        </li>
                    </ul>
                </transition>
            </nav>
        </div>
    </section>
</template>
