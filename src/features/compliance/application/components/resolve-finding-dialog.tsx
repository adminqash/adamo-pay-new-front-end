import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@adamosuiteservices/ui/dialog";
import { Button } from "@adamosuiteservices/ui/button";
import { Label } from "@adamosuiteservices/ui/label";
import { useState } from "react";
import { useTranslation } from "react-i18next";

type ResolveFindingDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  isPending?: boolean
  onConfirm: (note: string) => void
};

export function ResolveFindingDialog({
  open,
  onOpenChange,
  isPending,
  onConfirm,
}: ResolveFindingDialogProps) {
  const { t } = useTranslation(["compliance"]);
  const [note, setNote] = useState("");

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) {
          setNote("");
        }
        onOpenChange(next);
      }}
    >
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{t("compliance:novedad.resolve_title")}</DialogTitle>
        </DialogHeader>
        <DialogBody className="flex flex-col gap-4">
          <Label className="text-sm text-neutrals-700">
            {t("compliance:novedad.resolve_instruction")}
          </Label>
          <textarea
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder={t("compliance:novedad.resolve_placeholder")}
            className="min-h-28 w-full rounded-2xl border border-neutrals-200 bg-white p-4 text-sm text-neutrals-900 outline-none"
          />
        </DialogBody>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="secondary">{t("compliance:actions.cancel")}</Button>
          </DialogClose>
          <Button
            variant="default"
            disabled={!note.trim() || isPending}
            onClick={() => onConfirm(note.trim())}
          >
            {t("compliance:novedad.resolve_action")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
