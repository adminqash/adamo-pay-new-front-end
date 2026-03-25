import { Card } from "@adamosuiteservices/ui/card";
import { Icon } from "@adamosuiteservices/ui/icon";
import { CountryFlag } from "@/features/common/components/flags/country-flag";
import { useTranslation } from "react-i18next";

type MetricVariation = {
  value: number;
  trend: "up" | "down";
};

interface MetricCardProps {
  title: string;
  value: string;
  icon: "flag" | "swap_horiz" | "confirmation_number" | "paid";
  countryCode?: string;
  variation?: MetricVariation;
  background?: "neutral" | "primary";
}

/**
 * metric card component
 * 
 * displays a metric with an icon, value, and optional variation indicator
 */
export function MetricCard({
  title,
  value,
  icon,
  countryCode,
  variation,
  background = "primary",
}: MetricCardProps) {
  const { t } = useTranslation("metrics");
  const bgColor = background === "neutral" ? "bg-muted" : "bg-primary-25";

  return (
    <Card className={`flex flex-1 min-w-[200px] items-start p-6 border-0 rounded-3xl ${bgColor}`}>
      <div className="flex flex-1 flex-col gap-8">
        {/* Title and Value */}
        <div className="flex flex-col gap-4">
          <p className="text-sm font-bold text-foreground">{title}</p>
          
          {/* Icon + Value Container */}
          <div className="flex items-center gap-3 h-14 px-4 py-4 bg-background rounded-full">
            {icon === "flag" && countryCode ? (
              <CountryFlag countryCode={countryCode} className="size-6" />
            ) : (
              <Icon
                symbol={icon}
                className="text-2xl text-foreground"
              />
            )}
            <p className="text-sm font-bold text-foreground">{value}</p>
          </div>
        </div>

        {/* Variation Indicator */}
        {variation && (
          <div className="flex items-center gap-2 h-6">
            <Icon
              symbol={variation.trend === "up" ? "arrow_drop_up" : "arrow_drop_down"}
              className={`text-2xl ${
                variation.trend === "up" ? "text-success-600" : "text-error-600"
              }`}
            />
            <p
              className={`text-sm ${
                variation.trend === "up" ? "text-success-600" : "text-error-600"
              }`}
            >
              {variation.value}% {t("metrics.cards.previous_period")}
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}
