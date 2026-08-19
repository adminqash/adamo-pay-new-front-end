import { z } from "zod";

const optionalUrl = z
  .string()
  .optional()
  .transform((value) => {
    const trimmed = value?.trim();
    return trimmed ? trimmed : undefined;
  })
  .pipe(z.url().optional());

const optionalText = z
  .string()
  .optional()
  .transform((value) => {
    const trimmed = value?.trim();
    return trimmed ? trimmed : undefined;
  });

const ENVSchema = z.object({
  VITE_API_BASE_URL: z.url(),
  VITE_API_CORE_URL: optionalUrl,
  VITE_API_BENEFICIARIES_URL: optionalUrl,
  VITE_API_ANALYTICS_URL: optionalUrl,
  VITE_API_REALTIME_URL: optionalUrl,
  VITE_ADAMO_API_BASE_URL: optionalUrl,
  VITE_ADAMO_LANDING_BASE_URL: optionalText,
  VITE_ID_FRONT_BASE_URL: optionalText,
  VITE_SIGN_FRONT_BASE_URL: optionalText,
  VITE_CHECK_FRONT_BASE_URL: optionalText,
  VITE_ACCESS_TOKEN: optionalText,
}).superRefine((data, ctx) => {
  if (!data.VITE_ACCESS_TOKEN && !data.VITE_ADAMO_API_BASE_URL) {
    ctx.addIssue({
      code: "custom",
      path: ["VITE_ACCESS_TOKEN"],
      message: "Set VITE_ACCESS_TOKEN to boot without SSO, or set VITE_ADAMO_API_BASE_URL for Identity login",
    });
  }
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

const identityBaseUrl = env.VITE_ADAMO_API_BASE_URL?.replace(/\/$/, "");

export const apiUrls = {
  core: env.VITE_API_CORE_URL ?? env.VITE_API_BASE_URL,
  beneficiaries: env.VITE_API_BENEFICIARIES_URL ?? env.VITE_API_BASE_URL,
  analytics: env.VITE_API_ANALYTICS_URL ?? env.VITE_API_BASE_URL,
  realtime: env.VITE_API_REALTIME_URL ?? env.VITE_API_BASE_URL,
  auth: identityBaseUrl ? `${identityBaseUrl}/api/v1` : "",
} as const;
