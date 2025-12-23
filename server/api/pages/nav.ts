import { defineEventHandler, getQuery, createError } from 'h3';

export default defineEventHandler(async (event) => {
  const { siteId } = getQuery(event);
  if (!siteId) {
    throw createError({ statusCode: 400, statusMessage: 'siteId is required' });
  }
  const config = useRuntimeConfig(event);
  const backendBase = (config.server as any).backHost?.replace(/\/$/, '') || '';
  try {
    const result = await $fetch(`${backendBase}/pages/nav`, {
      params: { siteId },
    });

    if (process.dev) {
      console.info('[proxy] /pages/nav result:', result);
    }

    return result;
  } catch (error: any) {
    console.error('[Proxy Error] /pages/nav:', error?.data || error?.message);
    throw createError({ statusCode: error?.statusCode || 500, statusMessage: 'Failed to fetch nav' });
  }
});
