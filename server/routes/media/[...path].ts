import { defineEventHandler, getRouterParam, setHeader, setResponseStatus } from 'h3'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const backHost: string = import.meta.server ? (config.server as any).backHost : (config.public as any).backHost

  const param = getRouterParam(event, 'path') || ''
  const cleanParam = param.startsWith('/') ? param : `/${param}`
  const target = `${backHost}${cleanParam}`

  try {
    const res = await fetch(target, {
      // Forward minimal headers useful for caching and format negotiation
      headers: {
        'Accept': event.node.req.headers['accept'] || '*/*',
        'User-Agent': event.node.req.headers['user-agent'] || 'nuxt-proxy',
      },
    })

    // Mirror status code
    setResponseStatus(event, res.status)

    // Pass through basic headers
    const contentType = res.headers.get('content-type')
    if (contentType) setHeader(event, 'content-type', contentType)
    const cacheControl = res.headers.get('cache-control')
    if (cacheControl) setHeader(event, 'cache-control', cacheControl)

    // Return raw body
    const arrayBuf = await res.arrayBuffer()
    return new Uint8Array(arrayBuf)
  } catch (err) {
    setResponseStatus(event, 502)
    return 'Bad Gateway'
  }
})

