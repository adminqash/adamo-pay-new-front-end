export type CreateBeneficiaryDTO = {
  documentType: string
  documentNumber: string
  firstName: string
  lastName: string
  accountType: string
  bank: string
  accountNumber: string
  isMainAccount?: boolean
};

export type UpdateBeneficiaryDTO = {
  firstName?: string
  lastName?: string
  idType?: string
  idNumber?: string
  totp?: string
};

export type CreateBankAccountDTO = {
  accountType: string
  bank: string
  accountNumber: string
  isPrimary?: boolean
};

export type UpdateBankAccountDTO = {
  accountType?: string
  bank?: string
  accountNumber?: string
  isPrimary?: boolean
  totp?: string
};
