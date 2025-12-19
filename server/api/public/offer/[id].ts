import { defineEventHandler, getRouterParam, createError } from 'h3'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'id is required' })
  const config = useRuntimeConfig(event)
  const backendBase = config.server.backHost
  try {
    return await $fetch(`${backendBase}/public/offer/${id}`)
  } catch (error: any) {
    console.error('[Proxy Error] /public/offer/:id', error?.data || error?.message)
    throw createError({ statusCode: error?.statusCode || 500, statusMessage: 'Failed to fetch offer' })
  }
})

