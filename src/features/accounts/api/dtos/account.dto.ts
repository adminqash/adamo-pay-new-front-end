export type AccountListItemDTO = {
  id: string
  organizationId: string
  name: string
  currency: string
  countryCode: string
  balance: number
  reservedBalance: number
  assignedBalance: number
  status: string
  isDefault: boolean
  createdAt: string
};

export type AccountBalanceSummaryDTO = {
  accountCount: number
  totalBalance: number
  totalReserved: number
  totalAssigned: number
  byCurrency: Array<{
    currency: string
    accountCount: number
    totalBalance: number
    totalReserved: number
    availableBalance: number
  }>
};

export type MovementDTO = {
  id: string
  accountId: string
  type: string
  amount: number
  currency: string
  balanceBefore: number
  balanceAfter: number
  referenceType: string
  referenceId: string
  description?: string
  createdAt: string
};
