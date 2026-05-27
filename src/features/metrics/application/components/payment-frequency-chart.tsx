import { Card } from "@adamosuiteservices/ui/card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from "recharts";
import { useState } from "react";
import { useTranslation } from "react-i18next";

interface PaymentFrequencyChartProps {
  currentTime?: string;
  totalPayments?: number;
  filterType?: "today" | "this_week" | "this_month" | "custom";
}

/**
 * payment frequency chart component
 * 
 * displays payment frequency visualization using recharts area chart
 */
export function PaymentFrequencyChart({
  currentTime = "Hoy 10:22 AM",
  totalPayments = 1790,
  filterType = "this_week",
}: PaymentFrequencyChartProps) {
  const { t } = useTranslation("metrics");
  
  // TODO: Replace with actual data from API
  const getChartData = () => {
    switch (filterType) {
      case "today":
        return [
          { label: "00:00", payments: 800 },
          { label: "04:00", payments: 1200 },
          { label: "08:00", payments: 2100 },
          { label: "12:00", payments: 2800 },
          { label: "16:00", payments: 3200 },
          { label: "20:00", payments: 2400 },
          { label: "24:00", payments: 1500 },
        ];
      case "this_month":
        return [
          { label: "01", payments: 1200 },
          { label: "04", payments: 1800 },
          { label: "07", payments: 2200 },
          { label: "10", payments: 1600 },
          { label: "13", payments: 2500 },
          { label: "16", payments: 2100 },
          { label: "19", payments: 2800 },
          { label: "22", payments: 3200 },
          { label: "25", payments: 2600 },
          { label: "28", payments: 3000 },
        ];
      case "this_week":
      default:
        return [
          { label: t("metrics.days.monday"), payments: 1500 },
          { label: t("metrics.days.tuesday"), payments: 2800 },
          { label: t("metrics.days.wednesday"), payments: 2500 },
          { label: t("metrics.days.thursday"), payments: 1800 },
          { label: t("metrics.days.friday"), payments: 3200 },
          { label: t("metrics.days.saturday"), payments: 1200 },
          { label: t("metrics.days.sunday"), payments: 3500 },
        ];
    }
  };

  const data = getChartData();

  const [activeDay, setActiveDay] = useState<string | null>(null);

  // Format numbers in short form (1000 → 1k, 3200 → 3.2k)
  const formatNumber = (num: number): string => {
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1).replace(/\.0$/, "")}k`;
    }
    return num.toString();
  };

  // Custom tooltip that updates the header
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const label = payload[0].payload.label;
      const payments = payload[0].value;
      
      if (label !== activeDay) {
        setActiveDay(label);
      }
    }
    return null; // Don't render anything visible
  };

  const handleMouseLeave = () => {
    setActiveDay(null);
  };

  // Custom active dot with halo effect
  const CustomActiveDot = (props: any) => {
    const { cx, cy } = props;
    return (
      <g>
        {/* Halo circle */}
        <circle 
          cx={cx} 
          cy={cy} 
          r={12} 
          fill="rgba(14, 147, 132, 0.10)" 
        />
        {/* Main dot */}
        <circle 
          cx={cx} 
          cy={cy} 
          r={8} 
          fill="oklch(.7477 .0802 186.37)" 
          stroke="white" 
          strokeWidth={2}
        />
      </g>
    );
  };

  // Find the active data point
  const activeData = activeDay ? data.find(d => d.label === activeDay) : null;
  const displayLabel = activeDay || currentTime;
  const displayPayments = activeData 
    ? formatNumber(activeData.payments)
    : formatNumber(totalPayments);

  return (
    <Card className="flex flex-col gap-6 border-0 bg-white p-6 rounded-3xl h-[400px] w-full relative">
      {/* Header with timestamp and total */}
      <div className="flex items-center justify-end gap-2 text-sm text-neutral-700">
        <span>{displayLabel},</span>
        <span className="font-bold">{displayPayments} {t("metrics.chart.total_payments")}</span>
      </div>

      {/* Chart Area */}
      <div className="flex-1 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
            onMouseLeave={handleMouseLeave}
          >
            <defs>
              <linearGradient id="colorPayments" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="oklch(.7477 .0802 186.37)" stopOpacity={1} />
                <stop offset="100%" stopColor="oklch(.7477 .0802 186.37)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
            <XAxis
              dataKey="label"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "oklch(.3758 .0275 256.82)", fontSize: 12, dy: 20 }}
              height={40}
              padding={{ left: 0, right: 0 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "oklch(.3758 .0275 256.82)", fontSize: 12, textAnchor: "start", dx: 0 }}
              ticks={[0, 1167, 2333, 3500]}
              domain={[0, 3500]}
              tickFormatter={formatNumber}
              width={25}
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{
                stroke: "oklch(.3758 .0275 256.82)",
                strokeWidth: 1,
                strokeDasharray: "3 3",
              }}
            />
            <Area
              type="monotone"
              dataKey="payments"
              stroke="oklch(.7477 .0802 186.37)"
              strokeWidth={2}
              fill="url(#colorPayments)"
              dot={false}
              activeDot={<CustomActiveDot />}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
