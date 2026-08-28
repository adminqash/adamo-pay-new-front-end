export type DashboardBalanceDTO = {
  availableBalances: Array<{
    amount: number
    currency: string
    countryCode: string
  }>
};

export type DashboardTransactionsDTO = {
  transactions: {
    total: number
    pending: number
    returned: number
    rejected: number
    validated: number
    paid: number
  }
};

export type DashboardComplianceDTO = {
  pendingFindings: number
  waitingResolution: number
  newActivity: number
};

export type DashboardSummaryDTO = DashboardBalanceDTO & DashboardTransactionsDTO & {
  compliance?: DashboardComplianceDTO
};
