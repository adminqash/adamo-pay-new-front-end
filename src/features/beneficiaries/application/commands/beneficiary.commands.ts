export type CreateBeneficiaryCommand = {
  documentType: string
  documentNumber: string
  firstName: string
  lastName: string
  accountType: string
  bank: string
  accountNumber: string
  isMainAccount?: boolean
};

export type UpdateBeneficiaryCommand = {
  beneficiaryId: string
  firstName?: string
  lastName?: string
  idType?: string
  idNumber?: string
  totp?: string
};

export type CreateBankAccountCommand = {
  beneficiaryId: string
  accountType: string
  bank: string
  accountNumber: string
  isPrimary?: boolean
  totp?: string
};

export type UpdateBankAccountCommand = {
  beneficiaryId: string
  bankAccountId: string
  accountType?: string
  bank?: string
  accountNumber?: string
  isPrimary?: boolean
  totp?: string
};

export type DeleteBankAccountCommand = {
  beneficiaryId: string
  bankAccountId: string
  totp?: string
};

export type SetPrimaryBankAccountCommand = {
  beneficiaryId: string
  bankAccountId: string
};
