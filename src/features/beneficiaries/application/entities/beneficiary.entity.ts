export type Beneficiary = {
  id: string
  name: string
  idNumber: string
  account: string
  status: "warning" | "success"
};

export type BeneficiaryDetail = {
  fullName: string
  hasUpdates: boolean
  hasPendingPayments: boolean
  identificationDocument: {
    type: string
    number: string
  }
  bankAccount: {
    type: string
    bank: string
    number: string
  }
  totalPaid: {
    amount: number
    currency: string
    countryCode: string
  }
};

export type BankAccount = {
  id: string
  bank: string
  accountType: string
  accountNumber: string
  isPrimary: boolean
};

export type BeneficiaryTransaction = {
  id: string
  date: string
  amount: string
  reference: string
  status: "pending" | "completed" | "failed"
};

export type CardMovement = {
  id: string
  date: string
  amount: string
  type: string
};
