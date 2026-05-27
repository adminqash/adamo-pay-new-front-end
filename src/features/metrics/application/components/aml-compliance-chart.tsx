import { Card } from "@adamosuiteservices/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { useTranslation } from "react-i18next";

interface ValidationData {
  name: string;
  value: number;
  color: string;
}

interface AmlComplianceChartProps {
  totalValidations?: number;
  _filterPeriod?: string;
}

/**
 * aml compliance chart component
 * 
 * displays a donut chart showing AML compliance validation results
 */
export function AmlComplianceChart({
  totalValidations = 29816,
  _filterPeriod = "today",
}: AmlComplianceChartProps) {
  const { t } = useTranslation("metrics");

  // Mock data - will be replaced with real data later
  const data: ValidationData[] = [
    { name: t("metrics.aml_compliance.status.no_issues"), value: 20816, color: "#10b981" }, // success-500
    { name: t("metrics.aml_compliance.status.with_issues"), value: 9000, color: "#f59e0b" }, // warning-500
  ];

  // Custom tooltip for pie chart
  const CustomPieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const { value, name } = payload[0];
      const percentage = ((value / totalValidations) * 100).toFixed(0);
      return (
        <div className="bg-background shadow-[0px_2px_6px_0px_rgba(0,0,0,0.08)] rounded-full px-4 py-4 h-14 flex items-center">
          <p className="text-sm text-foreground whitespace-nowrap">
            {value.toLocaleString()} {name} | {percentage}%
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
            {totalValidations.toLocaleString()}
          </p>
          <p className="text-sm text-foreground">
            {t("metrics.aml_compliance.total_validations")}
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
