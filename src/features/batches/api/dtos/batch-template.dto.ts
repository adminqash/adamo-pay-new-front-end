export type BatchTemplateColumnDTO = {
  key: string
  label: string
  required: boolean
};

export type BatchTemplateDTO = {
  version: string
  format: string
  delimiter: string
  encoding: string
  fileName?: string
  columns: BatchTemplateColumnDTO[]
  sampleRow?: Record<string, string | number>
  allowedIdTypes?: string[]
  allowedAccountTypes?: string[]
};
