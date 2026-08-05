export type Account = {
  id: string
  name: string
  /** Formatted for UI (e.g. "$ 100,90") */
  balance: string
  /** Integer minor units from API */
  balanceMinor: number
  /** Available = balance - reserved (minor units) */
  availableMinor: number
  currency: string
  countryCode: string
};

export type AccountMovement = {
  id: string
  date: string
  type: string
  amount: string
};
