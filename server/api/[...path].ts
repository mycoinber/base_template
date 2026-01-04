import {
  defineEventHandler,
  createError,
  getRequestURL,
  proxyRequest,
  getProxyRequestHeaders,
} from "h3";
import { joinURL } from "ufo";

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

  const requestURL = getRequestURL(event);
  const upstreamPath = requestURL.pathname.replace(/^\/api/, "") || "/";
  const targetURL = new URL(
    joinURL(backendBase.replace(/\/$/, ""), upstreamPath)
  );
  targetURL.search = requestURL.search;

  return proxyRequest(event, targetURL.toString(), {
    fetchOptions: {
      headers: getProxyRequestHeaders(event, {
        exclude: ["host", "connection", "content-length"],
      }),
    },
  });
});
