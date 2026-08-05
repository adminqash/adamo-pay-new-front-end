import type { Transaction } from "@/features/transactions/application/entities/transaction.entity";

export type TransactionTimelineItem = {
  id: string
  title: string
  description?: string
  time: string
  status: "complete" | "active" | "pending"
};

export type TransactionDetail = Transaction & {
  idTypeLabel: string
  destinationAccountLabel: string
  sourceAccountName: string
  statusReason?: string
  timeline: TransactionTimelineItem[]
};
