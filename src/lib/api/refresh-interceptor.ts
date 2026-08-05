import axios from "axios";
import type { AxiosError, AxiosInstance } from "axios";
import { redirectToLogin } from "@/features/auth/api/services/auth-redirect";
import { apiUrls } from "@/lib/env";
import { client as queryClient } from "@/lib/query/client.config";
import { queryKeys } from "@/lib/query/query-keys";

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void
  reject: (reason?: unknown) => void
}> = [];

const processQueue = (error: unknown = null) => {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve();
    }
  });

  failedQueue = [];
};

type IdentityErrorBody = {
  errors?: Array<string | { code?: string }> | null
  error?: string
  data?: { errors?: Array<string | { code?: string }> | null, error?: string }
};

function isAccessTokenExpiredError(error: AxiosError<IdentityErrorBody>): boolean {
  const includesExpiredCode = (errors?: Array<string | { code?: string }> | null) =>
    errors?.some((item) => item === "ACCESS_TOKEN_EXPIRED" || (typeof item === "object" && item?.code === "ACCESS_TOKEN_EXPIRED")) ?? false;

  return (
    includesExpiredCode(error.response?.data?.errors)
    || includesExpiredCode(error.response?.data?.data?.errors)
    || error.response?.data?.error === "token_expired"
    || error.response?.data?.data?.error === "token_expired"
  );
}

/**
 * Silent-refresh interceptor shared by every API client. On a 401 caused by an
 * expired access token it calls the identity service's /auth/refresh (cookie-based)
 * once, queues concurrent failed requests behind that single call, and retries them.
 * Any other 401 (no session, invalid token, failed refresh) redirects to the SSO login.
 */
export function attachRefreshInterceptor(client: AxiosInstance): void {
  client.interceptors.response.use(
    (response) => response,
    async(error: AxiosError<IdentityErrorBody>) => {
      const originalRequest = error.config as typeof error.config & { _retry?: boolean };
      const is401Error = error.response?.status === 401;
      const isAccessTokenExpired = isAccessTokenExpiredError(error);

      if (is401Error && !isAccessTokenExpired && !originalRequest?._retry) {
        if (originalRequest) {
          originalRequest._retry = true;
        }

        processQueue(error);
        isRefreshing = false;
        redirectToLogin();

        return Promise.reject(error);
      }

      if (isAccessTokenExpired && originalRequest && !originalRequest._retry) {
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then(() => client(originalRequest))
            .catch((err) => Promise.reject(err));
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          await axios.post(`${apiUrls.auth}/auth/refresh`, {}, { withCredentials: true });

          processQueue();
          isRefreshing = false;
          void queryClient.invalidateQueries({ queryKey: queryKeys.auth.all });

          return client(originalRequest);
        } catch(refreshError) {
          processQueue(refreshError);
          isRefreshing = false;
          redirectToLogin({ sessionExpired: true });

          return Promise.reject(refreshError);
        }
      }

      return Promise.reject(error);
    },
  );
}
