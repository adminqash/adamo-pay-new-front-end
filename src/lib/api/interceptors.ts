import i18next from "i18next";
import type { AxiosInstance, InternalAxiosRequestConfig } from "axios";
import { env } from "@/lib/env";

function generateRequestId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `req-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function attachRequestInterceptors(instance: AxiosInstance): void {
  instance.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    config.headers.set("Accept-Language", i18next.language);
    config.headers.set("X-Request-ID", generateRequestId());
    if (env.VITE_API_BEARER_TOKEN) {
      config.headers.set("Authorization", `Bearer ${env.VITE_API_BEARER_TOKEN}`);
    }

    return config;
  });
}

export function attachResponseInterceptors(instance: AxiosInstance): void {
  instance.interceptors.response.use(
    (response) => response,
    (error) => Promise.reject(error),
  );
}
