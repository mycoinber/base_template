import { defineEventHandler, getQuery, createError } from 'h3';

export default defineEventHandler(async (event) => {
  const { siteId } = getQuery(event);
  if (!siteId) {
    throw createError({ statusCode: 400, statusMessage: 'siteId is required' });
  }
  const config = useRuntimeConfig(event);
  const backendBase = (config.server as any).backHost?.replace(/\/$/, '') || '';
  try {
    const page = await $fetch(`${backendBase}/pages/${siteId}`);
    const head = page?.head || {};
    const logo = Array.isArray(page?.logo) ? page.logo : [];
    const pages = [
      {
        slug: page?.slug || '',
        homePage: Boolean(page?.homePage),
        head,
      },
    ];

    return {
      pages,
      logo,
      offer: page?.offer || null,
    };
  } catch (error: any) {
    console.error('[Proxy Error] /pages/nav:', error?.data || error?.message);
    throw createError({ statusCode: error?.statusCode || 500, statusMessage: 'Failed to fetch nav' });
  }
});
