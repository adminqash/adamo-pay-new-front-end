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
import {
  getCurrencyUpperForCountry,
  getLocaleForCountry,
  getStoredCountryCodeAlpha3,
  toCountryCodeAlpha2,
} from "@/lib/country/country-code";
import { formatCurrencyDisplay } from "@/lib/utils/currency.utils";

export type MetricsDashboard = {
  overview: MetricsOverview
  paymentFrequency: ReturnType<typeof MetricsMapper.toPaymentFrequency>
  paymentFrequencyTotal: number
  transactionStatusData: ReturnType<typeof MetricsMapper.toTransactionStatusChart>
  transactionStatusTotal: number
  rejectionReasons: ReturnType<typeof MetricsMapper.toRejectionReasons>
  topBanks: ReturnType<typeof MetricsMapper.toTopBanks>
  topBeneficiariesByAmount: ReturnType<typeof MetricsMapper.toTopBeneficiariesByAmount>
  topBeneficiariesByCount: ReturnType<typeof MetricsMapper.toTopBeneficiariesByCount>
  batchStats: ReturnType<typeof MetricsMapper.toBatchStats>
  batchStatusData: Array<{ name: string, value: number, color: string }>
  batchRejectionData: Array<{ name: string, value: number, color: string }>
  batchRejectionTotal: number
  batchRejectionPayments: number
  amlComplianceData: Array<{ name: string, value: number, color: string }>
  amlComplianceTotal: number
  accountCountData: Array<{ name: string, value: number, color: string }>
  accountAmountData: Array<{ name: string, value: number, color: string }>
  accountTableData: ReturnType<typeof MetricsMapper.toAccountBreakdown>
  recurringFailures: ReturnType<typeof MetricsMapper.toRecurringFailures>
  newBeneficiaries: number
  newBeneficiariesVariation: number
};

const CHART_COLORS = ["#10b981", "#60a5fa", "#f59e0b", "#fca5a5", "#9ca3af", "#ef4444", "#d1d5db"];

function mapBankVariant(responseTimeMs: number): "success-medium" | "warning-medium" | "destructive-medium" {
  const minutes = responseTimeMs / 60000;
  if (minutes <= 5) return "success-medium";
  if (minutes <= 15) return "warning-medium";
  return "destructive-medium";
}

export type MetricsOverview = {
  totalVolume: {
    value: string
    countryCode: string
    variation: { value: number, trend: "up" | "down" }
  }
  totalTransactions: {
    value: string
    variation: { value: number, trend: "up" | "down" }
  }
  averageTicket: {
    value: string
    variation: { value: number, trend: "up" | "down" }
  }
  averageFunding: {
    value: string
    variation: { value: number, trend: "up" | "down" }
  }
};

function mapTrend(trend: string): "up" | "down" {
  return trend === "down" ? "down" : "up";
}

function formatCount(value: number, countryCode?: string): string {
  return new Intl.NumberFormat(getLocaleForCountry(countryCode)).format(value);
}

export class MetricsMapper {
  public static toOverview(
    dto: MetricsOverviewDTO,
    countryCode: string = getStoredCountryCodeAlpha3(),
  ): MetricsOverview {
    const currency = dto.totalVolume?.currency ?? getCurrencyUpperForCountry(countryCode);

    return {
      totalVolume: {
        value: dto.totalVolume
          ? formatCurrencyDisplay(dto.totalVolume.value, currency)
          : "$0,00",
        countryCode: toCountryCodeAlpha2(countryCode),
        variation: {
          value: Math.abs(dto.totalVolume?.variation ?? 0),
          trend: mapTrend(dto.totalVolume?.trend ?? "up"),
        },
      },
      totalTransactions: {
        value: dto.totalTransactions
          ? formatCount(dto.totalTransactions.value, countryCode)
          : "0",
        variation: {
          value: Math.abs(dto.totalTransactions?.variation ?? 0),
          trend: mapTrend(dto.totalTransactions?.trend ?? "up"),
        },
      },
      averageTicket: {
        value: dto.averageTicket
          ? formatCurrencyDisplay(dto.averageTicket.value, dto.averageTicket.currency ?? currency)
          : "$0,00",
        variation: {
          value: Math.abs(dto.averageTicket?.variation ?? 0),
          trend: mapTrend(dto.averageTicket?.trend ?? "up"),
        },
      },
      averageFunding: {
        value: dto.averageFunding
          ? formatCurrencyDisplay(dto.averageFunding.value, dto.averageFunding.currency ?? currency)
          : "$0,00",
        variation: {
          value: Math.abs(dto.averageFunding?.variation ?? 0),
          trend: mapTrend(dto.averageFunding?.trend ?? "up"),
        },
      },
    };
  }

