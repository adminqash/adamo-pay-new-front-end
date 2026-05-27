import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@adamosuiteservices/ui/dialog";
import { Button } from "@adamosuiteservices/ui/button";
import { useTranslation } from "react-i18next";

interface DeleteBankAccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bankName: string;
  accountNumber: string;
  onConfirm: () => void;
}

export function DeleteBankAccountDialog({
  open,
  onOpenChange,
  bankName,
  accountNumber,
  onConfirm,
}: DeleteBankAccountDialogProps) {
  const { t } = useTranslation("beneficiaries");

  // Extract last 5 digits from account number (assuming format XX-XXXXX-XXXXX)
  const lastDigits = accountNumber.slice(-5);

  const handleConfirm = () => {
    onConfirm();
    onOpenChange(false);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{t("beneficiaries.bank_accounts.delete_dialog.title")}</DialogTitle>
          <DialogDescription>
            {t("beneficiaries.bank_accounts.delete_dialog.description", {
              bank: bankName,
              lastDigits: lastDigits,
            })}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="secondary" onClick={handleCancel}>
            {t("beneficiaries.bank_accounts.delete_dialog.cancel")}
          </Button>
          <Button variant="destructive-medium" onClick={handleConfirm}>
            {t("beneficiaries.bank_accounts.delete_dialog.confirm")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
