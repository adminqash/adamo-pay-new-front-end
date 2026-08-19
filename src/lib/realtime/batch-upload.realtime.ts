import { connectRealtimeChannel } from "./realtime-connection";

export type BatchUploadProgressState = {
  status:
    | "idle"
    | "accepted"
    | "uploading"
    | "parsing"
    | "ingesting"
    | "completed"
    | "failed"
  progress: number
  uploadId?: string
  requestId?: string
  fileName?: string
  summary?: {
    totalItems: number
    validItems: number
    invalidItems: number
    totalAmount: number
    currency: string
  }
  errorMessage?: string
  storage?: string
  s3Key?: string
};

type BatchUploadEventHandler = (state: BatchUploadProgressState) => void;

function resolvePhase(
  eventType: string,
  data: Record<string, unknown>,
): BatchUploadProgressState["status"] {
  if (eventType === "batch.upload.completed") {
    return "completed";
  }

  if (eventType === "batch.upload.failed") {
    return "failed";
  }

  if (eventType === "batch.upload.accepted") {
    return "accepted";
  }

  const phase = String(data.phase ?? "");
  if (
    phase === "uploading"
    || phase === "parsing"
    || phase === "ingesting"
    || phase === "completed"
  ) {
    return phase;
  }

  return "uploading";
}

export function subscribeToBatchUploadEvents(
  batchId: string,
  onUpdate: BatchUploadEventHandler,
): () => void {
  return connectRealtimeChannel({
    channel: "batches",
    resourceId: batchId,
    onEvent: (message) => {
      if (message.resourceId !== batchId) {
        return;
      }

      const eventType = message.eventType ?? "";
      if (
        eventType !== "batch.upload.accepted"
        && eventType !== "batch.upload.completed"
        && eventType !== "batch.upload.failed"
        && eventType !== "batch.upload.cancelled"
        && eventType !== "batch.progress.updated"
      ) {
        return;
      }

      const data = message.data ?? {};
      const progress = Number(data.progress ?? 0);
      const summary = data.summary as BatchUploadProgressState["summary"] | undefined;

      onUpdate({
        status: resolvePhase(eventType, data),
        progress: Number.isFinite(progress) ? progress : 0,
        uploadId: typeof data.uploadId === "string" ? data.uploadId : undefined,
        requestId: message.traceId,
        fileName: typeof data.fileName === "string" ? data.fileName : undefined,
        ...(summary ? { summary } : {}),
        storage: typeof data.storage === "string" ? data.storage : undefined,
        s3Key: typeof data.s3Key === "string" ? data.s3Key : undefined,
        errorMessage:
          eventType === "batch.upload.failed"
            ? String(data.message ?? "Batch upload failed")
            : undefined,
      });
    },
  });
}

export function mapUploadStatusToProgress(
  status: BatchUploadProgressState["status"],
): string {
  switch (status) {
    case "accepted":
      return "accepted";
    case "uploading":
      return "uploading";
    case "parsing":
      return "parsing";
    case "ingesting":
      return "ingesting";
    case "completed":
      return "completed";
    case "failed":
      return "failed";
    default:
      return "idle";
  }
}
