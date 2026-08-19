import type { BatchStatus } from "@/features/batches/application/entities/batch.entity";

export type BatchScreeningSummaryDTO = {
  pending: number
  allow: number
  clientReview: number
  review: number
  blocked: number
  failed: number
};

export type BatchListItemDTO = {
  id: string
  batchId: string
  name: string
  status: string
  lastAction?: string
  summary?: {
    totalItems: number
    validItems: number
    invalidItems: number
    totalAmount: number
    currency: string
    screening?: BatchScreeningSummaryDTO
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
