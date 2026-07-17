import type { DateRange } from "react-day-picker";
import type { ListQueryParams } from "@/lib/api/api.types";
import { formatApiDate } from "@/lib/utils/date.utils";

type BuildTransactionFiltersInput = {
  dateRange: DateRange
  statusFilter: string[]
  accountFilter: string[]
  search: string
};

export function buildTransactionListParams({
  dateRange,
  statusFilter,
  accountFilter,
  search,
}: BuildTransactionFiltersInput): ListQueryParams {
  const params: ListQueryParams = {
    page: 1,
    limit: 20,
  };

  if (dateRange.from) {
    params.dateFrom = formatApiDate(dateRange.from);
  }

  if (dateRange.to) {
    params.dateTo = formatApiDate(dateRange.to);
  }

  const statuses = statusFilter.filter((status) => status !== "all");
  if (statuses.length === 1) {
    params.status = statuses[0];
  } else if (statuses.length > 1) {
    params.status = statuses.join(",");
  }

  const accountIds = accountFilter.filter((account) => account !== "all");

  if (accountIds.length === 1) {
    params.sourceAccountId = accountIds[0];
  } else if (accountIds.length > 1) {
    params.sourceAccountId = accountIds.join(",");
  }

  const trimmedSearch = search.trim();
  if (trimmedSearch) {
    params.search = trimmedSearch;
  }

  return params;
}
