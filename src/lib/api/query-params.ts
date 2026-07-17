import type { ListQueryParams } from "./api.types";

/**
 * Builds a query params object omitting undefined/null/empty values.
 */
export function buildQueryParams(
  params?: ListQueryParams | Record<string, string | number | boolean | undefined>,
): Record<string, string | number | boolean> {
  if (!params) return {};

  return Object.entries(params).reduce<Record<string, string | number | boolean>>(
    (acc, [key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        acc[key] = value;
      }
      return acc;
    },
    {},
  );
}
