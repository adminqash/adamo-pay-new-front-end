import type {
  AccountBreakdownDTO,
  AccountsMetricsDTO,
  AmlComplianceDTO,
  BatchesMetricsDTO,
  BatchStatsDTO,
  BeneficiariesMetricsDTO,
  MetricsDashboardDTO,
  MetricsOverviewDTO,
  PaymentFrequencyDTO,
  RecurringFailuresDTO,
  RejectionReasonsDTO,
  TopBanksDTO,
  TopBeneficiariesDTO,
  TransactionStatusDTO,
  TransactionsMetricsDTO,
} from "@/features/metrics/api/dtos/metrics.dto";
import {
  getCurrencyUpperForCountry,
  getLocaleForCountry,
  getStoredCountryCodeAlpha3,
  toCountryCodeAlpha2,
} from "@/lib/country/country-code";
import { formatCurrencyDisplay } from "@/lib/utils/currency.utils";

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

export type MetricsTransactions = {
  paymentFrequency: ReturnType<typeof MetricsMapper.toPaymentFrequency>
  paymentFrequencyTotal: number
  transactionStatusData: ReturnType<typeof MetricsMapper.toTransactionStatusChart>
  transactionStatusTotal: number
  rejectionReasons: ReturnType<typeof MetricsMapper.toRejectionReasons>
  topBanks: ReturnType<typeof MetricsMapper.toTopBanks>
  amlComplianceData: Array<{ name: string, value: number, color: string }>
  amlComplianceTotal: number
};

export type MetricsBeneficiaries = {
  topBeneficiariesByAmount: ReturnType<typeof MetricsMapper.toTopBeneficiariesByAmount>
  topBeneficiariesByCount: ReturnType<typeof MetricsMapper.toTopBeneficiariesByCount>
  recurringFailures: ReturnType<typeof MetricsMapper.toRecurringFailures>
  newBeneficiaries: number
  newBeneficiariesVariation: number
  newBeneficiariesTrend: "up" | "down" | "flat"
};

export type MetricsBatches = {
  batchStats: ReturnType<typeof MetricsMapper.toBatchStats>
  batchStatusData: Array<{ name: string, value: number, color: string }>
  batchRejectionData: Array<{ name: string, value: number, color: string }>
  batchRejectionTotal: number
  batchRejectionPayments: number
};

export type MetricsAccounts = {
  accountCountData: Array<{ name: string, value: number, color: string }>
  accountAmountData: Array<{ name: string, value: number, color: string }>
  accountTableData: ReturnType<typeof MetricsMapper.toAccountBreakdown>
};

export type MetricsDashboard = {
  overview: MetricsOverview
} & MetricsTransactions & MetricsBeneficiaries & MetricsBatches & MetricsAccounts;

const CHART_COLORS = ["#10b981", "#60a5fa", "#f59e0b", "#fca5a5", "#9ca3af", "#ef4444", "#d1d5db"];

