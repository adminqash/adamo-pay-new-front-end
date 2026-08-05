export type BatchTransactionValidationErrorDTO = {
  field: string
  code: string
  message: string
};

export type BatchTransactionRawDataDTO = {
  beneficiaryName?: string
  idType?: string
  idNumber?: string
  bankCode?: string
  bankName?: string
  accountType?: string
  accountNumber?: string
  amount?: number
  reference?: string
};

export type BatchTransactionDTO = {
  id: string
  batchId: string
  rowNumber: number
  status: string
  rawData: BatchTransactionRawDataDTO
  parsedData?: {
    beneficiaryId?: string
    bankAccountId?: string
    amount?: number
    currency?: string
  }
  validationErrors?: BatchTransactionValidationErrorDTO[]
  paymentId?: string
  createdAt: string
};
