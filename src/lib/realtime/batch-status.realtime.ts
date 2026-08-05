import { connectRealtimeChannel } from "./realtime-connection";

export type BatchStatusEvent = {
  batchId: string
  status: string
  processing?: {
    processedCount: number
    paidCount: number
    rejectedCount: number
    returnedCount: number
  }
};

/**
 * Subscribes to batch lifecycle updates (`batch.status.updated`) pushed by
 * adamo-pay-core-microservice-v2 whenever a batch or one of its linked
 * payments changes status. Pass a `batchId` to follow just that batch (the
 * detail page); omit it to receive every batch update for the org (the
 * /batches list page) — the realtime gateway supports both subscription
 * modes on the "batches" channel.
 */
export function subscribeToBatchStatusEvents(
  onUpdate: (event: BatchStatusEvent) => void,
  batchId?: string,
): () => void {
  return connectRealtimeChannel({
    channel: "batches",
    resourceId: batchId,
    onEvent: (message) => {
      if (message.eventType !== "batch.status.updated") {
        return;
      }

      const data = message.data ?? {};
      const eventBatchId = typeof data.batchId === "string" ? data.batchId : message.resourceId;
      if (!eventBatchId) {
        return;
      }

      onUpdate({
        batchId: eventBatchId,
        status: typeof data.status === "string" ? data.status : "",
        processing: data.processing as BatchStatusEvent["processing"],
      });
    },
  });
}
