<!--
  Parimatch Theme — Heading Section
  Design: https://www.figma.com/design/8ejGk5ckD9P4mG8078i9aO/pm--Copy-?node-id=4042-10733
-->
<script setup lang="ts">
interface Props {
  block: any;
  page?: any;
  isBot?: boolean;
  isLoaded?: boolean;
}

const props = defineProps<Props>();

// Данные нормализованы в usePageData:
// block.image / block.imageMedia → block.images[] (массив)
const imagePath = computed(() => props.block?.images?.[0]?.path || '');
const hasImage = computed(() => Boolean(imagePath.value));
const imageAlt = computed(() => {
  const img = props.block?.images?.[0];
  return img?.alt || img?.title || props.block?.headline || '';
});

// Четные секции — картинка справа (is-reversed)
const isReversed = computed(() => {
  if (!hasImage.value) return false;
  const order = Number(props.block?.order ?? 0);
  return order % 2 === 0;
});

// Оборачиваем таблицы из v-html в .table-scroll-wrapper для горизонтального скролла
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

        <!-- Изображение — точно как в Hero: block.images[0].path -->
        <div v-if="block?.images?.[0]?.path" class="heading-image">
          <NuxtImg
            :src="block.images[0].path"
            :alt="imageAlt"
            class="w-full h-full object-cover"
          />
        </div>

        <!-- Контентная колонка -->
        <div class="heading-content">
          <div class="heading-text">
            <h2 v-if="block?.headline" class="heading-title">{{ block.headline }}</h2>
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

<style lang="scss">
/* ==========================================================================
   Heading Section — Parimatch Theme
   Цвета берём из CSS-переменных (задаются через .env → theme-colors.client.ts)
   Fallback-значения совпадают с дизайном Figma
   ========================================================================== */

.heading-section {
  padding: 60px 0;

  @media (max-width: 541px) {
    padding: 40px 0;
  }
}

/* --- Layout --- */
.heading-wrapper {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: clamp(24px, 3.056vw, 44px); /* 44px @ 1440px */

  /* Нечётные: картинка справа */
  &.is-reversed {
    flex-direction: row-reverse;
  }

  /* Нет картинки — блок по центру, текст по левому краю */
  &.no-image {
    justify-content: center;

    .heading-content {
      max-width: 629px;  /* Figma: 629px */
      text-align: left;
    }

    .heading-title {
      text-align: left;
    }

    .heading-description {
      text-align: left;

      p { text-align: left; }

      ul {
        display: block;
        text-align: left;
      }
    }
  }

  @media (max-width: 1024px) {
    flex-direction: column !important;
    gap: 32px;
  }
}

