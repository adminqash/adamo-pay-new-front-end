export type CreatePaymentCommand = {
  reference?: string
  beneficiaryId?: string
  beneficiarySnapshot: {
    fullName: string
    idType: string
    idNumber: string
  }
  sourceAccountId: string
  destinationBankAccountId?: string
  destinationSnapshot: {
    accountType: string
    bank: string
    bankCode?: string
    accountNumber: string
  }
  amount: number
  currency: string
  countryCode: string
  totp?: string
  metadata?: {
    saveBeneficiary?: boolean
    channel?: "web" | "batch" | "quick_payment" | "api"
  }
};

export type CorrectPaymentCommand = {
  paymentId: string
  reference?: string
  beneficiarySnapshot?: {
    fullName: string
    idType: string
    idNumber: string
  }
  destinationBankAccountId?: string
  destinationSnapshot?: {
    accountType: string
    bank: string
    bankCode?: string
    accountNumber: string
  }
  amount?: number
  totp?: string
};

export type UpdatePaymentStatusCommand = {
  paymentId: string
  status: "reviewed" | "for-review" | "waiting-for-resolution" | "validated" | "paid" | "returned" | "rejected"
};
