import { z } from "zod";

const ENVSchema = z.object({
  VITE_API_BASE_URL: z.url(),
  VITE_API_CORE_URL: z.url().optional(),
  VITE_API_BENEFICIARIES_URL: z.url().optional(),
  VITE_API_ANALYTICS_URL: z.url().optional(),
  VITE_API_REALTIME_URL: z.url().optional(),
  VITE_API_BEARER_TOKEN: z.string().min(1).optional(),
});

const result = ENVSchema.safeParse(import.meta.env);

if (!result.success) {
  throw new Error("Invalid environment variables: " + result.error.message);
}

export const env = result.data;

export const apiUrls = {
  core: env.VITE_API_CORE_URL ?? env.VITE_API_BASE_URL,
  beneficiaries: env.VITE_API_BENEFICIARIES_URL ?? env.VITE_API_BASE_URL,
  analytics: env.VITE_API_ANALYTICS_URL ?? env.VITE_API_BASE_URL,
  realtime: env.VITE_API_REALTIME_URL ?? env.VITE_API_BASE_URL,
} as const;
