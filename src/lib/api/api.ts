import { createApiClient } from "./api.config";
import { apiUrls } from "@/lib/env";

/** Core microservice (payments, batches, accounts, dashboard, documents, etc.) */
export const coreApi = createApiClient(apiUrls.core);

/** Beneficiaries microservice */
export const beneficiariesApi = createApiClient(apiUrls.beneficiaries);

/** Analytics microservice (metrics, reports) */
export const analyticsApi = createApiClient(apiUrls.analytics);

/** Realtime microservice (WebSocket gateway + batch uploads) */
export const realtimeApi = createApiClient(apiUrls.realtime);

/** Identity/SSO microservice. Unused when VITE_ACCESS_TOKEN is set. */
export const authApi = createApiClient(apiUrls.auth || apiUrls.core);

/**
 * @deprecated Use coreApi, beneficiariesApi, or analyticsApi.
 * Kept for backward compatibility with existing services.
 */
export const api = coreApi;
