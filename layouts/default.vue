<script setup>
import { useCssModule, watch } from "vue";
import { useNuxtApp } from "#app";
import { useAsyncData } from "#app";

const { $axios } = useNuxtApp();
const styles = useCssModule();

const fetchPages = async () => {
  try {
    const response = await $axios.get(`/nav`);
    if (process.dev) {
      console.info('[layout] fetched nav data:', response.data);
    }
    return response.data;
  } catch (error) {
    const status = error?.response?.status;
    const responseData = error?.response?.data;
    const headers = error?.response?.headers;
    const requestUrl = error?.config?.baseURL
      ? `${error.config.baseURL}${error.config.url || ''}`
      : error?.config?.url;
    console.error('[layout] nav request failed', {
      message: error?.message,
      status,
      requestUrl,
      responseData,
      headers,
    });
    throw error;
  }
};

const { data, error } = useAsyncData("pages", () => fetchPages(), {
  ssr: true,
});

const sharedLogo = useState("siteLogo", () => []);
watch(
  () => data.value?.logo,
  (logo) => {
    sharedLogo.value = Array.isArray(logo) ? logo : [];
  },
  { immediate: true },
);

const hasError = error.value;
</script>

<template>
  <article :class="styles.article">

    <div v-if="hasError">Произошла ошибка при загрузке данных</div>

    <Header v-if="data && !hasError" :data="data" />

    <slot />

    <Footer v-if="data && !hasError" :data="data" />
  </article>
</template>

<style lang="scss" scoped module>
.article {
  position: relative;

  &::after {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    display: block;
    width: 100%;
    height: 100%;
    background-size: cover;
    background-repeat: no-repeat;
    background-image: url("/ornament.svg");
    z-index: -2;
  }
}
</style>
