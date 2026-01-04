import {
  defineEventHandler,
  createError,
  proxyRequest,
  getProxyRequestHeaders,
} from "h3";

export default defineEventHandler(async (event) => {
  const runtimeConfig = useRuntimeConfig(event);
  const backendBase =
    runtimeConfig.server?.backHost || runtimeConfig.public?.backHost;

  if (!backendBase) {
    throw createError({
      statusCode: 500,
      statusMessage: "BACKEND_URL is not configured",
    });
  }

  const rawRequestUrl = event.node?.req?.url || "/";
  const upstreamPath = rawRequestUrl.replace(/^\/api/, "") || "/";
  const sanitizedBase = backendBase.replace(/\/$/, "");
  const targetUrl = `${sanitizedBase}${
    upstreamPath.startsWith("/") ? "" : "/"
  }${upstreamPath}`;
  console.log("[...] targetUrl=", targetUrl);
  console.log("[...] event=", event);

  return proxyRequest(event, targetUrl, {
    fetchOptions: {
      headers: getProxyRequestHeaders(event, {
        exclude: ["host", "connection", "content-length"],
      }),
    },
  });
});
