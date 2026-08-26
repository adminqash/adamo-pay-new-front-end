import { Badge } from "@adamosuiteservices/ui/badge";
import { Card } from "@adamosuiteservices/ui/card";
import { useTranslation } from "react-i18next";

interface BatchStat {
  label: string;
  value: number;
  subtitle: string;
}

interface BatchStatsProps {
  stats?: {
    average: number;
    maximum: number;
    minimum: number;
  };
  _filterPeriod?: string;
}

/**
 * batch stats component
 * 
 * displays batch transaction statistics (average, maximum, minimum)
 */
export function BatchStats({ stats, _filterPeriod = "today" }: BatchStatsProps) {
  const { t } = useTranslation("metrics");

  const defaultStats: BatchStat[] = [
    {
      label: t("metrics.batch_stats.average"),
      value: 0,
      subtitle: t("metrics.batch_stats.transactions"),
    },
    {
      label: t("metrics.batch_stats.maximum"),
      value: 0,
      subtitle: t("metrics.batch_stats.transactions"),
    },
    {
      label: t("metrics.batch_stats.minimum"),
      value: 0,
      subtitle: t("metrics.batch_stats.transactions"),
    },
  ];

  const displayStats = stats
    ? [
        {
          label: t("metrics.batch_stats.average"),
          value: stats.average,
          subtitle: t("metrics.batch_stats.transactions"),
        },
        {
          label: t("metrics.batch_stats.maximum"),
          value: stats.maximum,
          subtitle: t("metrics.batch_stats.transactions"),
        },
        {
          label: t("metrics.batch_stats.minimum"),
          value: stats.minimum,
          subtitle: t("metrics.batch_stats.transactions"),
        },
      ]
    : defaultStats;

  return (
    <Card className="flex flex-col gap-6 border-0 bg-muted p-6 rounded-3xl w-full">
      <p className="text-sm text-foreground">
        {t("metrics.batch_stats.title")}
      </p>
      <div className="bg-background flex flex-wrap gap-2 p-4 rounded-3xl w-full">
        {displayStats.map((stat) => (
          <div
            key={stat.label}
            className="bg-muted flex flex-col flex-[1_0_0] min-w-[180px] p-4 rounded-2xl"
          >
            <div className="flex h-16 items-center w-full">
              <div className="flex flex-col gap-2 w-full">
                <p className="text-xs font-semibold text-foreground">
                  {stat.label}
                </p>
                <div className="flex items-center gap-2 h-10 pl-2">
                  <Badge className="h-8 px-2 rounded-xl bg-sky-50 text-sky-700">
                    {stat.value.toLocaleString()}
                  </Badge>
                  <p className="text-xs text-foreground-secondary">{stat.subtitle}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
