export type BeneficiaryListItemDTO = {
  id: string
  organizationId: string
  fullName: string
  identificationDocument?: {
    type: string
    number: string
    numberFormatted?: string
  }
  email?: string
  phone?: string
  status: string
  flags: {
    hasUpdates?: boolean
    hasPendingPayments?: boolean
    hasComplianceIssues?: boolean
  }
  totalPaid?: {
    amount: number
    currency: string
    countryCode: string
  }
  paymentCount?: number
  lastPaymentAt?: string
  primaryBankAccountId?: string
  createdAt: string
};

export type BeneficiaryDetailDTO = BeneficiaryListItemDTO & {
  firstName?: string
  lastName?: string
  notes?: string
  metadata: Record<string, unknown>
  riskScore?: number
  tags: string[]
  lastAction?: string
  lastActionAt?: string
  updatedAt: string
};

export type BankAccountListItemDTO = {
  id: string
  organizationId: string
  beneficiaryId: string
  bankCode: string
  bankName: string
  accountType: string
  accountNumber: string
  accountNumberFormatted?: string
  isPrimary: boolean
  verified: boolean
  status: string
  createdAt: string
};

export type CardListItemDTO = {
  id: string
  organizationId: string
  beneficiaryId: string
  alias: string
  type: "physical" | "virtual"
  cardNumberMasked: string
  lastFour: string
  monthlyLimit: number
  currentBalance: number
  currency: string
  status: string
  gradient?: string
  activatedAt?: string
  expiresAt?: string
  createdAt: string
};

export type CardMovementDTO = {
  id: string
  organizationId: string
  cardId: string
  beneficiaryId: string
  type: "debit" | "credit" | "recharge" | "refund"
  amount: number
  currency: string
  merchantName?: string
  description?: string
  status: string
  referenceId?: string
  createdAt: string
};
