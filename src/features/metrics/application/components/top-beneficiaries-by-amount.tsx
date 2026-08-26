import { Badge } from "@adamosuiteservices/ui/badge";
import { useTranslation } from "react-i18next";

interface Beneficiary {
  name: string;
  amount: string;
  rank: number;
}

interface TopBeneficiariesByAmountProps {
  beneficiaries?: Beneficiary[];
  _filterPeriod?: string;
}

/**
 * top beneficiaries by amount component
 * 
 * displays top 10 beneficiaries ranked by transaction amount
 */
export function TopBeneficiariesByAmount({ beneficiaries = [], _filterPeriod = "today" }: TopBeneficiariesByAmountProps) {
  const { t } = useTranslation("metrics");

  return (
    <div className="flex flex-col flex-1 basis-full md:basis-[340px] gap-6">
      <p className="text-sm text-neutral-700">
        {t("metrics.beneficiaries_by_amount.title")}
      </p>
      <div className="bg-white flex flex-col gap-2 p-4 rounded-3xl w-full">
        {beneficiaries.map((beneficiary) => (
          <div
            key={beneficiary.rank}
            className="bg-neutral-50 flex flex-col p-4 rounded-2xl w-full"
          >
            <div className="flex h-16 items-center w-full">
              <div className="flex flex-col gap-2 w-full">
                <p className="text-xs font-semibold text-neutral-700">
                  {beneficiary.name}
                </p>
                <div className="flex items-center gap-2 h-10 pl-2">
                  <Badge className="h-8 px-2 rounded-xl bg-success-50 text-neutral-700">
                    {beneficiary.amount}
                  </Badge>
                  <p className="text-xs text-neutral-500">
                    #{beneficiary.rank.toString().padStart(2, "0")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
