export type Account = {
  id: string
  name: string
  /** Formatted available balance for UI (e.g. "$ 100,90") */
  balance: string
  /** Ledger balance in integer minor units */
  balanceMinor: number
  /** Available = balance - reserved (minor units) */
  availableMinor: number
  reservedMinor: number
  pendingMinor: number
  assignedMinor: number
  currency: string
  countryCode: string
};

export type AccountMovement = {
  id: string
  date: string
  type: string
  amount: string
};
