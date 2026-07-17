import type { BatchStatus } from "@/features/batches/application/entities/batch.entity";

export type BatchListItemDTO = {
  id: string
  batchId: string
  name: string
  status: string
  summary?: {
    totalItems: number
    validItems: number
    invalidItems: number
    totalAmount: number
    currency: string
  }
  processing?: {
    processedCount: number
    paidCount: number
    rejectedCount: number
    returnedCount: number
  }
  createdAt: string
};

export type BatchStatusDTO = BatchStatus | "cancelled" | "failed";
