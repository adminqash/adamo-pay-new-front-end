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

interface DeleteReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reportName: string;
  onConfirm: () => void;
}

export function DeleteReportDialog({
  open,
  onOpenChange,
  reportName,
  onConfirm,
}: DeleteReportDialogProps) {
  const { t } = useTranslation("reports");

  const handleConfirm = () => {
    onConfirm();
    onOpenChange(false);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] gap-12">
        <DialogHeader>
          <DialogTitle>{t("reports:delete_dialog.title")}</DialogTitle>
          <DialogDescription>
            {t("reports:delete_dialog.description", { name: reportName })}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="secondary" onClick={handleCancel}>
            {t("reports:delete_dialog.cancel")}
          </Button>
          <Button variant="destructive-medium" onClick={handleConfirm}>
            {t("reports:delete_dialog.confirm")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
