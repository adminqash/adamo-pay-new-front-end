import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { DashboardService } from "@/features/home/api/services/dashboard.service";
import { queryDefaults } from "@/lib/query/defaults";
import { queryKeys } from "@/lib/query/query-keys";

export function useHome() {
  const { t } = useTranslation(["home"]);

  const query = useQuery({
    queryKey: queryKeys.dashboard.summary,
    queryFn: DashboardService.getSummary,
    ...queryDefaults,
    meta: {
      showMessageOnSuccess: false,
      errorMessage: t("home:errors.load_failed", { defaultValue: "Error al cargar el inicio" }),
    },
  });

  return {
    data: query.data?.data,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}
