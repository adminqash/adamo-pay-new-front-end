import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { BatchesService } from "@/features/batches/api/services/batches.service";
import { listQueryDefaults } from "@/lib/query/defaults";
import { queryKeys } from "@/lib/query/query-keys";

export function useBatchDetail(id: string) {
  const { t } = useTranslation(["batches"]);

  const query = useQuery({
    queryKey: queryKeys.batches.detail(id),
    queryFn: () => BatchesService.getById(id),
    enabled: Boolean(id),
    ...listQueryDefaults,
    meta: {
      showMessageOnSuccess: false,
      errorMessage: t("batches:errors.detail_failed", { defaultValue: "Error al cargar el lote" }),
    },
  });

  return {
    batch: query.data?.data ?? null,
    isLoading: query.isLoading,
    error: query.error,
  };
}
