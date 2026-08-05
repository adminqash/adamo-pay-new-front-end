import { useCallback, useEffect, useState } from "react";
import { subscribeToPaymentStatusEvents } from "@/lib/realtime/payment-status.realtime";
import { subscribeToBatchStatusEvents } from "@/lib/realtime/batch-status.realtime";

export type RealtimeToastKind = "payment" | "batch";

export type RealtimeToastNotification = {
  id: string
  kind: RealtimeToastKind
  status: string
  href: string
};

const TERMINAL_PAYMENT_STATUSES = new Set(["paid", "rejected", "returned"]);
const MAX_VISIBLE_TOASTS = 3;
const TOAST_LIFETIME_MS = 8_000;

/**
 * App-wide, always-on feed of "something important just happened" toasts —
 * mounted once (see main-layout.tsx) so it fires no matter which page the
 * user is currently looking at. Only reacts to terminal, user-relevant
 * transitions (a payment finishing, a batch completing), not every
 * intermediate status tick, to stay non-intrusive.
 */
export function useRealtimeToastNotifications(): {
  notifications: RealtimeToastNotification[]
  dismiss: (id: string) => void
} {
  const [notifications, setNotifications] = useState<RealtimeToastNotification[]>([]);

  const dismiss = useCallback((id: string) => {
    setNotifications((current) => current.filter((item) => item.id !== id));
  }, []);

  const push = useCallback((notification: RealtimeToastNotification) => {
    setNotifications((current) => [notification, ...current].slice(0, MAX_VISIBLE_TOASTS));
    setTimeout(() => dismiss(notification.id), TOAST_LIFETIME_MS);
  }, [dismiss]);

  useEffect(() => {
    const unsubscribePayments = subscribeToPaymentStatusEvents((event) => {
      if (!TERMINAL_PAYMENT_STATUSES.has(event.status)) {
        return;
      }

      push({
        id: `payment:${event.paymentId}:${event.status}`,
        kind: "payment",
        status: event.status,
        href: event.batchId
          ? `/batches/${event.batchId}/transactions/${event.paymentId}`
          : "/transactions",
      });
    });

    const unsubscribeBatches = subscribeToBatchStatusEvents((event) => {
      if (event.status !== "completed") {
        return;
      }

      push({
        id: `batch:${event.batchId}:${event.status}`,
        kind: "batch",
        status: event.status,
        href: `/batches/${event.batchId}`,
      });
    });

    return () => {
      unsubscribePayments();
      unsubscribeBatches();
    };
  }, [push]);

  return { notifications, dismiss };
}
