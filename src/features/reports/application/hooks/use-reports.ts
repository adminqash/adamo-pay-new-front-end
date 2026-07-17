import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import type { ListQueryParams } from "@/lib/api/api.types";
import { ReportsService } from "@/features/reports/api/services/reports.service";
import { listQueryDefaults } from "@/lib/query/defaults";
import { queryKeys } from "@/lib/query/query-keys";

export function useReports(params?: ListQueryParams) {
  const { t } = useTranslation(["reports"]);

  const query = useQuery({
    queryKey: queryKeys.reports.all(params),
    queryFn: () => ReportsService.list(params),
    ...listQueryDefaults,
    meta: {
      showMessageOnSuccess: false,
      errorMessage: t("reports:errors.load_failed", { defaultValue: "Error al cargar reportes" }),
    },
  });

  return {
    reports: query.data?.data ?? [],
    totalCount: query.data?.pagination?.total ?? 0,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}
