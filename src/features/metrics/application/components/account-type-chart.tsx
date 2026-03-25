import { Card } from "@adamosuiteservices/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { useTranslation } from "react-i18next";

interface TransactionData {
  name: string;
  value: number;
  color: string;
}

interface AccountTransactionAmountChartProps {
  data?: TransactionData[];
  _filterPeriod?: string;
}

/**
 * account transaction amount chart component
 * 
 * displays a donut chart showing payment amounts by account
 */
export function AccountTransactionAmountChart({
  data: propData,
  _filterPeriod = "today",
}: AccountTransactionAmountChartProps) {
  const { t } = useTranslation("metrics");

  // Mock data - will be replaced with real data later (values in millions)
  const defaultData: TransactionData[] = [
    { name: t("metrics.account_transaction_amount.accounts_list.main"), value: 45300000, color: "#10b981" }, // success-500
    { name: t("metrics.account_transaction_amount.accounts_list.payroll"), value: 68700000, color: "#60a5fa" }, // blue-400
    { name: t("metrics.account_transaction_amount.accounts_list.savings"), value: 23100000, color: "#f59e0b" }, // warning-500
  ];

  const data = propData || defaultData;
  const totalAmount = data.reduce((sum, item) => sum + item.value, 0);

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Custom tooltip for pie chart
  const CustomPieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const { value } = payload[0];
      const percentage = ((value / totalAmount) * 100).toFixed(0);
      return (
        <div className="bg-background shadow-[0px_2px_6px_0px_rgba(0,0,0,0.08)] rounded-full px-4 py-4 h-14 flex items-center">
          <p className="text-sm text-foreground whitespace-nowrap">
            {formatCurrency(value)} | {percentage}%
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="flex flex-col gap-8 md:gap-14 items-center justify-center border-0 p-4 md:p-6 h-[400px] md:h-[500px] rounded-3xl w-full">
      {/* Chart Container */}
      <div className="relative w-full h-[260px] md:h-[260px]">
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
            <Tooltip content={<CustomPieTooltip />} cursor={false} wrapperStyle={{ zIndex: 1000 }} />
          </PieChart>
        </ResponsiveContainer>

        {/* Center Text */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col gap-1 items-center text-center w-32 pointer-events-none">
          <p className="text-sm font-bold text-foreground">
            {formatCurrency(totalAmount)}
          </p>
          <p className="text-sm text-foreground">
            {t("metrics.account_transaction_amount.total_amount")}
          </p>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-x-6 gap-y-3 items-center justify-center w-full">
        {data.map((entry) => (
          <div key={entry.name} className="flex items-center gap-2">
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <p className="text-sm text-foreground">{entry.name}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}
