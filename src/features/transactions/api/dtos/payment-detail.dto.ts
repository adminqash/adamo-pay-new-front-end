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
  batchId?: string
  batchItemId?: string
  screeningId?: string
  screening?: {
    verdict?: string
    findings?: Array<{ resolved?: boolean, nombreLista?: string }>
    findingsResolved?: boolean
    resolution?: string
  }
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
  actorUserId?: string
  actorName?: string
  metadata?: Record<string, unknown>
  createdAt: string
};

export type PaymentTimelineDTO = {
  paymentId: string
  events: PaymentTimelineEventDTO[]
};