  public static toPaymentFrequency(dto: PaymentFrequencyDTO) {
    return dto.dataPoints.map((point) => ({
      label: point.label,
      payments: point.payments,
    }));
  }

  public static toTransactionStatusChart(dto: TransactionStatusDTO, t: (key: string) => string) {
    const dist = dto.statusDistribution;
    return [
      { name: t("metrics.transaction_status.status.completed"), value: dist.paid, color: "#10b981" },
      { name: t("metrics.transaction_status.status.validated"), value: dist.validated, color: "#60a5fa" },
      { name: t("metrics.transaction_status.status.returned"), value: dist.returned, color: "#f59e0b" },
      { name: t("metrics.transaction_status.status.rejected"), value: dist.rejected, color: "#fca5a5" },
      { name: t("metrics.transaction_status.status.pending"), value: dist.pending, color: "#9ca3af" },
    ];
  }

  public static toRejectionReasons(dto: RejectionReasonsDTO) {
    return dto.rejectionReasons.map((reason) => ({
      code: reason.code,
      title: reason.title,
      percentage: reason.percentage,
      cases: reason.cases,
    }));
  }

  public static toTopBanks(dto: TopBanksDTO) {
    return dto.topBanks.map((bank) => ({
      name: bank.bankName,
      transactions: bank.transactions,
      responseTime: Number((bank.responseTimeMs / 60000).toFixed(1)),
      variant: mapBankVariant(bank.responseTimeMs),
    }));
  }

  public static toTopBeneficiariesByCount(dto: TopBeneficiariesDTO) {
    return dto.topBeneficiariesByCount.map((item) => ({
      name: item.name,
      transactions: item.transactions,
      rank: item.rank,
    }));
  }

  public static toTopBeneficiariesByAmount(dto: TopBeneficiariesDTO) {
    return dto.topBeneficiariesByAmount.map((item) => ({
      name: item.name,
      amount: formatCurrencyDisplay(item.amount),
      rank: item.rank,
    }));
  }

  public static toBatchStats(dto: BatchStatsDTO) {
    return {
      average: dto.batchStats.average,
      maximum: dto.batchStats.maximum,
      minimum: dto.batchStats.minimum,
    };
  }

  public static toAmlCompliance(dto: AmlComplianceDTO, t: (key: string) => string) {
    const aml = dto.amlCompliance;
    const withIssues = aml.flagged + aml.failed;
    return [
      {
        name: t("metrics.aml_compliance.status.no_issues"),
        value: aml.passed,
        color: "#10b981",
      },
      {
        name: t("metrics.aml_compliance.status.with_issues"),
        value: withIssues,
        color: "#f59e0b",
      },
    ];
  }

  public static toAmlComplianceFromSnapshot(
    aml: MetricsDashboardDTO["amlCompliance"],
    t: (key: string) => string,
  ) {
    const withIssues = aml.flagged + aml.failed;
    return [
      {
        name: t("metrics.aml_compliance.status.no_issues"),
        value: aml.passed,
        color: "#10b981",
      },
      {
        name: t("metrics.aml_compliance.status.with_issues"),
        value: withIssues,
        color: "#f59e0b",
      },
    ];
  }

  public static toAccountBreakdown(dto: AccountBreakdownDTO) {
    return dto.accountBreakdown.map((account, index) => ({
      rank: index + 1,
      name: account.name,
      transactions: account.transactions,
      amount: formatCurrencyDisplay(account.amount),
    }));
  }

  public static toRecurringFailures(dto: RecurringFailuresDTO) {
    return dto.recurringFailures.map((item, index) => ({
      rank: index + 1,
      beneficiary: item.name,
      returns: item.returns,
      rejections: item.rejections,
    }));
  }

