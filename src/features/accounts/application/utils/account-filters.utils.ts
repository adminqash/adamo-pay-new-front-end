import type { ListQueryParams } from "@/lib/api/api.types";
import type { DateRange } from "react-day-picker";
import { formatApiDate } from "@/lib/utils/date.utils";

type BuildAccountMovementListParamsInput = {
  page?: number
  limit?: number
  dateRange?: DateRange
  typeFilter?: string
  search?: string
};

export function buildAccountMovementListParams({
  page = 1,
  limit = 15,
  dateRange,
  typeFilter = "all",
  search,
}: BuildAccountMovementListParamsInput): ListQueryParams {
  const params: ListQueryParams = { page, limit };

  if (dateRange?.from) {
    params.dateFrom = formatApiDate(dateRange.from);
  }

  if (dateRange?.to) {
    params.dateTo = formatApiDate(dateRange.to);
  }

  if (typeFilter && typeFilter !== "all") {
    params.type = typeFilter;
  }

  const trimmedSearch = search?.trim();
  if (trimmedSearch) {
    params.search = trimmedSearch;
  }

  return params;
}

type BuildAccountListParamsInput = {
  page?: number
  limit?: number
  search?: string
};

export function buildAccountListParams({
  page = 1,
  limit = 100,
  search,
}: BuildAccountListParamsInput = {}): ListQueryParams {
  const params: ListQueryParams = { page, limit };
  const trimmedSearch = search?.trim();

  if (trimmedSearch) {
    params.search = trimmedSearch;
  }

  return params;
}
