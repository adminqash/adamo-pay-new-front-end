import type { ServiceResult } from "@/features/common/services/service-result";
import type {
  AccountBreakdownDTO,
  AmlComplianceDTO,
  BatchStatsDTO,
  MetricsDashboardDTO,
  MetricsOverviewDTO,
  PaymentFrequencyDTO,
  RecurringFailuresDTO,
  RejectionReasonsDTO,
  TopBanksDTO,
  TopBeneficiariesDTO,
  TransactionStatusDTO,
} from "@/features/metrics/api/dtos/metrics.dto";
import type { MetricsOverview } from "@/features/metrics/api/mappers/metrics.mapper";
import type { MetricsQueryParams } from "@/lib/api/api.types";
import { MetricsMapper } from "@/features/metrics/api/mappers/metrics.mapper";
import { analyticsApi } from "@/lib/api/api";
import { apiGetRaw } from "@/lib/api/http.service";

export class MetricsService {
  public static GET_OVERVIEW_KEY = "get_metrics_overview_key";

  public static async getOverview(
    params?: MetricsQueryParams,
  ): Promise<ServiceResult<MetricsOverview>> {
    const result = await apiGetRaw<MetricsOverviewDTO>(
      analyticsApi,
      "/metrics/overview",
      params,
    );

    if (!result.data) return result as unknown as ServiceResult<MetricsOverview>;

    return { ...result, data: MetricsMapper.toOverview(result.data) };
  }

  public static async getPaymentFrequency(params?: MetricsQueryParams) {
    return apiGetRaw<PaymentFrequencyDTO>(analyticsApi, "/metrics/payment-frequency", params);
  }

  public static async getTransactionStatus(params?: MetricsQueryParams) {
    return apiGetRaw<TransactionStatusDTO>(analyticsApi, "/metrics/transaction-status", params);
  }

  public static async getRejectionReasons(params?: MetricsQueryParams) {
    return apiGetRaw<RejectionReasonsDTO>(analyticsApi, "/metrics/rejection-reasons", params);
  }

  public static async getTopBanks(params?: MetricsQueryParams) {
    return apiGetRaw<TopBanksDTO>(analyticsApi, "/metrics/top-banks", params);
  }

  public static async getTopBeneficiaries(params?: MetricsQueryParams) {
    return apiGetRaw<TopBeneficiariesDTO>(analyticsApi, "/metrics/top-beneficiaries", params);
  }

  public static async getBatchStats(params?: MetricsQueryParams) {
    return apiGetRaw<BatchStatsDTO>(analyticsApi, "/metrics/batch-stats", params);
  }

  public static async getAmlCompliance(params?: MetricsQueryParams) {
    return apiGetRaw<AmlComplianceDTO>(analyticsApi, "/metrics/aml-compliance", params);
  }

  public static async getAccountBreakdown(params?: MetricsQueryParams) {
    return apiGetRaw<AccountBreakdownDTO>(analyticsApi, "/metrics/account-breakdown", params);
  }

  public static async getRecurringFailures(params?: MetricsQueryParams) {
    return apiGetRaw<RecurringFailuresDTO>(analyticsApi, "/metrics/recurring-failures", params);
  }

  public static async getDashboard(params?: MetricsQueryParams) {
    return apiGetRaw<MetricsDashboardDTO>(
      analyticsApi,
      "/metrics/dashboard",
      params,
    );
  }
}
