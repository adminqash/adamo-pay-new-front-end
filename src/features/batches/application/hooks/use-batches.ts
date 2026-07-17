import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import type { ListQueryParams } from "@/lib/api/api.types";
import { BatchesService } from "@/features/batches/api/services/batches.service";
import { listQueryDefaults } from "@/lib/query/defaults";
import { queryKeys } from "@/lib/query/query-keys";

export function useBatches(params?: ListQueryParams) {
  const { t } = useTranslation(["batches"]);

  const query = useQuery({
    queryKey: queryKeys.batches.all(params),
    queryFn: () => BatchesService.list(params),
    ...listQueryDefaults,
    meta: {
      showMessageOnSuccess: false,
      errorMessage: t("batches:errors.load_failed", { defaultValue: "Error al cargar lotes" }),
    },
  });

  return {
    batches: query.data?.data ?? [],
    totalCount: query.data?.pagination?.total ?? 0,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}
