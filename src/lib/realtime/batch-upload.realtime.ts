import { apiUrls } from "@/lib/env";

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

function buildWsUrl(baseUrl: string): string {
  const url = new URL(baseUrl);
  url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
  const basePath = url.pathname.replace(/\/$/, "");
  url.pathname = `${basePath}/realtime/ws`;
  return url.toString();
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

export function subscribeToBatchUploadEvents(
  batchId: string,
  onUpdate: BatchUploadEventHandler,
): () => void {
  let ws: WebSocket | null = null;
  let heartbeatTimer: ReturnType<typeof setInterval> | null = null;
  let disposed = false;
  let reconnectAttempts = 0;

  const clearHeartbeat = () => {
    if (heartbeatTimer) {
      clearInterval(heartbeatTimer);
      heartbeatTimer = null;
    }
  };

  const connect = () => {
    if (disposed) {
      return;
    }

    const wsUrl = buildWsUrl(apiUrls.realtime);
    // Session cookies (shared .adamoservices.co domain) ride along on the WS
    // handshake automatically, same as withCredentials on the axios clients.
    ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      reconnectAttempts = 0;
      ws?.send(
        JSON.stringify({
          type: "subscribe",
          channel: "batches",
          resourceId: batchId,
        }),
      );

      heartbeatTimer = setInterval(() => {
        if (ws?.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: "ping" }));
        }
      }, 25_000);
    };

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data as string) as {
        type?: string
        eventType?: string
        resourceId?: string
        traceId?: string
        data?: Record<string, unknown>
      };

      if (message.type !== "event" || message.resourceId !== batchId) {
        return;
      }

      const eventType = message.eventType ?? "";
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
    };

    ws.onclose = () => {
      clearHeartbeat();
      if (!disposed && reconnectAttempts < 5) {
        reconnectAttempts += 1;
        setTimeout(connect, Math.min(1000 * reconnectAttempts, 5000));
      }
    };
  };

  connect();

  return () => {
    disposed = true;
    clearHeartbeat();
    ws?.close(1000, "UNSUBSCRIBE");
  };
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
