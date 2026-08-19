import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogBody,
  DialogFooter,
  DialogClose,
} from "@adamosuiteservices/ui/dialog";
import { Button } from "@adamosuiteservices/ui/button";
import { Label } from "@adamosuiteservices/ui/label";
import {
  AmountInput,
  AmountInputContainer,
  AmountInputFlag,
  AmountInputAction,
} from "@adamosuiteservices/ui/amount-input";
import { Combobox } from "@adamosuiteservices/ui/combobox";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useAccounts } from "@/features/accounts/application/hooks/use-accounts";
import { useAutoSelectDebitAccount } from "@/features/auth/application/hooks/use-auto-select-debit-account";
import { usePermissions } from "@/features/auth/application/hooks/use-permissions";
import { useCountry } from "@/features/common/contexts/use-country";
import { minorToMajor } from "@/lib/money/money";

interface RechargeBalanceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cardNumber: string;
}

/**
 * recharge balance dialog
 * 
 * dialog for recharging credit card balance from a source account
 */
export function RechargeBalanceDialog({
  open,
  onOpenChange,
  cardNumber,
}: RechargeBalanceDialogProps) {
  const { t } = useTranslation("beneficiaries");
  const { locale: moneyLocale } = useCountry();
  const { accounts } = useAccounts({ limit: 20 });
  const { capabilities } = usePermissions();
  const [amount, setAmount] = useState("");
  const [sourceAccount, setSourceAccount] = useState<string>();
  useAutoSelectDebitAccount(accounts, sourceAccount, setSourceAccount);

  const visibleAccounts = capabilities.canChooseDebitAccount
    ? accounts
    : accounts.filter((account) => account.id === sourceAccount);

  const handleSubmit = () => {
    onOpenChange(false);
  };

  useEffect(() => {
    if (!open) {
      setAmount("");
      setSourceAccount(undefined);
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[640px]">
        <DialogHeader>
          <DialogTitle>
            {t("beneficiaries.credit_card_movements.recharge_dialog.title")}
          </DialogTitle>
          <DialogDescription>
            {t("beneficiaries.credit_card_movements.recharge_dialog.description", {
              cardNumber: cardNumber.slice(-4),
            })}
          </DialogDescription>
        </DialogHeader>
        <DialogBody className="flex flex-col gap-6">
          {/* amount */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="recharge-amount" className="text-xs text-foreground">
              {t("beneficiaries.credit_card_movements.recharge_dialog.amount_label")}
            </Label>
            <AmountInputContainer className="gap-2">
              <AmountInputFlag locale={moneyLocale} currencySymbol="" />
              <AmountInput
                id="recharge-amount"
                value={amount}
                onValueChange={(value) => setAmount(value !== undefined ? String(value) : "")}
                locale={moneyLocale}
                placeholder="0.00"
                minimumFractionDigits={2}
                maximumFractionDigits={2}
              />
              {capabilities.canViewBalance && (
                <AmountInputAction
                  onClick={() => {
                    const fromAccount = accounts.find((account) => account.id === sourceAccount);
                    if (fromAccount) {
                      setAmount(minorToMajor(fromAccount.availableMinor));
                    }
                  }}
                >
                  {t("beneficiaries.credit_card_movements.recharge_dialog.use_all")}
                </AmountInputAction>
              )}
            </AmountInputContainer>
            {sourceAccount && capabilities.canViewBalance && (
              <p className="text-xs text-foreground">
                {t("beneficiaries.credit_card_movements.recharge_dialog.available_balance")}: {accounts.find((account) => account.id === sourceAccount)?.balance}
              </p>
            )}
          </div>

          {/* source account */}
          <Combobox
            alwaysShowPlaceholder
            valuePosition="right"
            selectedFeedback="check"
            icon="account_balance"
            value={sourceAccount ?? ""}
            onValueChange={(value) => setSourceAccount(value as string)}
            labels={{
              placeholder: t("beneficiaries.credit_card_movements.recharge_dialog.source_account_label"),
            }}
            options={visibleAccounts.map((account) => ({
              value: account.id,
              label: account.name,
              supportiveText: capabilities.canViewBalance ? account.balance : undefined,
            }))}
            classNames={{
              trigger: "h-10 w-full",
            }}
          />
        </DialogBody>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="secondary">
              {t("beneficiaries.credit_card_movements.recharge_dialog.cancel")}
            </Button>
          </DialogClose>
          <Button
            variant="default"
            onClick={handleSubmit}
            disabled={!sourceAccount || !amount || parseFloat(amount) <= 0}
          >
            {t("beneficiaries.credit_card_movements.recharge_dialog.submit")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
