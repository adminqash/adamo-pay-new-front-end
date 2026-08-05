import type { MetricsQueryParams } from "@/lib/api/api.types";
import type { DateRange } from "react-day-picker";
import { formatApiDate } from "@/lib/utils/date.utils";

type BuildMetricsParamsInput = {
  filterTab: string
  customDateRange: DateRange
};

export function buildMetricsParams({
  filterTab,
  customDateRange,
}: BuildMetricsParamsInput): MetricsQueryParams {
  if (customDateRange.from && customDateRange.to) {
    return {
      from: formatApiDate(customDateRange.from),
      to: formatApiDate(customDateRange.to),
      period: "custom",
    };
  }

  if (filterTab === "today" || filterTab === "this_week" || filterTab === "this_month") {
    return { period: filterTab };
  }

  return { period: "this_month" };
}
