import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import type { MetricsQueryParams } from "@/lib/api/api.types";
import { MetricsMapper } from "@/features/metrics/api/mappers/metrics.mapper";
import { MetricsService } from "@/features/metrics/api/services/metrics.service";
import { queryDefaults } from "@/lib/query/defaults";
import { queryKeys } from "@/lib/query/query-keys";

export function useMetricsDashboard(params?: MetricsQueryParams) {
  const { t } = useTranslation(["metrics"]);

  const query = useQuery({
    queryKey: queryKeys.metrics.dashboard(params),
    queryFn: () => MetricsService.getDashboard(params),
    ...queryDefaults,
    meta: {
      showMessageOnSuccess: false,
      errorMessage: t("metrics:errors.load_failed", { defaultValue: "Error al cargar métricas" }),
    },
  });

  const dashboard = query.data?.data
    ? MetricsMapper.toDashboard(query.data.data, t)
    : undefined;

  return {
    dashboard,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

/** @deprecated Use useMetricsDashboard for a single optimized request */
export function useMetricsOverview(params?: MetricsQueryParams) {
  const { dashboard, isLoading, error, refetch } = useMetricsDashboard(params);
  return {
    metricsData: dashboard?.overview,
    isLoading,
    error,
    refetch,
  };
}

/** @deprecated Use useMetricsDashboard for a single optimized request */
export function useMetricsCharts(params?: MetricsQueryParams) {
  const { dashboard, isLoading } = useMetricsDashboard(params);

  return {
    isLoading,
    transactionStatusData: dashboard?.transactionStatusData,
    rejectionReasons: dashboard?.rejectionReasons,
    topBanks: dashboard?.topBanks,
    topBeneficiariesByCount: dashboard?.topBeneficiariesByCount,
    topBeneficiariesByAmount: dashboard?.topBeneficiariesByAmount,
    batchStats: dashboard?.batchStats,
    amlCompliance: dashboard?.amlComplianceData,
    accountBreakdown: dashboard?.accountTableData,
    recurringFailures: dashboard?.recurringFailures,
    paymentFrequency: dashboard?.paymentFrequency,
  };
}
