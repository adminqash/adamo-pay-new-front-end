import i18next from "i18next";
import type { AxiosInstance, InternalAxiosRequestConfig } from "axios";
import { getStoredCountryCodeAlpha3 } from "@/lib/country/country-code";

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

    if (!config.params?.countryCode) {
      config.params = { ...config.params, countryCode: getStoredCountryCodeAlpha3() };
    }

    return config;
  });
}
