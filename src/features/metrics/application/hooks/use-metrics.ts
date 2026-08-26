import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import type { MetricsQueryParams } from "@/lib/api/api.types";
import { useCountry } from "@/features/common/contexts/use-country";
import { MetricsMapper } from "@/features/metrics/api/mappers/metrics.mapper";
import { MetricsService } from "@/features/metrics/api/services/metrics.service";
import { withCountryScope } from "@/lib/country/country-code";
import { queryDefaults } from "@/lib/query/defaults";
import { queryKeys } from "@/lib/query/query-keys";

function metricsErrorMeta(message: string) {
  return {
    showMessageOnSuccess: false,
    errorMessage: message,
  };
}

export function useMetricsOverview(params?: MetricsQueryParams) {
  const { t } = useTranslation(["metrics"]);
  const { countryCode } = useCountry();

  const query = useQuery({
    queryKey: withCountryScope(queryKeys.metrics.overview(params), countryCode),
    queryFn: () => MetricsService.getOverview(params),
    ...queryDefaults,
    meta: metricsErrorMeta(t("metrics:errors.load_failed", { defaultValue: "Error al cargar métricas" })),
  });

  return {
    overview: query.data?.data,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

export function useMetricsTransactions(params?: MetricsQueryParams, enabled = true) {
  const { t } = useTranslation(["metrics"]);
  const { countryCode } = useCountry();

  const query = useQuery({
    queryKey: withCountryScope(queryKeys.metrics.transactions(params), countryCode),
    queryFn: () => MetricsService.getTransactions(params),
    enabled,
    ...queryDefaults,
    meta: metricsErrorMeta(t("metrics:errors.load_failed", { defaultValue: "Error al cargar métricas" })),
  });

  return {
    transactions: query.data?.data
      ? MetricsMapper.toTransactionsTab(query.data.data, t)
      : undefined,
    isLoading: query.isLoading,
    refetch: query.refetch,
  };
}

export function useMetricsBeneficiaries(params?: MetricsQueryParams, enabled = true) {
  const { t } = useTranslation(["metrics"]);
  const { countryCode } = useCountry();

  const query = useQuery({
    queryKey: withCountryScope(queryKeys.metrics.beneficiaries(params), countryCode),
    queryFn: () => MetricsService.getBeneficiaries(params),
    enabled,
    ...queryDefaults,
    meta: metricsErrorMeta(t("metrics:errors.load_failed", { defaultValue: "Error al cargar métricas" })),
  });

  return {
    beneficiaries: query.data?.data
      ? MetricsMapper.toBeneficiariesTab(query.data.data)
      : undefined,
    isLoading: query.isLoading,
    refetch: query.refetch,
  };
}

export function useMetricsBatches(params?: MetricsQueryParams, enabled = true) {
  const { t } = useTranslation(["metrics"]);
  const { countryCode } = useCountry();

  const query = useQuery({
    queryKey: withCountryScope(queryKeys.metrics.batches(params), countryCode),
    queryFn: () => MetricsService.getBatches(params),
    enabled,
    ...queryDefaults,
    meta: metricsErrorMeta(t("metrics:errors.load_failed", { defaultValue: "Error al cargar métricas" })),
  });

  return {
    batches: query.data?.data
      ? MetricsMapper.toBatchesTab(query.data.data, t)
      : undefined,
    isLoading: query.isLoading,
    refetch: query.refetch,
  };
}

export function useMetricsAccounts(params?: MetricsQueryParams, enabled = true) {
  const { t } = useTranslation(["metrics"]);
  const { countryCode } = useCountry();

  const query = useQuery({
    queryKey: withCountryScope(queryKeys.metrics.accounts(params), countryCode),
    queryFn: () => MetricsService.getAccounts(params),
    enabled,
    ...queryDefaults,
    meta: metricsErrorMeta(t("metrics:errors.load_failed", { defaultValue: "Error al cargar métricas" })),
  });

  return {
    accounts: query.data?.data
      ? MetricsMapper.toAccountsTab(query.data.data)
      : undefined,
    isLoading: query.isLoading,
    refetch: query.refetch,
  };
}

export function useMetricsDashboard(params?: MetricsQueryParams) {
  const { t } = useTranslation(["metrics"]);
  const { countryCode } = useCountry();

  const query = useQuery({
    queryKey: withCountryScope(queryKeys.metrics.dashboard(params), countryCode),
    queryFn: () => MetricsService.getDashboard(params),
    ...queryDefaults,
    meta: metricsErrorMeta(t("metrics:errors.load_failed", { defaultValue: "Error al cargar métricas" })),
  });

  const dashboard = query.data?.data
    ? MetricsMapper.toDashboard(query.data.data, t, countryCode)
    : undefined;

  return {
    dashboard,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

/** @deprecated Use useMetricsOverview + tab hooks */
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
