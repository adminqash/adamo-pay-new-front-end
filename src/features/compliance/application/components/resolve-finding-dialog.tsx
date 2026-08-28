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
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@adamosuiteservices/ui/input-otp";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { useState } from "react";
import { useTranslation } from "react-i18next";

type ResolveFindingDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  isPending?: boolean
  onConfirm: (note: string, totp: string) => void
};

export function ResolveFindingDialog({
  open,
  onOpenChange,
  isPending,
  onConfirm,
}: ResolveFindingDialogProps) {
  const { t } = useTranslation(["compliance", "transactions"]);
  const [note, setNote] = useState("");
  const [totp, setTotp] = useState("");
  const [step, setStep] = useState<"note" | "totp">("note");

  const reset = () => {
    setNote("");
    setTotp("");
    setStep("note");
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) {
          reset();
        }
        onOpenChange(next);
      }}
    >
      <DialogContent className="sm:max-w-[600px]">
        {step === "note" ? (
          <>
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
                className={`
                  min-h-28 w-full rounded-2xl border border-neutrals-200
                  bg-white p-4 text-sm text-neutrals-900 outline-none
                `}
              />
            </DialogBody>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="secondary">{t("compliance:actions.cancel")}</Button>
              </DialogClose>
              <Button
                variant="default"
                disabled={!note.trim() || isPending}
                onClick={() => setStep("totp")}
              >
                {t("compliance:novedad.resolve_action")}
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>{t("transactions:transactions.otp_dialog.title")}</DialogTitle>
            </DialogHeader>
            <DialogBody className="flex flex-col gap-4">
              <p className="text-sm text-neutrals-700">
                {t("compliance:novedad.otp_description")}
              </p>
              <InputOTP
                maxLength={6}
                value={totp}
                onChange={setTotp}
                pattern={REGEXP_ONLY_DIGITS}
                containerClassName="w-full"
              >
                <InputOTPGroup className="w-full">
                  <InputOTPSlot index={0} className="flex-1" />
                  <InputOTPSlot index={1} className="flex-1" />
                  <InputOTPSlot index={2} className="flex-1" />
                  <InputOTPSlot index={3} className="flex-1" />
                  <InputOTPSlot index={4} className="flex-1" />
                  <InputOTPSlot index={5} className="flex-1" />
                </InputOTPGroup>
              </InputOTP>
            </DialogBody>
            <DialogFooter>
              <Button variant="secondary" onClick={() => setStep("note")}>
                {t("compliance:actions.cancel")}
              </Button>
              <Button
                variant="default"
                disabled={totp.length !== 6 || isPending}
                onClick={() => onConfirm(note.trim(), totp)}
              >
                {t("transactions:transactions.otp_dialog.confirm")}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
