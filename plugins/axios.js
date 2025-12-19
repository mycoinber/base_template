import axios from "axios";
import Cookies from "js-cookie";

export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig();

  // Убедитесь, что backurl правильно настроен
  const backurl = import.meta.server
    ? config.server.backHost
    : '/api';

  const instance = axios.create({ baseURL: backurl });

  instance.interceptors.request.use(
    (config) => {
      if (import.meta.server) {
        return config; // На сервере не используем токены
      }

      const token = Cookies.get("token");

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  nuxtApp.provide("axios", instance);
});
