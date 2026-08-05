export type BatchTimelineEventDTO = {
  type: string
  status: string
  at: string
  metadata?: Record<string, unknown>
};

export type BatchTimelineDTO = {
  batchId: string
  batchStatus: string
  statusSummary: Array<{ status: string, count: number }>
  events: BatchTimelineEventDTO[]
};
