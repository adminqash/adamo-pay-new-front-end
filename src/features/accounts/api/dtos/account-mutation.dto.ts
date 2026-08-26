export type CreateAccountDTO = {
  name: string
  currency?: string
  countryCode?: string
  isDefault?: boolean
};

export type UpdateAccountDTO = {
  name: string
  totp?: string
};

export type TransferAccountDTO = {
  toAccountId: string
  amount: number
  totp?: string
};

export type TransferResultDTO = {
  transferId: string
  fromAccountId: string
  toAccountId: string
  amount: number
  currency: string
  status?: "pending" | "completed"
};
