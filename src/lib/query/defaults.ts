import { keepPreviousData } from "@tanstack/react-query";

export const queryDefaults = {
  staleTime: 30_000,
  gcTime: 5 * 60_000,
  retry: 1,
} as const;

export const listQueryDefaults = {
  ...queryDefaults,
  placeholderData: keepPreviousData,
} as const;
