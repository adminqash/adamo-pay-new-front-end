import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@adamosuiteservices/ui/dialog";
import { Button } from "@adamosuiteservices/ui/button";
import { Icon } from "@adamosuiteservices/ui/icon";
import { useTranslation } from "react-i18next";

interface FreezeCardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cardNumber: string;
  onConfirm?: () => void;
}

/**
 * freeze card dialog
 * 
 * confirmation dialog for freezing a credit card
 */
export function FreezeCardDialog({
  open,
  onOpenChange,
  cardNumber,
  onConfirm,
}: FreezeCardDialogProps) {
  const { t } = useTranslation("beneficiaries");

  const handleConfirm = () => {
    onOpenChange(false);
    // Call onConfirm callback to open OTP dialog
    if (onConfirm) {
      setTimeout(() => {
        onConfirm();
      }, 200);
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]" onClick={(e) => e.stopPropagation()}>
        <DialogHeader>
          <DialogTitle>
            {t("beneficiaries.detail.freeze_card_dialog.title")}
          </DialogTitle>
          <DialogDescription>
            {t("beneficiaries.detail.freeze_card_dialog.description", {
              cardNumber: cardNumber.slice(-4),
            })}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-8">
          {/* Restrictions list */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Icon symbol="close" weight={200} className="text-2xl text-destructive" />
              <p className="text-sm text-neutral-700">
                {t("beneficiaries.detail.freeze_card_dialog.restriction_1")}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Icon symbol="close" weight={200} className="text-2xl text-destructive" />
              <p className="text-sm text-neutral-700">
                {t("beneficiaries.detail.freeze_card_dialog.restriction_2")}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Icon symbol="close" weight={200} className="text-2xl text-destructive" />
              <p className="text-sm text-neutral-700">
                {t("beneficiaries.detail.freeze_card_dialog.restriction_3")}
              </p>
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
              {t("beneficiaries.detail.freeze_card_dialog.cancel")}
            </Button>
            <Button
              type="button"
              variant="default"
              size="default"
              onClick={handleConfirm}
            >
              {t("beneficiaries.detail.freeze_card_dialog.confirm")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
