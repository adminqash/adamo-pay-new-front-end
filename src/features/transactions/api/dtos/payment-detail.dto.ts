import type { TransactionStatus } from "@/features/transactions/application/entities/transaction.entity";

export type PaymentDetailDTO = {
  id: string
  reference: string
  status: TransactionStatus
  beneficiary: {
    id: string
    fullName: string
    idType: string
    idNumber: string
  }
  destination: {
    bankAccountId?: string
    accountType: string
    bank: string
    bankCode?: string
    accountNumber: string
  }
  sourceAccountId: string
  sourceAccountName?: string
  amount: number
  currency: string
  rejectionReason?: string
  returnReason?: string
  createdAt: string
};

export type PaymentTimelineEventDTO = {
  id: string
  paymentId: string
  event: string
  status: string
  message?: string
  createdAt: string
};

export type PaymentTimelineDTO = {
  paymentId: string
  events: PaymentTimelineEventDTO[]
};
