import { connectRealtimeChannel } from "./realtime-connection";

export type PaymentStatusEvent = {
  paymentId: string
  status: string
  previousStatus?: string
  batchId?: string
  beneficiaryId?: string
  amount?: string | number
  currency?: string
};

/**
 * Subscribes to payment lifecycle updates (`payment.status.updated`) pushed
 * by adamo-pay-core-microservice-v2 on every status change. Pass a
 * `paymentId` to follow just that payment (a transaction detail page);
 * omit it to receive every payment update for the org (the transactions
 * list page, or any other feature that just needs to know "something
 * changed").
 */
export function subscribeToPaymentStatusEvents(
  onUpdate: (event: PaymentStatusEvent) => void,
  paymentId?: string,
): () => void {
  return connectRealtimeChannel({
    channel: "payments",
    resourceId: paymentId,
    onEvent: (message) => {
      if (message.eventType !== "payment.status.updated") {
        return;
      }

      const data = message.data ?? {};
      const eventPaymentId = typeof data.paymentId === "string" ? data.paymentId : message.resourceId;
      if (!eventPaymentId) {
        return;
      }

      onUpdate({
        paymentId: eventPaymentId,
        status: typeof data.status === "string" ? data.status : "",
        previousStatus: typeof data.previousStatus === "string" ? data.previousStatus : undefined,
        batchId: typeof data.batchId === "string" ? data.batchId : undefined,
        beneficiaryId: typeof data.beneficiaryId === "string" ? data.beneficiaryId : undefined,
        amount: data.amount as string | number | undefined,
        currency: typeof data.currency === "string" ? data.currency : undefined,
      });
    },
  });
}
