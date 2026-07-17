export type CreateBatchCommand = {
  batchId: string
  name: string
  sourceAccountId?: string
  currency: string
  countryCode: string
  fileId?: string
};

export type ProcessBatchCommand = {
  batchId: string
  totp?: string
};

export type UpdateBatchCommand = {
  batchId: string
  lastAction?: "saved_pending"
  name?: string
  sourceAccountId?: string
};

export type UpdateBatchTransactionCommand = {
  batchId: string
  transactionId: string
  rawData: {
    beneficiaryName?: string
    idType?: string
    idNumber?: string
    bankCode?: string
    bankName?: string
    accountType?: string
    accountNumber?: string
    amount?: number
    reference?: string
  }
};

export type UpdateBatchTransactionStatusCommand = {
  batchId: string
  transactionId: string
  status: "pending" | "valid" | "rejected"
};
