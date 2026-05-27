import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@adamosuiteservices/ui/dialog";
import { Button } from "@adamosuiteservices/ui/button";
import { Input } from "@adamosuiteservices/ui/input";
import { Label } from "@adamosuiteservices/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@adamosuiteservices/ui/select";
import { Checkbox } from "@adamosuiteservices/ui/checkbox";
import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";

interface AddBankAccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  beneficiaryData?: {
    documentType: string;
    documentNumber: string;
    firstName: string;
    lastName: string;
  };
  onConfirm?: (data: {
    accountType: string;
    bank: string;
    accountNumber: string;
    isPrimary: boolean;
  }) => void;
}

export function AddBankAccountDialog({
  open,
  onOpenChange,
  beneficiaryData,
  onConfirm,
}: AddBankAccountDialogProps) {
  const { t } = useTranslation("beneficiaries");
  const [accountType, setAccountType] = useState("");
  const [bank, setBank] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [isPrimary, setIsPrimary] = useState(false);

  // Reset form fields when dialog closes
  useEffect(() => {
    if (!open) {
      setAccountType("");
      setBank("");
      setAccountNumber("");
      setIsPrimary(false);
    }
  }, [open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onConfirm) {
      onConfirm({
        accountType,
        bank,
        accountNumber,
        isPrimary,
      });
    }
    onOpenChange(false);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{t("beneficiaries.bank_accounts.dialog.title")}</DialogTitle>
          <DialogDescription>
            {t("beneficiaries.bank_accounts.dialog.description")}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-8">
          <div className="flex flex-wrap gap-4">
            {/* Document Type (readonly) */}
            <div className="flex-1 min-w-[250px] flex flex-col gap-2">
              <Label htmlFor="document-type" className="text-xs text-neutral-400">
                {t("beneficiaries.bank_accounts.dialog.document_type")}
              </Label>
              <Input
                id="document-type"
                value={beneficiaryData?.documentType ? t(`beneficiaries.detail.edit_dialog.id_types.${beneficiaryData.documentType}`) : ""}
                disabled
                className="h-10 bg-neutral-50 border-neutral-200 text-neutral-400"
              />
            </div>

            {/* Document Number (readonly) */}
            <div className="flex-1 min-w-[250px] flex flex-col gap-2">
              <Label htmlFor="document-number" className="text-xs text-neutral-400">
                {t("beneficiaries.bank_accounts.dialog.document_number")}
              </Label>
              <Input
                id="document-number"
                value={beneficiaryData?.documentNumber || ""}
                disabled
                className="h-10 bg-neutral-100 border-neutral-200 text-neutral-400"
              />
            </div>

            {/* First Name (readonly) */}
            <div className="flex-1 min-w-[250px] flex flex-col gap-2">
              <Label htmlFor="first-name" className="text-xs text-neutral-400">
                {t("beneficiaries.bank_accounts.dialog.first_name")}
              </Label>
              <Input
                id="first-name"
                value={beneficiaryData?.firstName || ""}
                disabled
                className="h-10 bg-neutral-100 border-neutral-200 text-neutral-400"
              />
            </div>

            {/* Last Name (readonly) */}
            <div className="flex-1 min-w-[250px] flex flex-col gap-2">
              <Label htmlFor="last-name" className="text-xs text-neutral-400">
                {t("beneficiaries.bank_accounts.dialog.last_name")}
              </Label>
              <Input
                id="last-name"
                value={beneficiaryData?.lastName || ""}
                disabled
                className="h-10 bg-neutral-100 border-neutral-200 text-neutral-400"
              />
            </div>

            {/* Account Type */}
            <div className="flex-1 min-w-[250px] flex flex-col gap-2">
              <Label htmlFor="account-type" className="text-xs text-neutral-700">
                {t("beneficiaries.bank_accounts.dialog.account_type")}
              </Label>
              <Select value={accountType} onValueChange={setAccountType}>
                <SelectTrigger id="account-type" className="h-10 bg-white border-neutral-200 w-full">
                  <SelectValue
                    placeholder={t("beneficiaries.bank_accounts.dialog.account_type_placeholder")}
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ahorros">
                    {t("beneficiaries.bank_accounts.dialog.account_types.savings")}
                  </SelectItem>
                  <SelectItem value="corriente">
                    {t("beneficiaries.bank_accounts.dialog.account_types.checking")}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Bank */}
            <div className="flex-1 min-w-[250px] flex flex-col gap-2">
              <Label htmlFor="bank" className="text-xs text-neutral-700">
                {t("beneficiaries.bank_accounts.dialog.bank")}
              </Label>
              <Select value={bank} onValueChange={setBank}>
                <SelectTrigger id="bank" className="h-10 bg-white border-neutral-200 w-full">
                  <SelectValue
                    placeholder={t("beneficiaries.bank_accounts.dialog.bank_placeholder")}
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bancolombia">Bancolombia</SelectItem>
                  <SelectItem value="davivienda">Davivienda</SelectItem>
                  <SelectItem value="bbva">BBVA</SelectItem>
                  <SelectItem value="cobre">Cobre</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Account Number */}
            <div className="flex-1 min-w-[250px] flex flex-col gap-2">
              <Label htmlFor="account-number" className="text-xs text-neutral-700">
                {t("beneficiaries.bank_accounts.dialog.account_number")}
              </Label>
              <Input
                id="account-number"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                placeholder={t("beneficiaries.bank_accounts.dialog.account_number_placeholder")}
                className="h-10 bg-white border-neutral-200"
              />
            </div>

            {/* Set as Primary Checkbox */}
            <div className="flex-1 min-w-full flex items-center gap-4 h-10">
              <Checkbox
                id="is-primary"
                checked={isPrimary}
                onCheckedChange={(checked) => setIsPrimary(checked as boolean)}
              />
              <Label
                htmlFor="is-primary"
                className="text-sm text-neutral-700 cursor-pointer"
              >
                {t("beneficiaries.bank_accounts.dialog.set_as_primary")}
              </Label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-6">
            <Button
              type="button"
              variant="secondary"
              size="default"
              onClick={handleCancel}
            >
              {t("beneficiaries.bank_accounts.dialog.cancel")}
            </Button>
            <Button type="submit" variant="default" size="default">
              {t("beneficiaries.bank_accounts.dialog.submit")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
