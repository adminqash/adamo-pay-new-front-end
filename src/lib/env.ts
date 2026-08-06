import { z } from "zod";

const ENVSchema = z.object({
  VITE_API_BASE_URL: z.url(),
  VITE_API_CORE_URL: z.url().optional(),
  VITE_API_BENEFICIARIES_URL: z.url().optional(),
  VITE_API_ANALYTICS_URL: z.url().optional(),
  VITE_API_REALTIME_URL: z.url().optional(),
  VITE_ADAMO_API_BASE_URL: z.url(),
  VITE_ADAMO_LANDING_BASE_URL: z.string().optional(),
  VITE_ID_FRONT_BASE_URL: z.string().optional(),
  VITE_SIGN_FRONT_BASE_URL: z.string().optional(),
  VITE_CHECK_FRONT_BASE_URL: z.string().optional(),
});

const result = ENVSchema.safeParse(import.meta.env);

if (!result.success) {
  throw new Error("Invalid environment variables: " + result.error.message);
}

export const env = result.data;

if (!env.VITE_API_REALTIME_URL) {
  // Falling back silently here means the websocket ends up pointing at the
  // core REST API (no WS support there) instead of the realtime service —
  // every feature's live-update subscription would then fail to connect
  // with no visible error anywhere else. Surface it loudly instead.
  console.warn(
    "[realtime] VITE_API_REALTIME_URL is not set — falling back to VITE_API_BASE_URL. "
    + "The websocket connection will target the wrong service. Set VITE_API_REALTIME_URL "
    + "(VITE_API_REALTIME_URL_PROD/_DEV in the deploy secrets) to the realtime microservice's URL.",
  );
}

export const apiUrls = {
  core: env.VITE_API_CORE_URL ?? env.VITE_API_BASE_URL,
  beneficiaries: env.VITE_API_BENEFICIARIES_URL ?? env.VITE_API_BASE_URL,
  analytics: env.VITE_API_ANALYTICS_URL ?? env.VITE_API_BASE_URL,
  realtime: env.VITE_API_REALTIME_URL ?? env.VITE_API_BASE_URL,
  auth: `${env.VITE_ADAMO_API_BASE_URL}/api/v1`,
} as const;
