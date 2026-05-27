export type DocumentStatus = "draft" | "pending" | "processing" | "completed" | "rejected" | "unknown";

export type Document = {
  name: string
  status: DocumentStatus
};