function mapBankVariant(responseTimeMs: number): "success-medium" | "warning-medium" | "destructive-medium" {
  const minutes = responseTimeMs / 60000;
  if (minutes <= 5) return "success-medium";
  if (minutes <= 15) return "warning-medium";
  return "destructive-medium";
}

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
    return (dto.dataPoints ?? []).map((point) => ({
      label: point.label,
      payments: point.payments,
    }));
  }

  public static toTransactionStatusChart(dto: TransactionStatusDTO, t: (key: string) => string) {
    const dist = dto.statusDistribution ?? {
      pending: 0,
      validated: 0,
      paid: 0,
      returned: 0,
      rejected: 0,
    };
    return [
      { name: t("metrics.transaction_status.status.completed"), value: dist.paid, color: "#10b981" },
      { name: t("metrics.transaction_status.status.validated"), value: dist.validated, color: "#60a5fa" },
      { name: t("metrics.transaction_status.status.returned"), value: dist.returned, color: "#f59e0b" },
      { name: t("metrics.transaction_status.status.rejected"), value: dist.rejected, color: "#fca5a5" },
      { name: t("metrics.transaction_status.status.pending"), value: dist.pending, color: "#9ca3af" },
      { name: t("metrics.transaction_status.status.for-review"), value: dist.forReview ?? 0, color: "#c4b5fd" },
      { name: t("metrics.transaction_status.status.waiting-for-resolution"), value: dist.waitingForResolution ?? 0, color: "#818cf8" },
    ];
  }

  public static toRejectionReasons(dto: RejectionReasonsDTO) {
    return (dto.rejectionReasons ?? []).map((reason) => ({
      code: reason.code,
      title: reason.title,
      percentage: reason.percentage,
      cases: reason.cases,
    }));
  }

  public static toTopBanks(dto: TopBanksDTO) {
    return (dto.topBanks ?? []).map((bank) => ({
      name: bank.bankName,
      transactions: bank.transactions,
      responseTime: Number((bank.responseTimeMs / 60000).toFixed(1)),
      variant: mapBankVariant(bank.responseTimeMs),
    }));
  }

  public static toTopBeneficiariesByCount(dto: TopBeneficiariesDTO) {
    return (dto.topBeneficiariesByCount ?? []).map((item) => ({
      name: item.name,
      transactions: item.transactions,
      rank: item.rank,
    }));
  }

  public static toTopBeneficiariesByAmount(dto: TopBeneficiariesDTO) {
    return (dto.topBeneficiariesByAmount ?? []).map((item) => ({
      name: item.name,
      amount: formatCurrencyDisplay(item.amount),
      rank: item.rank,
    }));
  }

  public static toBatchStats(dto: BatchStatsDTO) {
    return {
      average: dto.batchStats?.average ?? 0,
      maximum: dto.batchStats?.maximum ?? 0,
      minimum: dto.batchStats?.minimum ?? 0,
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
    return (dto.accountBreakdown ?? []).map((account, index) => ({
      rank: index + 1,
      name: account.name,
      transactions: account.transactions,
      amount: formatCurrencyDisplay(account.amount),
    }));
  }

  public static toRecurringBeneficiariesTable(
    items: NonNullable<AccountBreakdownDTO["topRecurringBeneficiaries"]> = [],
  ) {
    return items.map((item, index) => ({
      rank: item.rank ?? index + 1,
      name: item.name,
      transactions: item.transactions,
      amount: formatCurrencyDisplay(item.amount),
    }));
  }

  public static toRecurringFailures(dto: RecurringFailuresDTO) {
    return (dto.recurringFailures ?? []).map((item, index) => ({
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
    return (accounts ?? []).map((account, index) => ({
      name: account.name,
      value: valueKey === "transactions" ? account.transactions : account.amount,
      color: CHART_COLORS[index % CHART_COLORS.length],
    }));
  }

  public static toTransactionsTab(
    dto: TransactionsMetricsDTO,
    t?: (key: string) => string,
  ): MetricsTransactions {
    const translate = t ?? ((key: string) => key);
    const statusDist = dto.transactionStatus?.statusDistribution ?? {
      pending: 0,
      validated: 0,
      paid: 0,
      returned: 0,
      rejected: 0,
    };
    const transactionStatusTotal
      = statusDist.pending
        + (statusDist.forReview ?? 0)
        + (statusDist.waitingForResolution ?? 0)
        + statusDist.validated
        + statusDist.paid
        + statusDist.returned
        + statusDist.rejected;

    return {
      paymentFrequency: MetricsMapper.toPaymentFrequency(
        dto.paymentFrequency ?? { totalPayments: 0, dataPoints: [] },
      ),
      paymentFrequencyTotal: dto.paymentFrequency?.totalPayments ?? 0,
      transactionStatusData: MetricsMapper.toTransactionStatusChart(
        dto.transactionStatus ?? { statusDistribution: statusDist },
        translate,
      ),
      transactionStatusTotal,
      rejectionReasons: MetricsMapper.toRejectionReasons({
        rejectionReasons: dto.rejectionReasons,
      }),
      topBanks: MetricsMapper.toTopBanks({ topBanks: dto.topBanks }),
      amlComplianceData: MetricsMapper.toAmlComplianceFromSnapshot(
        dto.amlCompliance ?? { totalValidations: 0, passed: 0, flagged: 0, failed: 0 },
        translate,
      ),
      amlComplianceTotal: dto.amlCompliance?.totalValidations ?? 0,
    };
  }

  public static toBeneficiariesTab(dto: BeneficiariesMetricsDTO): MetricsBeneficiaries {
    return {
      topBeneficiariesByAmount: MetricsMapper.toTopBeneficiariesByAmount(dto),
      topBeneficiariesByCount: MetricsMapper.toTopBeneficiariesByCount(dto),
      recurringFailures: MetricsMapper.toRecurringFailures({
        recurringFailures: dto.recurringFailures,
      }),
      newBeneficiaries: dto.newBeneficiaries ?? 0,
      newBeneficiariesVariation: Math.abs(dto.newBeneficiariesVariation ?? 0),
      newBeneficiariesTrend: dto.newBeneficiariesTrend ?? "flat",
    };
  }

  public static toBatchesTab(
    dto: BatchesMetricsDTO,
    t?: (key: string) => string,
  ): MetricsBatches {
    const translate = t ?? ((key: string) => key);
    const batchStats = dto.batchStats ?? {
      average: 0,
      maximum: 0,
      minimum: 0,
      totalBatches: 0,
      statusDistribution: { completed: 0, sent: 0, processing: 0 },
      rejectionSummary: { rejectedPercent: 0, othersPercent: 100, totalPayments: 0 },
    };
    const batchStatus = batchStats.statusDistribution ?? {
      completed: 0,
      sent: 0,
      processing: 0,
    };
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

    const rejectionSummary = batchStats.rejectionSummary ?? {
      rejectedPercent: 0,
      othersPercent: 100,
      totalPayments: 0,
    };
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
      batchStats: MetricsMapper.toBatchStats({ batchStats }),
      batchStatusData,
      batchRejectionData,
      batchRejectionTotal: batchStats.totalBatches,
      batchRejectionPayments: rejectionSummary.rejectedPayments ?? rejectionSummary.totalPayments,
    };
  }

  public static toAccountsTab(dto: AccountsMetricsDTO): MetricsAccounts {
    const tableSource = dto.topRecurringBeneficiaries ?? [];

    return {
      accountCountData: MetricsMapper.toAccountPieData(dto.accountBreakdown ?? [], "transactions"),
      accountAmountData: MetricsMapper.toAccountPieData(dto.accountBreakdown ?? [], "amount"),
      accountTableData: MetricsMapper.toRecurringBeneficiariesTable(tableSource),
    };
  }

  public static toDashboard(
    dto: MetricsDashboardDTO,
    t?: (key: string) => string,
    countryCode: string = getStoredCountryCodeAlpha3(),
  ): MetricsDashboard {
    return {
      overview: MetricsMapper.toOverview(dto.overview, countryCode),
      ...MetricsMapper.toTransactionsTab(dto, t),
      ...MetricsMapper.toBeneficiariesTab({
        ...dto.topBeneficiaries,
        recurringFailures: dto.recurringFailures,
      }),
      ...MetricsMapper.toBatchesTab({ batchStats: dto.batchStats }, t),
      ...MetricsMapper.toAccountsTab({
        accountBreakdown: dto.accountBreakdown,
        topRecurringBeneficiaries: dto.topRecurringBeneficiaries ?? [],
      }),
    };
  }
}
