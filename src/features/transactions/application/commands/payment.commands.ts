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
};

export type UpdatePaymentStatusCommand = {
  paymentId: string
  status: "reviewed" | "for-review" | "waiting-for-resolution" | "validated" | "paid" | "returned" | "rejected"
};
