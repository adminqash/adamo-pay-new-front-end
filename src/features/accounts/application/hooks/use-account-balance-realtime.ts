import { useEffect } from "react";
import { useQueryClient, type QueryKey } from "@tanstack/react-query";
import { subscribeToAccountBalanceEvents } from "@/lib/realtime/account-balance.realtime";

/**
 * Keeps account balance data live without a manual reload. Call with no
 * `accountId` on the accounts list page or the home dashboard (org-wide
 * feed); pass an `accountId` on the account movements page to also follow
 * that one specifically. Every `account.balance.updated` push invalidates
 * the "accounts" query prefix, plus any extra prefixes a caller depends on
 * (e.g. the home dashboard's wallet balance).
 */
export function useAccountBalanceRealtime(options?: {
  accountId?: string
  extraInvalidateKeys?: QueryKey[]
}): void {
  const queryClient = useQueryClient();
  const accountId = options?.accountId;
  const extraInvalidateKeys = options?.extraInvalidateKeys;

  useEffect(() => {
    const unsubscribe = subscribeToAccountBalanceEvents(() => {
      void queryClient.invalidateQueries({ queryKey: ["accounts"] });
      extraInvalidateKeys?.forEach((queryKey) => {
        void queryClient.invalidateQueries({ queryKey });
      });
    }, accountId);

    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accountId, queryClient]);
}
