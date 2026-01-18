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
    if (origWarnHandler) {
      return origWarnHandler(msg, instance, trace)
    }
  }
})