/* --- Изображение — ровно 50% ширины контейнера --- */
.heading-image {
  flex: 0 0 50%;
  width: 50%;
  aspect-ratio: 714 / 800;       /* Figma: 714×800 */
  overflow: hidden;

  @media (max-width: 1024px) {
    flex: none;
    width: 100%;
    aspect-ratio: 16 / 9;
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
}

/* --- Контентная колонка — ровно 50% --- */
.heading-content {
  flex: 0 0 50%;
  width: 50%;
  min-width: 0; /* предотвращает переполнение flex-item */

  @media (max-width: 1024px) {
    flex: none;
    width: 100%;
  }
}

.heading-text {
  display: flex;
  flex-direction: column;
  gap: 24px; /* ВСЕГДА 24px между заголовком и текстом */
}

/* --- H2 --- */
.heading-title {
  font-family: 'Parimatch Sans', sans-serif;
  font-weight: 700;
  font-size: clamp(32px, 3.47vw, 50px);   /* 50px @ 1440px */
  line-height: 0.8;
  letter-spacing: -0.02em;
  text-transform: uppercase;
  text-align: left; /* center */
  color: var(--primary, #F8FF13);
  font-feature-settings: 'lnum', 'pnum';
  margin: 0;
}

/* --- Описание (параграфы, списки, таблицы) --- */
.heading-description {
  font-family: 'Parimatch Sans', sans-serif;
  font-weight: 500;
  font-size: clamp(16px, 1.25vw, 18px);
  line-height: 1.3;
  color: var(--text-primary, #C8C3C7);

  p {
    margin-bottom: 10px;
    color: var(--text-primary, #C8C3C7);
    font-size: clamp(16px, 1.25vw, 18px);
    font-weight: 500;
    line-height: 1.3;

    &:last-child { margin-bottom: 0; }
  }

  a {
    color: var(--primary, #F8FF13);
    text-decoration: underline;
    text-decoration-color: var(--primary, #F8FF13);
    text-decoration-thickness: 1px;
    text-underline-offset: 3px;
    transition: opacity 0.2s ease;
    &:hover { opacity: 0.8; }
  }

  /* Списки */
  ul, ol {
    margin: 16px 0;
    padding-left: 0;
    color: var(--text-primary, #C8C3C7);
    font-size: clamp(16px, 1.25vw, 18px);   /* Тот же размер что у параграфов */
    font-weight: 500;
    line-height: 1.3;
  }

  ul {
    list-style: none;

    li {
      position: relative;
      padding-left: 25px;
      margin-bottom: 8px;
      font-size: clamp(16px, 1.25vw, 18px);   /* Принудительно задаём размер */
      font-weight: 500;
      line-height: 1.3;
      color: var(--text-primary, #C8C3C7);

      &::before {
        content: '';
        position: absolute;
        left: 3px;
        top: 50%;
        transform: translateY(-50%);
        width: 7px;
        height: 7px;
        background-color: var(--primary, #F8FF13);
      }
    }
  }

  ol {
    list-style: decimal;
    padding-left: 20px;

    li {
      margin-bottom: 8px;
      font-size: clamp(16px, 1.25vw, 18px);   /* Принудительно задаём размер */
      font-weight: 500;
      line-height: 1.3;
      color: var(--text-primary, #C8C3C7);
    }
  }

  strong, b { font-weight: 700; }
  em, i     { font-style: italic; }

  /* H3 внутри контента */
  h3 {
    font-family: 'Parimatch Sans', sans-serif;
    font-weight: 700;
    font-size: clamp(20px, 1.67vw, 24px);
    line-height: 1.2;
    letter-spacing: -0.02em;
    text-transform: uppercase;
    color: var(--primary, #F8FF13);
    margin: 0;
    margin-top: 24px;
    margin-bottom: 8px;

    &:first-child {
      margin-top: 0;
    }
  }

  /* ====================================================================
     ТАБЛИЦЫ — адаптивный дизайн по мотивам Figma
     Desktop (629px+): дизайн Figma — чёрная шапка с отступом 8px, серый фон
     Мобилка (<629px): горизонтальная прокрутка, без наслоения
     ==================================================================== */

  /* Обёртка для горизонтального скролла на мобилке */
  .table-scroll-wrapper {
    width: 100%;
    overflow-x: auto;
    margin-bottom: 24px;
    -webkit-overflow-scrolling: touch;
    /* Тонкий скроллбар в стиле темы */
    scrollbar-width: thin;
    scrollbar-color: var(--primary, #F8FF13) var(--background-primary, #000000);

    &::-webkit-scrollbar {
      height: 4px;
    }
    &::-webkit-scrollbar-track {
      background: var(--background-primary, #000000);
    }
    &::-webkit-scrollbar-thumb {
      background: var(--primary, #F8FF13);
      border-radius: 2px;
    }
  }

  table {
    width: 100%;
    min-width: 480px;          /* минимум чтобы не наслаивалось */
    border-collapse: separate;
    border-spacing: 0;
    background-color: var(--text-primary, #C8C3C7);
    font-family: 'Parimatch Sans', sans-serif;
    font-size: clamp(14px, 1.25vw, 18px);
    color: var(--text-inverse, #000000);
    margin: 0;
    border: none;
    /* Внутренний отступ 8px — создаёт "рамку" вокруг черной шапки */
    padding: 8px;
    box-sizing: border-box;
  }

  /* ── Шапка с чёрным фоном (отступ 8px от краёв создаётся padding у table) ── */
  thead {
    display: table-header-group;
  }

  thead tr {
    background-color: var(--background-primary, #000000);
    display: table-row;
  }

  thead th {
    font-family: 'Parimatch Sans', sans-serif;
    font-weight: 700;
    font-size: clamp(11px, 0.97vw, 14px);
    text-transform: uppercase;
    color: var(--text-primary, #C8C3C7);
    padding: 8px 16px;
    text-align: center;   /* все колонки по центру по умолчанию */
    border: none;
    white-space: nowrap;
    height: 33px;
    vertical-align: middle;
    background-color: var(--background-primary, #000000);

    /* Только первая колонка — по левому краю */
    &:first-child {
      text-align: left;
      padding-left: 16px;
    }
  }

  /* ── Строки данных (под шапкой, на сером фоне) ── */
  tbody {
    display: table-row-group;
  }

  tbody tr {
    display: table-row;
  }

  tbody td {
    font-family: 'Parimatch Sans', sans-serif;
    font-weight: 500;
    font-size: clamp(14px, 1.25vw, 18px);
    line-height: 1.3;
    color: var(--text-inverse, #000000);
    padding: 12px 16px;
    /* Линия снизу каждой ячейки = разделитель между строками */
    border: none;
    border-bottom: 1px solid rgba(0, 0, 0, 0.25);
    vertical-align: middle;
    background-color: transparent;
    text-align: center;   /* все колонки по центру по умолчанию */

    /* Только первая колонка — по левому краю */
    &:first-child {
      text-align: left;
      padding-left: 16px;
    }
  }

  /* Убираем линию у последней строки */
  tbody tr:last-child td {
    border-bottom: none;
  }

  /* Отступ первой строки от шапки */
  tbody tr:first-child td {
    padding-top: 16px;
  }
}
</style>
