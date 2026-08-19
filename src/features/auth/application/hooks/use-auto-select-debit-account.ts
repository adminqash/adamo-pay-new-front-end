import { useEffect } from "react";
import { usePermissions } from "@/features/auth/application/hooks/use-permissions";

type DebitAccount = Readonly<{
  id: string
}>;

/**
 * When the user cannot choose a debit account, pick the first allowed one.
 * Backend already scoped the list to assigned accounts.
 */
export function useAutoSelectDebitAccount(
  accounts: DebitAccount[],
  selectedId: string | undefined,
  onSelect: (accountId: string) => void,
) {
  const { capabilities } = usePermissions();

  useEffect(() => {
    if (selectedId || accounts.length === 0) {
      return;
    }
    if (!capabilities.canChooseDebitAccount) {
      onSelect(accounts[0].id);
    }
  }, [accounts, capabilities.canChooseDebitAccount, onSelect, selectedId]);

  return capabilities;
}
