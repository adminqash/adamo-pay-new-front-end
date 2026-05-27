/**
 * transaction entity
 * 
 * domain model for transactions
 */

/**
 * transaction status type
 */
export type TransactionStatus = "pending" | "validated" | "paid" | "returned" | "rejected";

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
}
