export type BatchTransactionDetailStatus
  = | "pending"
    | "validated"
    | "paid"
    | "returned"
    | "rejected";

export type BatchTransactionDetail = {
  id: string
  status: BatchTransactionDetailStatus
  beneficiary: {
    fullName: string
    idType: string
    idNumber: string
    hasIssues: boolean
  }
  payment: {
    amount: number
    accountType: string
    bank: string
    accountNumber: string
    accountMismatch: boolean
  }
  reference: {
    number: string | null
    notFound: boolean
  }
  restrictiveList: {
    listName: string
    riskLevel: "low" | "medium" | "high"
  } | null
};
