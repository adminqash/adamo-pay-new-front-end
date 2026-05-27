import { Badge } from "@adamosuiteservices/ui/badge";
import { useTranslation } from "react-i18next";

interface Beneficiary {
  name: string;
  transactions: number;
  rank: number;
}

interface TopBeneficiariesByTransactionsProps {
  beneficiaries?: Beneficiary[];
  _filterPeriod?: string;
}

/**
 * top beneficiaries by transactions component
 * 
 * displays top 10 beneficiaries ranked by transaction count
 */
export function TopBeneficiariesByTransactions({ beneficiaries, _filterPeriod = "today" }: TopBeneficiariesByTransactionsProps) {
  const { t } = useTranslation("metrics");

  const defaultBeneficiaries: Beneficiary[] = [
    { name: "Juan Mariano Gonzalez", transactions: 1245, rank: 1 },
    { name: "Mariana Diaz", transactions: 1002, rank: 2 },
    { name: "Lucas Paredes", transactions: 930, rank: 3 },
    { name: "Sofía Kim", transactions: 856, rank: 4 },
    { name: "Diego Torres", transactions: 812, rank: 5 },
    { name: "Emma Wang", transactions: 414, rank: 6 },
    { name: "Liam Smith", transactions: 389, rank: 7 },
    { name: "Olivia Brown", transactions: 345, rank: 8 },
    { name: "Aiden Johnson", transactions: 102, rank: 9 },
    { name: "Isabella Martinez", transactions: 78, rank: 10 },
  ];

  const displayBeneficiaries = beneficiaries || defaultBeneficiaries;

  return (
    <div className="flex flex-col flex-1 basis-full md:basis-[340px] gap-6">
      <p className="text-sm text-neutral-700">
        {t("metrics.beneficiaries_by_transactions.title")}
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
                  <Badge className="h-8 px-2 rounded-xl bg-neutral-50 text-neutral-700">
                    {beneficiary.transactions.toLocaleString()} {t("metrics.beneficiaries_by_transactions.transactions")}
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
