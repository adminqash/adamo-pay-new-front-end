import axios from "axios";
import i18next from "i18next";
import { env } from "@/lib/env";

export const api = axios.create({
  baseURL: env.VITE_API_BASE_URL,
  withCredentials: true, // Enable sending cookies with requests
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
    "Accept-Language": i18next.language,
  },
});
