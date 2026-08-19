import { connectRealtimeChannel } from "./realtime-connection";

export type BatchScreeningSummary = {
  pending: number
  allow: number
  clientReview: number
  review: number
  blocked: number
  failed: number
};

export type BatchLiveEvent = {
  batchId: string
  eventType: string
  status: string
  lastAction?: string
  screening?: BatchScreeningSummary
  processing?: {
    processedCount: number
    paidCount: number
    rejectedCount: number
    returnedCount: number
  }
  rowNumber?: number
  itemStatus?: string
  beneficiaryName?: string
  screeningVerdict?: string
  currentIndex?: number
  totalItems?: number
};

export type BatchStatusEvent = BatchLiveEvent;

const BATCH_LIVE_EVENTS = new Set([
  "batch.status.updated",
  "batch.item.screening",
  "batch.item.screened",
  "batch.screening.progress",
  "batch.screening.completed",
  "batch.cancelled",
]);

/**
 * Subscribes to batch lifecycle and compliance screening updates pushed by
 * core/realtime. Pass a `batchId` to follow just that batch (the detail and
 * create pages); omit it to receive every batch update for the org.
 */
export function subscribeToBatchStatusEvents(
  onUpdate: (event: BatchLiveEvent) => void,
  batchId?: string,
): () => void {
  return connectRealtimeChannel({
    channel: "batches",
    resourceId: batchId,
    onEvent: (message) => {
      if (!message.eventType || !BATCH_LIVE_EVENTS.has(message.eventType)) {
        return;
      }

      const data = message.data ?? {};
      const eventBatchId = typeof data.batchId === "string" ? data.batchId : message.resourceId;
      if (!eventBatchId) {
        return;
      }

      const screeningPayload = (data.screening ?? data.summary) as
        | { screening?: BatchScreeningSummary }
        | BatchScreeningSummary
        | undefined;
      const screeningSummary
        = screeningPayload && "pending" in screeningPayload
          ? screeningPayload
          : screeningPayload && "screening" in screeningPayload
            ? screeningPayload.screening
            : undefined;

      onUpdate({
        batchId: eventBatchId,
        eventType: message.eventType,
        status: typeof data.status === "string" ? data.status : "",
        lastAction: typeof data.lastAction === "string" ? data.lastAction : undefined,
        screening: (data.summary as { screening?: BatchScreeningSummary } | undefined)?.screening
          ?? screeningSummary,
        processing: data.processing as BatchLiveEvent["processing"],
        rowNumber: typeof data.rowNumber === "number" ? data.rowNumber : undefined,
        itemStatus: typeof data.status === "string" ? data.status : undefined,
        beneficiaryName:
          typeof data.beneficiaryName === "string" ? data.beneficiaryName : undefined,
        screeningVerdict:
          typeof (data.screening as { verdict?: string } | undefined)?.verdict === "string"
            ? (data.screening as { verdict: string }).verdict
            : undefined,
        currentIndex: typeof data.currentIndex === "number" ? data.currentIndex : undefined,
        totalItems: typeof data.totalItems === "number" ? data.totalItems : undefined,
      });
    },
  });
}
