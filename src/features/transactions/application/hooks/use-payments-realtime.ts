import { useEffect } from "react";
import { useQueryClient, type QueryKey } from "@tanstack/react-query";
import { subscribeToPaymentStatusEvents } from "@/lib/realtime/payment-status.realtime";

/**
 * Keeps payment data live without a manual reload. Call with no
 * `paymentId` on the transactions list page (org-wide feed); pass a
 * `paymentId` on a transaction detail page to also follow that one
 * specifically while the page is mounted. Every `payment.status.updated`
 * push invalidates the "payments" query prefix, plus any extra prefixes a
 * caller depends on (e.g. beneficiaries totals, the home dashboard summary)
 * since a payment status change affects those too.
 */
export function usePaymentsRealtime(options?: {
  paymentId?: string
  extraInvalidateKeys?: QueryKey[]
}): void {
  const queryClient = useQueryClient();
  const paymentId = options?.paymentId;
  const extraInvalidateKeys = options?.extraInvalidateKeys;

  useEffect(() => {
    const unsubscribe = subscribeToPaymentStatusEvents(() => {
      void queryClient.invalidateQueries({ queryKey: ["payments"] });
      extraInvalidateKeys?.forEach((queryKey) => {
        void queryClient.invalidateQueries({ queryKey });
      });
    }, paymentId);

    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentId, queryClient]);
}
