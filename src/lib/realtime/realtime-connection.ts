import { apiUrls } from "@/lib/env";

export type RealtimeEventMessage = {
  type?: string
  eventType?: string
  resourceId?: string
  traceId?: string
  data?: Record<string, unknown>
};

function buildWsUrl(baseUrl: string): string {
  const url = new URL(baseUrl);
  url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
  const basePath = url.pathname.replace(/\/$/, "");
  url.pathname = `${basePath}/realtime/ws`;
  return url.toString();
}

/**
 * Low-level websocket connector shared by every realtime feature (batch
 * upload progress, batch status). Handles the subscribe handshake,
 * heartbeat and reconnect-with-backoff; callers just interpret the
 * "event" messages that match their subscription.
 */
export function connectRealtimeChannel(options: {
  channel: string
  resourceId?: string
  onEvent: (message: RealtimeEventMessage) => void
}): () => void {
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
          channel: options.channel,
          ...(options.resourceId ? { resourceId: options.resourceId } : {}),
        }),
      );

      heartbeatTimer = setInterval(() => {
        if (ws?.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: "ping" }));
        }
      }, 25_000);
    };

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data as string) as RealtimeEventMessage;

      if (message.type !== "event") {
        return;
      }

      options.onEvent(message);
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
