export type BatchTransactionValidationErrorDTO = {
  field: string
  code: string
  message: string
  cell?: string
  column?: string
  excelRow?: number
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

export type BatchTransactionScreeningDTO = {
  screeningId?: string
  verdict?: "allow" | "client-review" | "review" | "blocked" | "failed"
  caseId?: string
  reasons?: Array<{ code: string, rule?: string, detail?: string }>
  alerts?: Array<{ code: string, rule?: string, detail?: string }>
  deferredScreening?: boolean
  screenedAt?: string
  sendable?: boolean
  resolution?: "none" | "client" | "adamo" | "final"
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
  screening?: BatchTransactionScreeningDTO
  sendable?: boolean
  paymentId?: string
  createdAt: string
};
