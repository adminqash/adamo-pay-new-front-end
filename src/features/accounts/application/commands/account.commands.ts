export type CreateAccountCommand = {
  name: string
  currency?: string
  countryCode?: string
};

export type UpdateAccountCommand = {
  accountId: string
  name: string
  totp?: string
};

export type DeleteAccountCommand = {
  accountId: string
  totp?: string
};

export type TransferAccountCommand = {
  fromAccountId: string
  toAccountId: string
  amount: number
  totp?: string
};
