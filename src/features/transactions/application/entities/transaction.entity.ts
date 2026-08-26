/**
 * transaction entity
 *
 * domain model for transactions
 */

/**
 * Product payment statuses:
 * reviewed — ready to send
 * for-review — compliance reviewed by the client
 * waiting-for-resolution — compliance reviewed by Adamo
 */
export type TransactionStatus =
  | "reviewed"
  | "for-review"
  | "waiting-for-resolution"
  | "validated"
  | "paid"
  | "returned"
  | "rejected"
  | "pending"
  | "in-review";

/**
 * transaction entity
 */
export interface Transaction {
  /**
   * unique transaction identifier
   */
  id: string;

  /**
   * transaction date
   */
  date: string;

  /**
   * beneficiary name
   */
  beneficiary: string;

  /**
   * ID number
   */
  idNumber: string;

  /**
   * transaction amount
   */
  amount: number;

  /**
   * transaction reference code
   */
  reference: string;

  /**
   * transaction status
   */
  status: TransactionStatus;

  /**
   * compliance engine verdict for this batch row, when available
   */
  screeningVerdict?: "allow" | "client-review" | "review" | "blocked" | "failed";

  /**
   * first validation or screening error shown in the batch table
   */
  screeningDetail?: string;
}
