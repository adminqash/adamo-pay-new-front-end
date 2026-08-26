import { Card } from "@adamosuiteservices/ui/card";
import { Button } from "@adamosuiteservices/ui/button";
import { Icon } from "@adamosuiteservices/ui/icon";
import { useTranslation } from "react-i18next";
import type { ComplianceFinding } from "@/features/compliance/application/entities/compliance-case.entity";
import { RiskMeter } from "./risk-meter";

type RestrictiveListCardProps = {
  finding: ComplianceFinding
  onReview: () => void
};

export function RestrictiveListCard({ finding, onReview }: RestrictiveListCardProps) {
  const { t } = useTranslation(["compliance"]);

  return (
    <Card className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border-0 p-4">
      <div className="flex min-w-0 flex-1 flex-col gap-4">
        <div className="flex flex-col gap-2">
          <p className="text-xs text-neutrals-500">
            {t("compliance:review.list_name")}
          </p>
          <div className="flex items-center gap-2 pl-2">
            <Icon symbol="clarify" weight={200} className="size-6 text-neutrals-900" />
            <p className="text-sm font-semibold text-neutrals-900">{finding.nombreLista}</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <RiskMeter
            band={finding.riskBand}
            label={t(`compliance:review.risk.${finding.riskBand}`)}
          />
          {finding.resolved && (
            <p className="text-sm font-semibold text-neutrals-700">
              {t("compliance:review.resolved")}
            </p>
          )}
        </div>
      </div>
      <Button variant="secondary" onClick={onReview}>
        {t("compliance:review.review_finding")}
      </Button>
    </Card>
  );
}
