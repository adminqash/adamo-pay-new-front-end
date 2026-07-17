import type { ListQueryParams } from "@/lib/api/api.types";

type BuildBeneficiaryListParamsInput = {
  tab: string
  search: string
  page?: number
  limit?: number
};

type BuildBeneficiaryTransactionParamsInput = {
  search: string
  page?: number
  limit?: number
};

const TAB_TO_NEWS_FILTER: Record<string, "with_news" | "without_news" | undefined> = {
  all: undefined,
  "with-news": "with_news",
  "without-news": "without_news",
};

export function buildBeneficiaryListParams({
  tab,
  search,
  page = 1,
  limit = 15,
}: BuildBeneficiaryListParamsInput): ListQueryParams {
  const params: ListQueryParams = { page, limit };

  const newsFilter = TAB_TO_NEWS_FILTER[tab];
  if (newsFilter) {
    params.newsFilter = newsFilter;
  }

  const trimmedSearch = search.trim();
  if (trimmedSearch) {
    params.search = trimmedSearch;
  }

  return params;
}

export function buildBeneficiaryTransactionListParams({
  search,
  page = 1,
  limit = 15,
}: BuildBeneficiaryTransactionParamsInput): ListQueryParams {
  const params: ListQueryParams = { page, limit };

  const trimmedSearch = search.trim();
  if (trimmedSearch) {
    params.search = trimmedSearch;
  }

  return params;
}
