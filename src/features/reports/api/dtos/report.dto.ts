export type ReportListItemDTO = {
  id: string
  organizationId: string
  name: string
  type: "transactions" | "batches" | "fundings" | "beneficiaries" | "accounts" | "compliance" | "audit"
  status: "queued" | "processing" | "completed" | "failed"
  format: string
  canDownload: boolean
  fileSizeBytes?: number
  completedAt?: string
  expiresAt?: string
  userId: string
  createdAt: string
};
