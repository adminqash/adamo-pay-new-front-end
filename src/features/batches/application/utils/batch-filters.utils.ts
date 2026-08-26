import type { DateRange } from "react-day-picker";
import type { ListQueryParams } from "@/lib/api/api.types";
import { formatApiDate } from "@/lib/utils/date.utils";

type BuildBatchListFiltersInput = {
  dateRange: DateRange
  statusFilter: string[]
  search: string
};

type BuildBatchTransactionFiltersInput = {
  statusFilter: string[]
  search: string
};

const BATCH_STATUS_GROUPS: Record<string, string[]> = {
  pending: ["pending"],
  processing: ["processing"],
  completed: ["completed", "cancelled", "failed"],
};

const TRANSACTION_TO_BATCH_ITEM_STATUS: Record<string, string[]> = {
  pending: ["pending"],
  reviewed: ["valid"],
  "for-review": ["client-review"],
  "waiting-for-resolution": ["review"],
  "in-review": ["client-review", "review"],
  in_review: ["client-review", "review"],
  validated: ["processing"],
  paid: ["paid"],
  returned: ["returned"],
  rejected: ["rejected", "invalid"],
};

export function buildBatchListParams({
  dateRange,
  statusFilter,
  search,
}: BuildBatchListFiltersInput): ListQueryParams {
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

  const statuses = statusFilter
    .filter((status) => status !== "all")
    .flatMap((status) => BATCH_STATUS_GROUPS[status] ?? [status]);

  const uniqueStatuses = [...new Set(statuses)];
  if (uniqueStatuses.length === 1) {
    params.status = uniqueStatuses[0];
  } else if (uniqueStatuses.length > 1) {
    params.status = uniqueStatuses.join(",");
  }

  const trimmedSearch = search.trim();
  if (trimmedSearch) {
    params.search = trimmedSearch;
  }

  return params;
}

export function buildBatchTransactionListParams({
  statusFilter,
  search,
  page = 1,
  limit = 15,
}: BuildBatchTransactionFiltersInput & {
  page?: number
  limit?: number
}): ListQueryParams {
  const params: ListQueryParams = { page, limit };

  const statuses = statusFilter
    .filter((status) => status !== "all")
    .flatMap((status) => TRANSACTION_TO_BATCH_ITEM_STATUS[status] ?? [status]);

  const uniqueStatuses = [...new Set(statuses)];
  if (uniqueStatuses.length === 1) {
    params.status = uniqueStatuses[0];
  } else if (uniqueStatuses.length > 1) {
    params.status = uniqueStatuses.join(",");
  }

  const trimmedSearch = search.trim();
  if (trimmedSearch) {
    params.search = trimmedSearch;
  }

  return params;
}
