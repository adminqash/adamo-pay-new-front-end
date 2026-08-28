export type ComplianceCheckScreeningDTO = {
  verdict?: string
  sendable?: boolean
  reasons?: Array<{ code: string, detail?: string }>
};

export type ComplianceCheckDTO = {
  id: string
  checkType?: string
  subjectType?: string
  subjectId?: string
  batchId?: string
  batchName?: string
  rowNumber?: number
  beneficiaryName?: string
  documentNumber?: string
  status?: string
  hasNewActivity?: boolean
  screening?: ComplianceCheckScreeningDTO
  createdAt?: string
};

export type ComplianceSummaryDTO = {
  pendingFindings: number
  waitingResolution: number
  newActivity: number
};
