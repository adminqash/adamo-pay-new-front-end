import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@adamosuiteservices/ui/dialog";
import { Button } from "@adamosuiteservices/ui/button";
import { Label } from "@adamosuiteservices/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@adamosuiteservices/ui/select";
import { useState } from "react";

interface ReportReplacementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cardNumber: string;
  onConfirm?: () => void;
}

/**
 * report and replacement dialog
 * 
 * dialog for reporting a credit card and requesting replacement
 */
export function ReportReplacementDialog({
  open,
  onOpenChange,
  cardNumber,
  onConfirm,
}: ReportReplacementDialogProps) {
  const { t } = useTranslation("beneficiaries");
  const [reason, setReason] = useState("");

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
    onOpenChange(false);
    setReason("");
  };

  const handleCancel = () => {
    onOpenChange(false);
    setReason("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {t("beneficiaries.detail.report_replacement_dialog.title")}
          </DialogTitle>
          <DialogDescription>
            {t("beneficiaries.detail.report_replacement_dialog.description", { cardNumber: cardNumber.slice(-4) })}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-2">
          <Label htmlFor="reason" className="text-xs text-neutral-700">
            {t("beneficiaries.detail.report_replacement_dialog.reason_label")}
          </Label>
          <Select value={reason} onValueChange={setReason}>
            <SelectTrigger id="reason" className="h-10 bg-white border-neutral-200 w-full">
              <SelectValue
                placeholder={t("beneficiaries.detail.report_replacement_dialog.reason_placeholder")}
              />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="lost">
                {t("beneficiaries.detail.report_replacement_dialog.reasons.lost")}
              </SelectItem>
              <SelectItem value="stolen">
                {t("beneficiaries.detail.report_replacement_dialog.reasons.stolen")}
              </SelectItem>
              <SelectItem value="damaged">
                {t("beneficiaries.detail.report_replacement_dialog.reasons.damaged")}
              </SelectItem>
              <SelectItem value="other">
                {t("beneficiaries.detail.report_replacement_dialog.reasons.other")}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-6">
          <Button variant="secondary" onClick={handleCancel}>
            {t("beneficiaries.detail.report_replacement_dialog.cancel")}
          </Button>
          <Button onClick={handleConfirm} disabled={!reason}>
            {t("beneficiaries.detail.report_replacement_dialog.confirm")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
