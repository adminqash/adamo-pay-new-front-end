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
  const [amount, setAmount] = useState("");
  const [sourceAccount, setSourceAccount] = useState("");

  // TODO: Replace with actual accounts from API
  const accounts = [
    { id: "account1", name: "Cuenta 1", balance: "$90.784.510,46", currency: "COP" },
    { id: "account2", name: "Cuenta 2", balance: "$50.000.000,00", currency: "COP" },
    { id: "account3", name: "Cuenta 3", balance: "$25.500.000,00", currency: "COP" },
  ];

  const handleSubmit = () => {
    // TODO: Implement recharge logic
    console.log("Recharging:", { amount, sourceAccount, cardNumber });
    onOpenChange(false);
  };

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      setAmount("");
      setSourceAccount("");
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
              <AmountInputFlag locale="es-CO" currencySymbol="" />
              <AmountInput
                id="recharge-amount"
                value={amount}
                onValueChange={(value) => setAmount(value !== undefined ? String(value) : "")}
                locale="es-CO"
                placeholder="0.00"
                minimumFractionDigits={2}
                maximumFractionDigits={2}
              />
              <AmountInputAction
                onClick={() => {
                  const fromAccount = accounts.find(a => a.id === sourceAccount);
                  if (fromAccount) {
                    // Extract numeric value from balance (e.g., "$90.784.510,46" -> "90784510.46")
                    const numericBalance = fromAccount.balance.replace(/[^0-9,]/g, '').replace('.', '').replace(',', '.');
                    setAmount(numericBalance);
                  }
                }}
              >
                {t("beneficiaries.credit_card_movements.recharge_dialog.use_all")}
              </AmountInputAction>
            </AmountInputContainer>
            {sourceAccount && (
              <p className="text-xs text-foreground">
                {t("beneficiaries.credit_card_movements.recharge_dialog.available_balance")}: {accounts.find(a => a.id === sourceAccount)?.balance}
              </p>
            )}
          </div>

          {/* source account */}
          <Combobox
            alwaysShowPlaceholder
            valuePosition="right"
            selectedFeedback="check"
            icon="account_balance"
            value={sourceAccount}
            onValueChange={(value) => setSourceAccount(value as string)}
            labels={{
              placeholder: t("beneficiaries.credit_card_movements.recharge_dialog.source_account_label"),
            }}
            options={accounts.map(account => ({
              value: account.id,
              label: account.name,
              supportiveText: `${account.balance} ${account.currency}`,
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
