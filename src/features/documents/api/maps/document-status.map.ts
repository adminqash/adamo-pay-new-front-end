import type { DocumentStatus } from "@/features/documents/application/entities/document.entity";

export const DOCUMENT_STATUS_MAP: Record<string, DocumentStatus> = {
  draft: "draft",
  pending: "pending",
  processing: "processing",
  completed: "completed",
  rejected: "rejected",
};
