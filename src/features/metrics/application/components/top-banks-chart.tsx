import { Badge } from "@adamosuiteservices/ui/badge";
import { Card } from "@adamosuiteservices/ui/card";
import { useTranslation } from "react-i18next";

interface BankData {
  name: string
  responseTime: number
  transactions: number
  variant: "success-medium" | "warning-medium" | "destructive-medium"
}

interface TopBanksChartProps {
  _filterPeriod?: string
  banks?: BankData[]
}

export function TopBanksChart({ banks = [] }: TopBanksChartProps = {}) {
  const { t } = useTranslation("metrics");
  return (
    <Card className="flex w-full flex-col gap-2 rounded-3xl border-0 p-4">
      {banks.map((bank) => (
        <Card
          key={bank.name}
          className={`
            flex flex-col items-start rounded-2xl border-0 bg-neutral-50 p-4
          `}
        >
          <div className="flex h-16 w-full items-center">
            <div className={`
              flex flex-1 flex-col items-start justify-center gap-0
            `}
            >
              <div className="flex w-full flex-col items-start gap-2">
                <p className="w-full text-xs font-semibold text-neutral-700">
                  {bank.name}
                </p>
                <div className={`
                  flex h-10 w-full items-center justify-center gap-2 pl-2
                `}
                >
                  <div className="flex h-8 flex-1 items-center gap-2">
                    <Badge
                      variant={bank.variant}
                      className="h-8 rounded-xl px-2"
                    >
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