  public static toAccountPieData(
    accounts: AccountBreakdownDTO["accountBreakdown"],
    valueKey: "transactions" | "amount",
  ) {
    return accounts.map((account, index) => ({
      name: account.name,
      value: valueKey === "transactions" ? account.transactions : account.amount,
      color: CHART_COLORS[index % CHART_COLORS.length],
    }));
  }

  public static toDashboard(
    dto: MetricsDashboardDTO,
    t?: (key: string) => string,
    countryCode: string = getStoredCountryCodeAlpha3(),
  ): MetricsDashboard {
    const translate = t ?? ((key: string) => key);
    const statusDist = dto.transactionStatus.statusDistribution;
    const transactionStatusTotal
      = statusDist.pending
        + statusDist.validated
        + statusDist.paid
        + statusDist.returned
        + statusDist.rejected;

    const batchStatus = dto.batchStats.statusDistribution;
    const batchStatusData = [
      {
        name: translate("metrics.batch_status.status.completed"),
        value: batchStatus.completed,
        color: "#10b981",
      },
      {
        name: translate("metrics.batch_status.status.sent"),
        value: batchStatus.sent,
        color: "#60a5fa",
      },
      {
        name: translate("metrics.batch_status.status.processing"),
        value: batchStatus.processing,
        color: "#f59e0b",
      },
    ];

    const rejectionSummary = dto.batchStats.rejectionSummary;
    const batchRejectionData = [
      {
        name: translate("metrics.batch_rejection.status.rejected"),
        value: rejectionSummary.rejectedPercent,
        color: "#ef4444",
      },
      {
        name: translate("metrics.batch_rejection.status.others"),
        value: rejectionSummary.othersPercent,
        color: "#d1d5db",
      },
    ];

    return {
      overview: MetricsMapper.toOverview(dto.overview, countryCode),
      paymentFrequency: MetricsMapper.toPaymentFrequency(dto.paymentFrequency),
      paymentFrequencyTotal: dto.paymentFrequency.totalPayments,
      transactionStatusData: MetricsMapper.toTransactionStatusChart(dto.transactionStatus, translate),
      transactionStatusTotal,
      rejectionReasons: MetricsMapper.toRejectionReasons({
        rejectionReasons: dto.rejectionReasons,
      }),
      topBanks: MetricsMapper.toTopBanks({ topBanks: dto.topBanks }),
      topBeneficiariesByAmount: MetricsMapper.toTopBeneficiariesByAmount({
        topBeneficiariesByAmount: dto.topBeneficiaries.topBeneficiariesByAmount,
        topBeneficiariesByCount: dto.topBeneficiaries.topBeneficiariesByCount,
      }),
      topBeneficiariesByCount: MetricsMapper.toTopBeneficiariesByCount({
        topBeneficiariesByAmount: dto.topBeneficiaries.topBeneficiariesByAmount,
        topBeneficiariesByCount: dto.topBeneficiaries.topBeneficiariesByCount,
      }),
      batchStats: MetricsMapper.toBatchStats({ batchStats: dto.batchStats }),
      batchStatusData,
      batchRejectionData,
      batchRejectionTotal: dto.batchStats.totalBatches,
      batchRejectionPayments: rejectionSummary.totalPayments,
      amlComplianceData: MetricsMapper.toAmlComplianceFromSnapshot(dto.amlCompliance, translate),
      amlComplianceTotal: dto.amlCompliance.totalValidations,
      accountCountData: MetricsMapper.toAccountPieData(dto.accountBreakdown, "transactions"),
      accountAmountData: MetricsMapper.toAccountPieData(dto.accountBreakdown, "amount"),
      accountTableData: MetricsMapper.toAccountBreakdown({ accountBreakdown: dto.accountBreakdown }),
      recurringFailures: MetricsMapper.toRecurringFailures({ recurringFailures: dto.recurringFailures }),
      newBeneficiaries: dto.topBeneficiaries.newBeneficiaries,
      newBeneficiariesVariation: Math.abs(dto.topBeneficiaries.newBeneficiariesVariation ?? 0),
    };
  }
}
