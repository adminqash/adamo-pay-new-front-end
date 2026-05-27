import { FullScreenLoaderManager } from "@adamosuiteservices/ui/full-screen-loader";
import { ToastManager } from "@adamosuiteservices/ui/toaster";
import { MutationCache, QueryCache, QueryClient } from "@tanstack/react-query";
import { ServiceResult } from "@/features/common/services/service-result";
import i18n from "@/lib/i18n/i18n.config";

export const client = new QueryClient({
  queryCache: new QueryCache({
    onSuccess: (data, query) => {
      const isFirstLoad = query.state.dataUpdateCount === 1;

      if (isFirstLoad && query.meta?.showMessageOnSuccess !== false) {
        const metaSuccessMessage = typeof query.meta?.successMessage === "string"
          ? query.meta?.successMessage
          : null;

        const message = data instanceof ServiceResult
          ? `${data.message}`
          : metaSuccessMessage || i18n.t("common:actions:success");

        ToastManager.show({
          variant: "success",
          message,
        });
      }
    },
    onError: (error, query) => {
      if (query.meta?.showMessageOnError !== false) {
        const metaErrorMessage = typeof query.meta?.errorMessage === "string"
          ? query.meta?.errorMessage
          : null;

        const message = error instanceof ServiceResult && error.message
          ? `${error.message}${error.traceId ? `. Trace ID: ${error.traceId}` : ""}`
          : metaErrorMessage || i18n.t("common:errors.generic");

        ToastManager.show({
          variant: "destructive",
          message,
        });
      }
    },
  }),
  mutationCache: new MutationCache({
    onMutate: (_variables, mutation) => {
      if (mutation.meta?.showLoader !== false) {
        FullScreenLoaderManager.show();
      }
    },
    onSuccess: (data, _variables, _context, mutation) => {
      if (mutation.meta?.showMessageOnSuccess !== false) {
        const metaSuccessMessage = typeof mutation.meta?.successMessage === "string"
          ? mutation.meta?.successMessage
          : null;

        const message = data instanceof ServiceResult
          ? `${data.message}`
          : metaSuccessMessage || i18n.t("common:actions:success");

        ToastManager.show({
          variant: "success",
          message,
        });
      }
    },
    onError: (error, _variables, _context, mutation) => {
      if (mutation.meta?.showMessageOnError !== false) {
        const metaErrorMessage = typeof mutation.meta?.errorMessage === "string"
          ? mutation.meta?.errorMessage
          : null;

        const message = error instanceof ServiceResult && error.message
          ? `${error.message}${error.traceId ? `. Trace ID: ${error.traceId}` : ""}`
          : metaErrorMessage || i18n.t("common:errors.generic");

        ToastManager.show({
          variant: "destructive",
          message,
        });
      }
    },
    onSettled: (_data, _error, _variables, _context, mutation) => {
      if (mutation.meta?.showLoader !== false) {
        FullScreenLoaderManager.hide();
      }
    },
  }),
});
