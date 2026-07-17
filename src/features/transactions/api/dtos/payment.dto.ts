import type { TransactionStatus } from "@/features/transactions/application/entities/transaction.entity";

export type PaymentListItemDTO = {
  id: string
  reference: string
  status: TransactionStatus
  beneficiary: string
  idNumber: string
  amount: number
  currency: string
  countryCode: string
  sourceAccountId: string
  createdAt: string
};
