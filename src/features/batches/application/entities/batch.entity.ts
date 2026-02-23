/**
 * batch status
 */
export type BatchStatus = "pending" | "processing" | "completed";

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
}
