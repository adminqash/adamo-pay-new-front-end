import { Card } from "@adamosuiteservices/ui/card";
import { useTranslation } from "react-i18next";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

interface TransactionData {
  name: string
  value: number
  color: string
}

interface AccountTransactionCountChartProps {
  data?: TransactionData[]
  _filterPeriod?: string
}

type PieTooltipPayloadItem = {
  value?: number
};

type PieTooltipProps = {
  active?: boolean
  payload?: PieTooltipPayloadItem[]
  total: number
  transactionsLabel: string
};

function AccountTransactionCountTooltip({
  active,
  payload,
  total,
  transactionsLabel,
}: PieTooltipProps) {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  const value = payload[0]?.value ?? 0;
  const percentage = total > 0 ? ((value / total) * 100).toFixed(0) : "0";

  return (
    <div className={`
      flex h-14 items-center rounded-full bg-white px-4 py-4
      shadow-[0px_2px_6px_0px_rgba(0,0,0,0.08)]
    `}
    >
      <p className="text-sm whitespace-nowrap text-neutral-700">
        {value.toLocaleString()} {transactionsLabel} | {percentage}%
      </p>
    </div>
  );
}

/**
 * account transaction count chart component
 *
 * displays a donut chart showing number of transactions by account
 */
export function AccountTransactionCountChart({
  data: propData,
}: AccountTransactionCountChartProps) {
  const { t } = useTranslation("metrics");

  const data = propData ?? [];
  const totalTransactions = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <Card className={`
      flex h-[400px] w-full flex-col items-center justify-center gap-8
      rounded-3xl border-0 p-4
      md:h-[500px] md:gap-14 md:p-6
    `}
    >
      {/* Chart Container */}
      <div className={`
        relative h-[260px] w-full
        md:h-[260px]
      `}
      >
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius="60%"
              outerRadius="80%"
              paddingAngle={0}
              dataKey="value"
              startAngle={90}
              endAngle={450}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
              ))}
            </Pie>
            <Tooltip
              content={(
                <AccountTransactionCountTooltip
                  total={totalTransactions}
                  transactionsLabel={t("metrics.account_transaction_count.transactions")}
                />
              )}
              cursor={false}
              wrapperStyle={{ zIndex: 1000 }}
            />
          </PieChart>
        </ResponsiveContainer>
        {/* Center Text */}
        <div className={`
          pointer-events-none absolute top-1/2 left-1/2 flex w-32
          -translate-x-1/2 -translate-y-1/2 transform flex-col items-center
          gap-1 text-center
        `}
        >
          <p className="text-sm font-bold text-neutral-700">
            {totalTransactions.toLocaleString()}
          </p>
          <p className="text-sm text-neutral-700">
            {t("metrics.account_transaction_count.total_transactions")}
          </p>
        </div>
      </div>
      {/* Legend */}
      <div className={`
        flex w-full flex-wrap items-center justify-center gap-x-6 gap-y-3
      `}
      >
        {data.map((entry) => (
          <div key={entry.name} className="flex items-center gap-2">
            <div
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <p className="text-sm text-neutral-700">{entry.name}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}
