export type SourceCatalogItemDTO = {
  code: string
  type?: string
  name: string
}

export type SourceBankDTO = {
  name: string
  achCode: string
}

export type SourceCatalogDTO = {
  key: string
  countryCode: string
  currency: string
  documentTypes: SourceCatalogItemDTO[]
  accountTypes: SourceCatalogItemDTO[]
  supportedDocumentTypes?: SourceCatalogItemDTO[]
  supportedBankAccountTypes?: SourceCatalogItemDTO[]
  banks: SourceBankDTO[]
  specialBanks: string[]
  defaults?: {
    countryCode?: string
    currency?: string
    documentType?: string
    accountType?: string
  }
}
