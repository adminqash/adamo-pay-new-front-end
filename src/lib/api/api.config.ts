import axios, { type AxiosInstance } from "axios";
import i18next from "i18next";
import { attachRequestInterceptors, attachResponseInterceptors } from "./interceptors";

const DEFAULT_TIMEOUT_MS = 30_000;

export function createApiClient(baseURL: string): AxiosInstance {
  const instance = axios.create({
    baseURL,
    withCredentials: true,
    timeout: DEFAULT_TIMEOUT_MS,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      "Accept-Language": i18next.language,
    },
  });

  attachRequestInterceptors(instance);
  attachResponseInterceptors(instance);

  return instance;
}
