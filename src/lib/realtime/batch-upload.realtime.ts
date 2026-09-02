import { connectRealtimeChannel } from "./realtime-connection";

export type BatchUploadValidationError = {
  field: string
  code: string
  message: string
  cell?: string
  column?: string
  excelRow?: number
  value?: string
  header?: string
};

export type BatchUploadSummary = {
  totalItems: number
  validItems: number
  invalidItems: number
  totalAmount: number
  currency: string
  invalidRows?: Array<{
    rowNumber: number
    validationErrors: BatchUploadValidationError[]
  }>
};

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
  batchId?: string
  uploadId?: string
  requestId?: string
  fileName?: string
  summary?: BatchUploadSummary
  errorMessage?: string
  storage?: string
  s3Key?: string
};

const UPLOAD_EVENTS = new Set([
  "batch.upload.accepted",
  "batch.upload.completed",
  "batch.upload.failed",
  "batch.upload.cancelled",
  "batch.progress.updated",
]);

const STATUS_RANK: Record<BatchUploadProgressState["status"], number> = {
  idle: 0,
  accepted: 1,
  uploading: 2,
  parsing: 3,
  ingesting: 4,
  completed: 5,
  failed: 5,
};

type BatchUploadEventHandler = (state: BatchUploadProgressState) => void;

function asIntegerAmount(value: unknown): number {
  const amount = Number(value);
  return Number.isFinite(amount) && amount > 0 ? amount : 0;
}

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

export function mergeBatchUploadSummary(
  previous: BatchUploadSummary | undefined,
  incoming: BatchUploadSummary | undefined,
  fallbackAmount = 0,
): BatchUploadSummary | undefined {
  if (!incoming && !previous) {
    return undefined;
  }
  if (!incoming) {
    return previous;
  }
  if (!previous) {
    return {
      ...incoming,
      totalAmount: incoming.totalAmount > 0 ? incoming.totalAmount : fallbackAmount,
    };
  }

  const incomingRows = incoming.invalidRows ?? [];
  const previousRows = previous.invalidRows ?? [];

  return {
    ...previous,
    ...incoming,
    totalItems: incoming.totalItems || previous.totalItems,
    validItems: incoming.validItems || previous.validItems,
    invalidItems: Math.max(incoming.invalidItems, previous.invalidItems),
    currency: incoming.currency || previous.currency,
    totalAmount:
      incoming.totalAmount > 0
        ? incoming.totalAmount
        : previous.totalAmount > 0
          ? previous.totalAmount
          : fallbackAmount,
    invalidRows: incomingRows.length > 0 ? incomingRows : previousRows,
  };
}

export function mergeUploadProgressState(
  previous: BatchUploadProgressState,
  next: Partial<BatchUploadProgressState>,
): BatchUploadProgressState {
  const nextRank = next.status ? STATUS_RANK[next.status] ?? 0 : 0;
  const previousRank = STATUS_RANK[previous.status] ?? 0;
  const keepPreviousStatus = next.status && nextRank < previousRank && previous.status !== "idle";
  const payloadAmount = asIntegerAmount(next.summary?.totalAmount);

  return {
    ...previous,
    ...next,
    status: keepPreviousStatus ? previous.status : (next.status ?? previous.status),
    progress: Math.max(previous.progress, Number(next.progress) || 0),
    summary: mergeBatchUploadSummary(previous.summary, next.summary, payloadAmount),
    errorMessage: next.errorMessage ?? previous.errorMessage,
  };
}

/**
 * Org-wide `batches` subscription. The gateway fans upload events out to
 * both the batch-specific key and the channel-wide key, so this receives
 * progress as soon as the socket is open — even before `batchId` exists.
 */
export function subscribeToBatchUploadEvents(
  onUpdate: BatchUploadEventHandler,
): () => void {
  return connectRealtimeChannel({
    channel: "batches",
    onEvent: (message) => {
      const eventType = message.eventType ?? "";
      if (!UPLOAD_EVENTS.has(eventType)) {
        return;
      }

      const data = message.data ?? {};
      const summary = data.summary as BatchUploadSummary | undefined;
      const payloadAmount = asIntegerAmount(data.totalAmount);
      const summaryWithAmount = summary
        ? {
            ...summary,
            totalAmount:
              payloadAmount > 0
                ? payloadAmount
                : asIntegerAmount(summary.totalAmount),
          }
        : payloadAmount > 0
          ? {
              totalItems: 0,
              validItems: 0,
              invalidItems: 0,
              totalAmount: payloadAmount,
              currency: "cop",
            }
          : undefined;
      const progress = Number(data.progress ?? 0);
      const batchId
        = typeof data.batchId === "string"
          ? data.batchId
          : message.resourceId;

      onUpdate({
        status: resolvePhase(eventType, data),
        progress: Number.isFinite(progress) ? progress : 0,
        batchId: batchId || undefined,
        uploadId: typeof data.uploadId === "string" ? data.uploadId : undefined,
        requestId: message.traceId,
        fileName: typeof data.fileName === "string" ? data.fileName : undefined,
        ...(summaryWithAmount ? { summary: summaryWithAmount } : {}),
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
