import type { TransactionStatus } from "@/features/transactions/application/entities/transaction.entity";

export const PRODUCT_TRANSACTION_STATUSES = [
  "reviewed",
  "for-review",
  "waiting-for-resolution",
  "validated",
  "paid",
  "returned",
  "rejected",
] as const;

export function normalizePaymentStatus(status: string | undefined | null): TransactionStatus {
  switch (String(status || "").trim().toLowerCase()) {
    case "for-review":
      return "for-review";
    case "waiting-for-resolution":
      return "waiting-for-resolution";
    case "in-review":
    case "in_review":
      return "for-review";
    case "validated":
      return "validated";
    case "paid":
      return "paid";
    case "rejected":
      return "rejected";
    case "returned":
      return "returned";
    case "reviewed":
    case "pending":
    default:
      return "reviewed";
  }
}

export function normalizeBatchItemStatus(status: string | undefined | null): TransactionStatus {
  switch (String(status || "").trim().toLowerCase()) {
    case "paid":
      return "paid";
    case "returned":
      return "returned";
    case "rejected":
    case "invalid":
      return "rejected";
    case "valid":
    case "reviewed":
      return "reviewed";
    case "client-review":
    case "client_review":
    case "for-review":
      return "for-review";
    case "review":
    case "waiting-for-resolution":
      return "waiting-for-resolution";
    case "validated":
    case "processing":
      return "validated";
    case "pending":
    case "skipped":
    default:
      return "pending";
  }
}
