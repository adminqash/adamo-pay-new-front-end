export type ComplianceFindingDTO = {
  codigoLista: string
  findingId: string
  key: string
  nombreLista: string
  riskLevel: number
  resolved?: boolean
  resolutionNote?: string
  resolvedByUserId?: string
  resolvedByName?: string
  resolvedAt?: string
};

export type ComplianceScreeningDTO = {
  screeningId?: string
  verdict?: string
  caseId?: string
  reasons?: Array<{ code: string, rule?: string, detail?: string }>
  alerts?: Array<{ code: string, rule?: string, detail?: string }>
  findings?: ComplianceFindingDTO[]
  maxRiskLevel?: number
  truncated?: boolean
  findingsResolved?: boolean
  deferredScreening?: boolean
  sendable?: boolean
  resolution?: "none" | "client" | "adamo" | "final"
};

export type ComplianceCommentAttachmentDTO = {
  name: string
  size?: number
  contentType?: string
};

export type ComplianceCommentDTO = {
  id: string
  type: "comment" | "finding-resolution" | "case-resolution"
  text: string
  authorUserId: string
  authorName: string
  authorRole: "client" | "compliance"
  attachments?: ComplianceCommentAttachmentDTO[]
  createdAt: string
};

export type ComplianceCaseDTO = {
  id: string
  subjectType: "batch_item" | "payment"
  subjectId: string
  batchId?: string
  batchName?: string
  paymentId?: string
  reference?: string
  status: string
  itemStatus?: string
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
  screening?: ComplianceScreeningDTO
  comments?: ComplianceCommentDTO[]
  canResolveFindings?: boolean
  canApprove?: boolean
  canReject?: boolean
  canComment?: boolean
  findingsResolved?: boolean
  awaitingAdamo?: boolean
};

export type InfolaftMatchDTO = {
  id: string
  codigoLista: string
  nombreLista: string
  infoListId?: string
  comentarios?: string
  link?: string
  nombres?: string
  primerNombre?: string
  segundoNombre?: string
  primerApellidoORazonSocial?: string
  segundoApellido?: string
  tipo?: string
  idIdentfy?: string
  direccionPais?: string
  score?: number
  riskLevel?: number
  fechaIngreso?: string
  fechaModificacion?: string
  jurisdiccionDeRiesgoGafi?: string
  requiereDebidaDiligenciaPEPGafi?: string
  notaDebidaDiligenciaPEPGafi?: string
  code?: string
};

export type InfolaftSearchPageDTO = {
  content: InfolaftMatchDTO[]
  totalElements: number
  empty: boolean
};

export type ComplianceScreeningDetailDTO = {
  subjectId: string
  subjectType: "batch_item" | "payment"
  screening?: ComplianceScreeningDTO
  byDocumentNumber: InfolaftSearchPageDTO
  byName: InfolaftSearchPageDTO
};
