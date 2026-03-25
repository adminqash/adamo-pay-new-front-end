import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@adamosuiteservices/ui/dialog";
import { Button } from "@adamosuiteservices/ui/button";
import { Icon } from "@adamosuiteservices/ui/icon";

interface UnfreezeCardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cardNumber: string;
  onConfirm?: () => void;
}

export function UnfreezeCardDialog({
  open,
  onOpenChange,
  cardNumber = "1111",
  onConfirm,
}: UnfreezeCardDialogProps) {
  const { t } = useTranslation("beneficiaries");

  const handleUnfreeze = () => {
    onOpenChange(false);
    // Call onConfirm callback to open OTP dialog
    if (onConfirm) {
      setTimeout(() => {
        onConfirm();
      }, 200);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]" onClick={(e) => e.stopPropagation()}>
        <DialogHeader>
          <DialogTitle>{t("beneficiaries.detail.unfreeze_card_dialog.title")}</DialogTitle>
          <DialogDescription>
            {t("beneficiaries.detail.unfreeze_card_dialog.description", { cardNumber: cardNumber.slice(-4) })}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-2">
          {/* Benefit 1 */}
          <div className="flex items-center gap-2">
            <Icon symbol="check" weight={200} className="text-2xl text-success" />
            <p className="text-sm text-neutral-700">
              {t("beneficiaries.detail.unfreeze_card_dialog.benefit_1")}
            </p>
          </div>

          {/* Benefit 2 */}
          <div className="flex items-center gap-2">
            <Icon symbol="check" weight={200} className="text-2xl text-success" />
            <p className="text-sm text-neutral-700">
              {t("beneficiaries.detail.unfreeze_card_dialog.benefit_2")}
            </p>
          </div>

          {/* Benefit 3 */}
          <div className="flex items-center gap-2">
            <Icon symbol="check" weight={200} className="text-2xl text-success" />
            <p className="text-sm text-neutral-700">
              {t("beneficiaries.detail.unfreeze_card_dialog.benefit_3")}
            </p>
          </div>
        </div>

        <div className="flex gap-6">
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            {t("beneficiaries.detail.unfreeze_card_dialog.cancel")}
          </Button>
          <Button onClick={handleUnfreeze}>
            {t("beneficiaries.detail.unfreeze_card_dialog.confirm")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
