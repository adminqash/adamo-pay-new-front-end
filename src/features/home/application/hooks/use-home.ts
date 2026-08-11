import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useCountry } from "@/features/common/contexts/use-country";
import { DashboardService } from "@/features/home/api/services/dashboard.service";
import { withCountryScope } from "@/lib/country/country-code";
import { queryDefaults } from "@/lib/query/defaults";
import { queryKeys } from "@/lib/query/query-keys";

export function useHome() {
  const { t } = useTranslation(["home"]);
  const { countryCode } = useCountry();

  const query = useQuery({
    queryKey: withCountryScope(queryKeys.dashboard.summary, countryCode),
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
