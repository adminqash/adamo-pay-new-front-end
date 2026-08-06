export type ReportStatus = "queued" | "processing" | "completed" | "failed";

export type Report = {
  id: string
  date: string
  name: string
  type: string
  status: ReportStatus
  canDownload: boolean
};
