export type ReportListItemDTO = {
  id: string
  organizationId: string
  name: string
  type: "transactions" | "batches" | "beneficiaries" | "accounts" | "compliance" | "audit"
  status: string
  format: string
  downloadUrl?: string
  fileSizeBytes?: number
  completedAt?: string
  expiresAt?: string
  userId: string
  createdAt: string
};
