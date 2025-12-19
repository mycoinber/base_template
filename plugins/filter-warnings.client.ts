export default defineNuxtPlugin((nuxtApp) => {
  // Filter out noisy Vue warnings in dev (client only)
  const vueApp = nuxtApp.vueApp

  const shouldIgnore = (msg: unknown) => {
    if (typeof msg !== 'string') return false
    return (
      msg.includes('<Suspense> is an experimental feature')
    )
  }

  // Keep original warn handler if any
  const origWarnHandler = vueApp.config.warnHandler
  vueApp.config.warnHandler = (msg, instance, trace) => {
    if (shouldIgnore(msg)) return
    if (origWarnHandler) return origWarnHandler(msg, instance, trace)
    // Fallback to console.warn with string-only payloads to avoid devtools devalue issues
    try {
      // @ts-expect-error trace can be string in some environments
      console.warn(typeof msg === 'string' ? msg : String(msg), trace || '')
    } catch {
      // ignore
    }
  }
})

