import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@adamosuiteservices/ui/sheet";
import { useTranslation } from "react-i18next";
import type { InfolaftMatch } from "@/features/compliance/application/entities/compliance-case.entity";
import { riskBandFromLevel } from "@/features/compliance/application/entities/compliance-case.entity";

type FindingDetailSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  match: InfolaftMatch | null
};

function Field({ label, value }: { label: string, value?: string }) {
  if (!value) {
    return null;
  }

  return (
    <div className="flex flex-col gap-1">
      <p className="text-xs text-neutrals-500">{label}</p>
      <p className="text-sm font-semibold whitespace-pre-wrap text-neutrals-900">{value}</p>
    </div>
  );
}

export function FindingDetailSheet({ open, onOpenChange, match }: FindingDetailSheetProps) {
  const { t } = useTranslation(["compliance"]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:w-[480px] sm:max-w-[480px]">
        <SheetHeader>
          <SheetTitle>{t("compliance:novedad.finding_details")}</SheetTitle>
        </SheetHeader>
        <SheetBody className="flex flex-col gap-6 overflow-y-auto">
          {match && (
            <>
              <Field label={t("compliance:novedad.columns.id")} value={match.documentId ?? match.id} />
              <Field label={t("compliance:novedad.columns.match")} value={match.fullName} />
              <Field label={t("compliance:novedad.list_code")} value={match.codigoLista} />
              <Field label={t("compliance:novedad.list_names")} value={match.listNames ?? match.nombreLista} />
              <Field label={t("compliance:novedad.info_list_id")} value={match.infoListId} />
              <Field
                label={t("compliance:novedad.columns.score")}
                value={match.score !== undefined ? String(match.score) : undefined}
              />
              <Field
                label={t("compliance:novedad.columns.risk")}
                value={
                  match.riskLevel !== undefined
                    ? t(`compliance:review.risk.${riskBandFromLevel(match.riskLevel)}`)
                    : undefined
                }
              />
              <Field label={t("compliance:novedad.comments")} value={match.comments} />
              <Field label={t("compliance:novedad.type")} value={match.type} />
              <Field label={t("compliance:novedad.country")} value={match.country} />
              {match.link && (
                <a
                  href={match.link}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm text-primary underline"
                >
                  {match.link}
                </a>
              )}
            </>
          )}
        </SheetBody>
      </SheetContent>
    </Sheet>
  );
}
