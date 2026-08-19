import { getEnvAccessToken } from "@/lib/auth/env-access-token";
import { apiUrls } from "@/lib/env";

export type RealtimeEventMessage = {
  type?: string
  channel?: string
  eventType?: string
  resourceId?: string
  traceId?: string
  data?: Record<string, unknown>
};

type Subscriber = (message: RealtimeEventMessage) => void;

type SubscriptionEntry = {
  channel: string
  resourceId?: string
  subscribers: Set<Subscriber>
};

function buildWsUrl(baseUrl: string): string {
  const url = new URL(baseUrl);
  url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
  const basePath = url.pathname.replace(/\/$/, "");
  url.pathname = `${basePath}/realtime/ws`;
  const accessToken = getEnvAccessToken();
  if (accessToken) {
    url.searchParams.set("access_token", accessToken);
  }
  return url.toString();
}

function subscriptionKey(channel: string, resourceId?: string): string {
  return `${channel}:${resourceId ?? ""}`;
}

/**
 * Single shared websocket connection for the whole app session, multiplexing
 * every "batches"/"payments"/"accounts"/... subscription onto one socket
 * instead of every feature hook opening its own connection. Handles the
 * subscribe handshake per entry, heartbeat, reconnect-with-backoff, and
 * re-subscribing everything currently registered after a reconnect.
 */
class RealtimeConnection {
  private ws: WebSocket | null = null;
  private heartbeatTimer: ReturnType<typeof setInterval> | null = null;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private reconnectAttempts = 0;
  private readonly entries = new Map<string, SubscriptionEntry>();

  subscribe(
    channel: string,
    resourceId: string | undefined,
    onEvent: Subscriber,
  ): () => void {
    const key = subscriptionKey(channel, resourceId);
    let entry = this.entries.get(key);

    if (!entry) {
      entry = { channel, resourceId, subscribers: new Set() };
      this.entries.set(key, entry);
      this.ensureConnected();
      this.sendSubscribe(entry);
    }

    entry.subscribers.add(onEvent);

    return () => {
      const current = this.entries.get(key);
      if (!current) {
        return;
      }

      current.subscribers.delete(onEvent);
      if (current.subscribers.size === 0) {
        this.entries.delete(key);
        this.sendUnsubscribe(current);
        this.disconnectIfIdle();
      }
    };
  }

  private ensureConnected(): void {
    if (
      this.ws
      && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)
    ) {
      return;
    }

    this.connect();
  }

  private connect(): void {
    const wsUrl = buildWsUrl(apiUrls.realtime);
    // Session cookies (shared .adamoservices.co domain) ride along on the WS
    // handshake automatically, same as withCredentials on the axios clients.
    const ws = new WebSocket(wsUrl);
    this.ws = ws;

    ws.onopen = () => {
      this.reconnectAttempts = 0;
      for (const entry of this.entries.values()) {
        this.sendSubscribe(entry);
      }

      this.heartbeatTimer = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: "ping" }));
        }
      }, 25_000);
    };

    // Without this handler, a failed handshake (wrong URL, TLS/proxy issue,
    // auth rejection) only ever surfaces as a silent `onclose` — nothing
    // logs *why* it failed, which makes "nothing seems to connect" reports
    // impossible to diagnose from the console alone.
    ws.onerror = () => {
      console.error(`[realtime] WebSocket connection error (url: ${wsUrl})`);
    };

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data as string) as RealtimeEventMessage;
      if (message.type !== "event") {
        return;
      }

      const exact = this.entries.get(subscriptionKey(message.channel ?? "", message.resourceId));
      exact?.subscribers.forEach((fn) => fn(message));

      if (message.resourceId) {
        // Also deliver to an org-wide (no resourceId) subscriber of the
        // same channel, if one exists — mirrors the backend gateway's own
        // fan-out (it broadcasts to both the specific and the channel-wide
        // subscription key for a resource-scoped event).
        const orgWide = this.entries.get(subscriptionKey(message.channel ?? "", undefined));
        orgWide?.subscribers.forEach((fn) => fn(message));
      }
    };

    ws.onclose = (event) => {
      if (this.heartbeatTimer) {
        clearInterval(this.heartbeatTimer);
        this.heartbeatTimer = null;
      }
      this.ws = null;

      if (this.entries.size > 0 && this.reconnectAttempts < 10) {
        // event.reason carries the gateway's AUTH_ERROR_CODES value
        // (e.g. TOKEN_EXPIRED, HEARTBEAT_TIMEOUT) when the server closed it —
        // log it so a silently-failing connection is diagnosable from the
        // console instead of just "nothing happens".
        console.warn(
          `[realtime] WebSocket closed (code: ${event.code}, reason: ${event.reason || "none"}) — `
          + `reconnecting (attempt ${this.reconnectAttempts + 1}/10)`,
        );
        this.reconnectAttempts += 1;
        this.reconnectTimer = setTimeout(
          () => this.connect(),
          Math.min(1000 * this.reconnectAttempts, 5000),
        );
      }
    };
  }

  private sendSubscribe(entry: SubscriptionEntry): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(
        JSON.stringify({
          type: "subscribe",
          channel: entry.channel,
          ...(entry.resourceId ? { resourceId: entry.resourceId } : {}),
        }),
      );
    }
  }

  private sendUnsubscribe(entry: SubscriptionEntry): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(
        JSON.stringify({
          type: "unsubscribe",
          channel: entry.channel,
          ...(entry.resourceId ? { resourceId: entry.resourceId } : {}),
        }),
      );
    }
  }

  private disconnectIfIdle(): void {
    if (this.entries.size > 0) {
      return;
    }

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    this.ws?.close(1000, "IDLE");
    this.ws = null;
  }
}

const sharedConnection = new RealtimeConnection();

/**
 * Subscribes to one realtime channel (optionally scoped to a resourceId) on
 * the shared connection. Every feature hook (batch upload progress, batch
 * status, payment status, account balance, ...) goes through this — they
 * share a single websocket instead of each opening their own.
 */
export function connectRealtimeChannel(options: {
  channel: string
  resourceId?: string
  onEvent: Subscriber
}): () => void {
  return sharedConnection.subscribe(options.channel, options.resourceId, options.onEvent);
}
