import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { BatchesService } from "@/features/batches/api/services/batches.service";
import { queryDefaults } from "@/lib/query/defaults";
import { queryKeys } from "@/lib/query/query-keys";

export function useBatchTimeline(batchId: string | undefined, enabled = true) {
  const { t } = useTranslation(["batches"]);

  const query = useQuery({
    queryKey: queryKeys.batches.timeline(batchId ?? ""),
    queryFn: () => BatchesService.getTimeline(batchId!),
    enabled: Boolean(batchId) && enabled,
    ...queryDefaults,
    meta: {
      showMessageOnSuccess: false,
      errorMessage: t("batches:errors.timeline_failed", {
        defaultValue: "Error al cargar el timeline del lote",
      }),
    },
  });

  return {
    timeline: query.data?.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
  };
}
