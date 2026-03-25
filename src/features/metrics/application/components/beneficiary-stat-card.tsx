import { Card } from "@adamosuiteservices/ui/card";
import { useTranslation } from "react-i18next";

interface BeneficiaryStatCardProps {
  newBeneficiaries?: number;
  percentageChange?: number;
  _filterPeriod?: string;
}

/**
 * beneficiary stat card component
 * 
 * displays new beneficiaries count with variation percentage
 */
export function BeneficiaryStatCard({ 
  newBeneficiaries = 19,
  percentageChange = 5.2,
  _filterPeriod = "today"
}: BeneficiaryStatCardProps) {
  const { t } = useTranslation("metrics");

  return (
    <Card className="flex flex-row flex-wrap items-center justify-between gap-2 bg-primary-25 border-0 p-4 rounded-3xl w-full">
      <div className="flex items-center gap-3">
        <span 
          className="material-symbols-outlined text-foreground text-2xl"
          style={{ fontVariationSettings: "'wght' 200" }}
        >
          account_circle
        </span>
        <p className="text-sm font-bold text-foreground">
          {newBeneficiaries}
        </p>
        <p className="text-sm text-foreground">
          {t("metrics.beneficiary_stats.new_beneficiaries")}
        </p>
      </div>
      <div className="flex items-center gap-2 h-6">
        <span className="material-symbols-outlined text-success-600 text-2xl">
          arrow_drop_up
        </span>
        <p className="text-sm text-success-600 whitespace-nowrap">
          {percentageChange}% {t("metrics.beneficiary_stats.previous_period")}
        </p>
      </div>
    </Card>
  );
}
