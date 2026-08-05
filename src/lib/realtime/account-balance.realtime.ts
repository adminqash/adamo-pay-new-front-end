import { connectRealtimeChannel } from "./realtime-connection";

export type AccountBalanceEvent = {
  accountId: string
  balance: number
  reservedBalance: number
};

/**
 * Subscribes to account balance updates (`account.balance.updated`) pushed
 * by adamo-pay-core-microservice-v2 whenever a reservation, commit,
 * release, transfer or funding changes an account's balance/reservedBalance.
 * Pass an `accountId` to follow just that account (account movements page);
 * omit it for every balance change in the org (accounts list, home
 * dashboard).
 */
export function subscribeToAccountBalanceEvents(
  onUpdate: (event: AccountBalanceEvent) => void,
  accountId?: string,
): () => void {
  return connectRealtimeChannel({
    channel: "accounts",
    resourceId: accountId,
    onEvent: (message) => {
      if (message.eventType !== "account.balance.updated") {
        return;
      }

      const data = message.data ?? {};
      const eventAccountId = typeof data.accountId === "string" ? data.accountId : message.resourceId;
      if (!eventAccountId) {
        return;
      }

      onUpdate({
        accountId: eventAccountId,
        balance: Number(data.balance ?? 0),
        reservedBalance: Number(data.reservedBalance ?? 0),
      });
    },
  });
}
