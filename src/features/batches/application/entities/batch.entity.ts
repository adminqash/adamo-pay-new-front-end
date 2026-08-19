/**
 * batch status
 */
export type BatchStatus = "pending" | "processing" | "completed";

export type BatchScreeningSummary = {
  pending: number
  allow: number
  clientReview: number
  review: number
  blocked: number
  failed: number
};

/**
 * batch entity
 */
export interface Batch {
  id: string;
  date: string;
  name: string;
  transactions: number;
  amount: number;
  batchId: string;
  status: BatchStatus;
  lastAction?: string;
  validItems: number;
  invalidItems: number;
  screening?: BatchScreeningSummary;
}
