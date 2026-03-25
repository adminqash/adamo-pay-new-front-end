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
export function TopBeneficiariesByAmount({ beneficiaries, _filterPeriod = "today" }: TopBeneficiariesByAmountProps) {
  const { t } = useTranslation("metrics");

  const defaultBeneficiaries: Beneficiary[] = [
    { name: "Valentina Pérez", amount: "$12.039.501,33", rank: 1 },
    { name: "Camila López", amount: "$9.874.321,45", rank: 2 },
    { name: "Diego Rodríguez", amount: "$6.543.210,78", rank: 3 },
    { name: "Mateo González", amount: "$3.210.987,12", rank: 4 },
    { name: "Sofía Martínez", amount: "$2.234.567,89", rank: 5 },
    { name: "Lucas Gómez", amount: "$2.145.678,90", rank: 6 },
    { name: "Valentina Ruiz", amount: "$2.056.789,01", rank: 7 },
    { name: "Mateo Pérez", amount: "$1.567.890,12", rank: 8 },
    { name: "Camila Torres", amount: "$1.678.901,23", rank: 9 },
    { name: "Javier López", amount: "$1.089.012,34", rank: 10 },
  ];

  const displayBeneficiaries = beneficiaries || defaultBeneficiaries;

  return (
    <div className="flex flex-col flex-1 basis-full md:basis-[340px] gap-6">
      <p className="text-sm text-neutral-700">
        {t("metrics.beneficiaries_by_amount.title")}
      </p>
      <div className="bg-white flex flex-col gap-2 p-4 rounded-3xl w-full">
        {displayBeneficiaries.map((beneficiary) => (
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
