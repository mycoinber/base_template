<script setup>
import { ref } from "vue";

const props = defineProps({
  data: {
    type: Object,
    default: () => ({}),
  },
});

// Переменная для хранения активного вопроса (по умолчанию первый)
const activeIndex = ref(0);

// Функция для переключения вопросов
const toggleFAQ = (index) => {
  activeIndex.value = activeIndex.value === index ? null : index;
};
</script>

<template>
  <section v-if="data.faqs?.data" :id="data.faqs?.key" class="my-8 max-[541px]:my-4 max-[541px]:mb-8">
    <div class="container">
      <h2 v-if="data.faqs?.headline">
        {{ data.faqs?.headline }}
      </h2>

      <div class="flex flex-col" itemscope itemtype="https://schema.org/FAQPage">
        <div v-for="(faq, index) in data.faqs.data" :key="faq.question" class="border-b border-[#ddd]" itemscope
          itemtype="https://schema.org/Question">

          <!-- Заголовок с обработчиком клика -->
          <h3 :class="['cursor-pointer text-xl font-bold transition-colors duration-300', { 'text-color-01': activeIndex === index }, { 'hover:text-color-01': activeIndex !== index }]" itemprop="name" @click="toggleFAQ(index)">
            {{ faq.question }}
          </h3>

          <!-- Ответ с анимацией -->
          <div :class="['overflow-hidden transition-all duration-300', { 'max-h-[10rem] opacity-100 py-4': activeIndex === index }, { 'max-h-0 opacity-0': activeIndex !== index }]" itemscope
            itemtype="https://schema.org/Answer">
            <p class="text-sm" itemprop="text">
              {{ faq.answer }}
            </p>
          </div>

        </div>
      </div>
    </div>
  </section>
</template>
