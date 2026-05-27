/**
 * home entity
 * 
 * domain model for the home feature
 */

/**
 * wallet balance information
 */
export interface WalletBalance {
  /**
   * total balance amount
   */
  amount: string;

  /**
   * currency code (e.g., "COP")
   */
  currency: string;

  /**
   * country flag icon or code (e.g., "CO")
   */
  countryCode: string;
}

/**
 * transaction statistics
 */
export interface TransactionStats {
  /**
   * number of pending transactions
   */
  pending: number;

  /**
   * number of returned transactions
   */
  returned: number;

  /**
   * number of rejected transactions
   */
  rejected: number;

  /**
   * number of validated transactions
   */
  validated: number;

  /**
   * number of paid transactions
   */
  paid: number;
}

/**
 * home data entity
 */
export interface Home {
  /**
   * wallet balance information
   */
  walletBalance: WalletBalance;

  /**
   * transaction statistics
   */
  transactionStats: TransactionStats;
}
