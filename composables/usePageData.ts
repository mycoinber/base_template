// composables/usePageData.ts
import { useNuxtApp, useAsyncData } from "#app";
import { watch } from 'vue'

export function usePageData(siteId: string, slug: string | null) {
    const { $axios } = useNuxtApp() as any;

    // Вынесли саму функцию запроса
    const fetchPage = async () => {
        const params: Record<string, any> = { siteId };
        if (slug) params.slug = slug;
        try {
            const response = await $axios.get("/pages/page-by-slug", { params });
            return response.data;
        } catch (error: any) {
            // Treat 404 as an expected "not found" state and avoid logging noisy objects
            const status = error?.response?.status;
            if (status && status !== 404) {
                const message = error?.response?.data?.message || error?.message || String(error);
                console.warn("Ошибка запроса:", message);
            }
            return {};
        }
    };

    // Вынесли асинхронное получение данных
    const asyncData = useAsyncData(
        `page-${slug || "home"}-${siteId}`,
        fetchPage,
        { server: true }
    );

    // Keep a global offerId for layout/header and buttons
    const currentOfferId = useState<string | null>('currentOfferId', () => null)
    watch(
        () => asyncData.data.value?.offer?._id as string | undefined,
        (id) => { currentOfferId.value = id || null },
        { immediate: true }
    )

    return asyncData;
}
