import { Card } from "@adamosuiteservices/ui/card";
import { Badge } from "@adamosuiteservices/ui/badge";
import { useTranslation } from "react-i18next";

interface RejectionReason {
  title: string;
  percentage: number;
  cases: number;
}

interface RejectionReasonsProps {
  reasons?: RejectionReason[];
  _filterPeriod?: string;
}

/**
 * rejection reasons component
 * 
 * displays a list of rejection reasons with percentages and case counts
 */
export function RejectionReasons({ reasons, _filterPeriod = "today" }: RejectionReasonsProps) {
  const { t } = useTranslation("metrics");

  // Use provided reasons or default mock data
  const defaultReasons: RejectionReason[] = [
    { title: t("metrics.rejection_reasons.reasons.invalid_account"), percentage: 44.5, cases: 45 },
    { title: t("metrics.rejection_reasons.reasons.daily_limit_exceeded"), percentage: 27.7, cases: 28 },
    { title: t("metrics.rejection_reasons.reasons.account_mismatch"), percentage: 17.8, cases: 18 },
    { title: t("metrics.rejection_reasons.reasons.incorrect_id"), percentage: 5.9, cases: 6 },
    { title: t("metrics.rejection_reasons.reasons.other"), percentage: 4.1, cases: 4 },
  ];

  const displayReasons = reasons || defaultReasons;
  return (
    <Card className="flex flex-col gap-2 border-0 bg-background p-4 rounded-3xl w-full">
      {displayReasons.map((reason, index) => (
        <Card
          key={index}
          className="flex flex-col items-start border-0 bg-muted p-4 rounded-2xl"
        >
          <div className="flex h-16 items-center w-full">
            <div className="flex flex-1 flex-col gap-0 items-start justify-center">
              <div className="flex flex-col gap-2 items-start w-full">
                <p className="text-xs font-semibold text-foreground w-full">
                  {reason.title}
                </p>
                <div className="flex gap-2 h-10 items-center justify-center pl-2 w-full">
                  <div className="flex flex-1 gap-2 h-8 items-center">
                    <Badge
                      variant="destructive-medium"
                      className="h-8 px-2 rounded-xl"
                    >
                      {reason.percentage}%
                    </Badge>
                    <p className="text-xs text-muted-foreground">
                      {reason.cases} {t("metrics.rejection_reasons.cases_detected")}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </Card>
  );
}
