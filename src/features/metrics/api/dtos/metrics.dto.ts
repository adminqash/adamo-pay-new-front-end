export type MetricsOverviewDTO = {
  period?: string
  totalVolume?: {
    value: number
    currency?: string
    variation: number
    trend: "up" | "down" | "flat"
  }
  totalTransactions?: {
    value: number
    variation: number
    trend: string
  }
  averageTicket?: {
    value: number
    currency?: string
    variation: number
    trend: "up" | "down" | "flat"
  }
  averageFunding?: {
    value: number
    currency?: string
    variation: number
    trend: "up" | "down" | "flat"
  }
};

export type PaymentFrequencyDTO = {
  totalPayments: number
  dataPoints: Array<{ label: string, payments: number }>
};

export type TransactionStatusDTO = {
  statusDistribution: {
    pending: number
    forReview?: number
    waitingForResolution?: number
    validated: number
    paid: number
    returned: number
    rejected: number
  }
};

export type RejectionReasonsDTO = {
  rejectionReasons: Array<{
    code: string
    title: string
    percentage: number
    cases: number
  }>
};

export type TopBanksDTO = {
  topBanks: Array<{
    bankCode: string
    bankName: string
    transactions: number
    responseTimeMs: number
  }>
};

export type TopBeneficiariesDTO = {
  topBeneficiariesByAmount: Array<{
    beneficiaryId: string
    name: string
    amount: number
    rank: number
  }>
  topBeneficiariesByCount: Array<{
    beneficiaryId: string
    name: string
    transactions: number
    rank: number
  }>
  newBeneficiaries?: number
  newBeneficiariesVariation?: number
  newBeneficiariesTrend?: "up" | "down" | "flat"
};

export type BatchStatsDTO = {
  batchStats: {
    average: number
    maximum: number
    minimum: number
    totalBatches: number
  }
};

export type AmlComplianceDTO = {
  amlCompliance: {
    totalValidations: number
    passed: number
    flagged: number
    failed: number
  }
};

export type AccountBreakdownDTO = {
  accountBreakdown: Array<{
    accountId: string
    name: string
    transactions: number
    amount: number
  }>
  topRecurringBeneficiaries?: Array<{
    beneficiaryId: string
    name: string
    transactions: number
    amount: number
    rank: number
  }>
};

export type RecurringFailuresDTO = {
  recurringFailures: Array<{
    beneficiaryId: string
    name: string
    returns: number
    rejections: number
  }>
};

export type MetricsDashboardDTO = {
  period?: string
  overview: MetricsOverviewDTO
  paymentFrequency: PaymentFrequencyDTO
  transactionStatus: TransactionStatusDTO
  rejectionReasons: RejectionReasonsDTO["rejectionReasons"]
  topBanks: TopBanksDTO["topBanks"]
  topBeneficiaries: {
    topBeneficiariesByAmount: TopBeneficiariesDTO["topBeneficiariesByAmount"]
    topBeneficiariesByCount: TopBeneficiariesDTO["topBeneficiariesByCount"]
    newBeneficiaries: number
    newBeneficiariesVariation: number
    newBeneficiariesTrend?: "up" | "down" | "flat"
  }
  batchStats: BatchStatsDTO["batchStats"] & {
    statusDistribution: {
      completed: number
      sent: number
      processing: number
    }
    rejectionSummary: {
      rejectedPercent: number
      othersPercent: number
      totalPayments: number
      rejectedPayments?: number
    }
  }
  amlCompliance: AmlComplianceDTO["amlCompliance"]
  accountBreakdown: AccountBreakdownDTO["accountBreakdown"]
  topRecurringBeneficiaries?: AccountBreakdownDTO["topRecurringBeneficiaries"]
  recurringFailures: RecurringFailuresDTO["recurringFailures"]
};

export type TransactionsMetricsDTO = {
  paymentFrequency: PaymentFrequencyDTO
  transactionStatus: TransactionStatusDTO
  rejectionReasons: RejectionReasonsDTO["rejectionReasons"]
  topBanks: TopBanksDTO["topBanks"]
  amlCompliance: AmlComplianceDTO["amlCompliance"]
};

export type BeneficiariesMetricsDTO = TopBeneficiariesDTO & {
  newBeneficiaries: number
  newBeneficiariesVariation: number
  recurringFailures: RecurringFailuresDTO["recurringFailures"]
};

export type BatchesMetricsDTO = {
  batchStats: MetricsDashboardDTO["batchStats"]
};

export type AccountsMetricsDTO = {
  accountBreakdown: AccountBreakdownDTO["accountBreakdown"]
  topRecurringBeneficiaries: NonNullable<AccountBreakdownDTO["topRecurringBeneficiaries"]>
};
