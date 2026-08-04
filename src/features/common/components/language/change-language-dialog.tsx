import { Button } from "@adamosuiteservices/ui/button";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@adamosuiteservices/ui/dialog";
import { Field, FieldLabel } from "@adamosuiteservices/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@adamosuiteservices/ui/select";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { AVAILABLE_LANGUAGES } from "@/lib/i18n/i18n.config";

export type ChangeLanguageDialogProps = Readonly<{
  open: boolean
  onOpenChange: (open: boolean) => void
}>;

export function ChangeLanguageDialog({ open, onOpenChange }: ChangeLanguageDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`
        max-w-[400px] gap-4
        md:max-w-lg
      `}
      >
        <ChangeLanguageDialogContent onOpenChange={onOpenChange} />
      </DialogContent>
    </Dialog>
  );
}

type ChangeLanguageDialogContentProps = Omit<ChangeLanguageDialogProps, "open">;

function ChangeLanguageDialogContent({ onOpenChange }: ChangeLanguageDialogContentProps) {
  const { t, i18n } = useTranslation(["suite-header"]);
  const [selectedLanguage, setSelectedLanguage] = useState(i18n.language);

  const handleCancel = () => {
    onOpenChange(false);
  };

  const handleSave = () => {
    i18n.changeLanguage(selectedLanguage);
    onOpenChange(false);
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>{t("language_dialog.title")}</DialogTitle>
        <DialogDescription>{t("language_dialog.description")}</DialogDescription>
      </DialogHeader>
      <DialogBody>
        <Field>
          <FieldLabel htmlFor="language" className="sr-only">
            {t("language_dialog.description")}
          </FieldLabel>
          <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
            <SelectTrigger id="language">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {AVAILABLE_LANGUAGES.map((lang) => (
                <SelectItem key={lang} value={lang}>
                  {t(`language_dialog.languages.${lang}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      </DialogBody>
      <DialogFooter>
        <Button type="button" variant="secondary" onClick={handleCancel}>
          {t("language_dialog.actions.cancel")}
        </Button>
        <Button type="button" onClick={handleSave}>
          {t("language_dialog.actions.save")}
        </Button>
      </DialogFooter>
    </>
  );
}
