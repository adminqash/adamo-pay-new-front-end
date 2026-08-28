export type RiskBand = "low" | "medium" | "high";

export type ComplianceFinding = {
  codigoLista: string
  findingId: string
  key: string
  nombreLista: string
  riskLevel: number
  riskBand: RiskBand
  resolved: boolean
  resolutionNote?: string
  resolvedByName?: string
  resolvedAt?: string
};

export type InfolaftMatch = {
  id: string
  codigoLista: string
  nombreLista: string
  infoListId?: string
  comentarios?: string
  link?: string
  fullName: string
  tipo?: string
  documentId?: string
  country?: string
  score?: number
  riskLevel?: number
  comments?: string
  listNames?: string
  type?: string
};

export type ComplianceComment = {
  id: string
  type: "comment" | "finding-resolution" | "case-resolution"
  text: string
  authorName: string
  authorRole: "client" | "compliance"
  attachments: Array<{ id?: string, name: string, size?: number, contentType?: string }>
  createdAt: string
};

export type ComplianceReason = {
  code: string
  rule?: string
  detail?: string
};

export type ComplianceCase = {
  id: string
  subjectType: "batch_item" | "payment"
  subjectId: string
  batchId?: string
  batchName?: string
  paymentId?: string
  reference?: string
  status: string
  createdAt: string
  beneficiary: {
    fullName: string
    idType: string
    idNumber: string
  }
  payment: {
    amount: number
    currency: string
    accountType?: string
    bank?: string
    accountNumber?: string
  }
  findings: ComplianceFinding[]
  reasons: ComplianceReason[]
  alerts: ComplianceReason[]
  maxRiskLevel: number
  verdict?: string
  instance?: "adamo" | "client"
  monitoring: boolean
  suppressedVerdict?: string
  deferredScreening: boolean
  comments: ComplianceComment[]
  canResolveFindings: boolean
  canApprove: boolean
  canReject: boolean
  canComment: boolean
  findingsResolved: boolean
  awaitingAdamo: boolean
};

export type ComplianceScreeningDetail = {
  subjectId: string
  byDocumentNumber: InfolaftMatch[]
  byName: InfolaftMatch[]
};

export type ComplianceBreakdownMonth = {
  month: string
  total: number
  count: number
  payments: Array<{
    id?: string
    amount?: number
    createdAt?: string
    referenceNumber?: string
  }>
};

export type ComplianceBreakdown = {
  screeningId: string
  currentMonth?: string
  months: ComplianceBreakdownMonth[]
};

export function riskBandFromLevel(level: number): RiskBand {
  if (level >= 1 && level <= 4) {
    return "high";
  }
  if (level >= 5 && level <= 6) {
    return "medium";
  }
  return "low";
}
