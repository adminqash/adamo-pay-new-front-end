import { Icon } from "@adamosuiteservices/ui/icon";
import {
  SelectableCard,
  SelectableCardDescription,
  SelectableCardGroup,
  SelectableCardTitle,
} from "@adamosuiteservices/ui/selectable-card";
import { usePermissions } from "@/features/auth/application/hooks/use-permissions";

export type DebitAccountOption = {
  id: string
  name: string
  balance: string
  availableMinor?: number
};

type DebitAccountPickerProps = Readonly<{
  accounts: DebitAccountOption[]
  value?: string
  onValueChange: (accountId: string) => void
  isLoading?: boolean
  insufficientBalanceOf?: number
  insufficientLabel?: string
}>;

export function DebitAccountPicker({
  accounts,
  value,
  onValueChange,
  isLoading = false,
  insufficientBalanceOf,
  insufficientLabel,
}: DebitAccountPickerProps) {
  const { capabilities } = usePermissions();
  const canChoose = capabilities.canChooseDebitAccount;
  const visibleAccounts = canChoose ? accounts : accounts.filter((account) => account.id === value);

  return (
    <SelectableCardGroup
      value={value}
      onValueChange={canChoose ? onValueChange : () => undefined}
      className="w-full"
    >
      <div className="flex w-full flex-wrap gap-4">
        {!isLoading && visibleAccounts.map((account) => {
          const insufficientBalance = insufficientBalanceOf !== undefined
            && (account.availableMinor ?? 0) < insufficientBalanceOf;

          return (
            <SelectableCard
              key={account.id}
              value={account.id}
              disabled={!canChoose || insufficientBalance}
              className="min-w-[250px] flex-1"
            >
              <div className="flex h-16 items-center">
                <div className="flex flex-1 flex-col gap-2">
                  <SelectableCardTitle>{account.name}</SelectableCardTitle>
                  <div className="flex h-10 items-center gap-2 pl-2">
                    <Icon symbol="paid" className="text-2xl" />
                    <SelectableCardDescription>
                      {capabilities.canViewBalance ? account.balance : "••••"}
                      {insufficientBalance && insufficientLabel && (
                        <span className="ml-2 text-xs text-[#bf3636]">
                          {insufficientLabel}
                        </span>
                      )}
                    </SelectableCardDescription>
                  </div>
                </div>
              </div>
            </SelectableCard>
          );
        })}
      </div>
    </SelectableCardGroup>
  );
}
