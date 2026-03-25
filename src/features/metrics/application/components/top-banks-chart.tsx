import { Card } from "@adamosuiteservices/ui/card";
import { Badge } from "@adamosuiteservices/ui/badge";
import { useTranslation } from "react-i18next";

interface BankData {
  name: string;
  responseTime: number;
  transactions: number;
  variant: "success-medium" | "warning-medium" | "destructive-medium";
}

interface TopBanksChartProps {
  _filterPeriod?: string;
}

/**
 * top banks chart component
 * 
 * displays top 5 banks with lowest response time
 */
export function TopBanksChart({ _filterPeriod = "today" }: TopBanksChartProps = {}) {
  const { t } = useTranslation("metrics");

  // Mock data - will be replaced with real data later
  const banksData: BankData[] = [
    { 
      name: "Bancolombia", 
      responseTime: 2.3, 
      transactions: 1322,
      variant: "success-medium"
    },
    { 
      name: "Cobre", 
      responseTime: 2.8, 
      transactions: 1108,
      variant: "success-medium"
    },
    { 
      name: "BBVA", 
      responseTime: 9.7, 
      transactions: 977,
      variant: "success-medium"
    },
    { 
      name: "Davivienda", 
      responseTime: 19.5, 
      transactions: 2401,
      variant: "warning-medium"
    },
    { 
      name: "Santander", 
      responseTime: 33.1, 
      transactions: 311,
      variant: "destructive-medium"
    },
  ];

  return (
    <Card className="flex flex-col gap-2 border-0 p-4 rounded-3xl w-full">
      {banksData.map((bank) => (
        <Card 
          key={bank.name}
          className="flex flex-col items-start p-4 rounded-2xl bg-neutral-50 border-0"
        >
          <div className="flex h-16 items-center w-full">
            <div className="flex flex-1 flex-col gap-0 items-start justify-center">
              <div className="flex flex-col gap-2 items-start w-full">
                <p className="text-xs font-semibold text-neutral-700 w-full">
                  {bank.name}
                </p>
                <div className="flex gap-2 h-10 items-center justify-center pl-2 w-full">
                  <div className="flex flex-1 gap-2 h-8 items-center">
                    <Badge variant={bank.variant} className="h-8 px-2 rounded-xl">
                      {bank.responseTime} {t("metrics.top_banks.minutes")}
                    </Badge>
                    <p className="text-xs text-neutral-400">
                      {bank.transactions.toLocaleString()} {t("metrics.top_banks.transactions")}
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
