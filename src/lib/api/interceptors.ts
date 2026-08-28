import i18next from "i18next";
import type { AxiosInstance, InternalAxiosRequestConfig } from "axios";
import { getEnvAccessToken } from "@/lib/auth/env-access-token";
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
    const locale = i18next.language?.toLowerCase().startsWith("en") ? "en" : "es";
    config.headers.set("X-Locale", locale);
    config.headers.set("X-Request-ID", generateRequestId());

    if (!config.params?.countryCode) {
      config.params = { ...config.params, countryCode: getStoredCountryCodeAlpha3() };
    }

    const accessToken = getEnvAccessToken();
    if (accessToken) {
      config.headers.set("Authorization", `Bearer ${accessToken}`);
    }

    return config;
  });
}
