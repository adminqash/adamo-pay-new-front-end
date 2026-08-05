import { format, parseISO, isValid } from "date-fns";

/**
 * Business calendar timezone for Adamo Pay.
 * America/Bogota (Colombia) — same UTC-5 as Lima; no DST.
 * All dateFrom/dateTo query params are calendar days in this zone.
 */
export const BUSINESS_TIMEZONE = "America/Bogota";

export function formatDisplayDate(value: string | Date | undefined | null): string {
  if (!value) return "";

  const date = value instanceof Date ? value : parseISO(value);

  if (!isValid(date)) {
    return typeof value === "string" ? value : "";
  }

  return format(date, "dd/MM/yyyy");
}

/** Format a Date as YYYY-MM-DD in the business timezone (not browser local). */
export function formatApiDate(value: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: BUSINESS_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(value);
}

/**
 * Calendar "today" in business TZ as a local Date at local midnight.
 * Safe for date pickers / date-fns startOfDay comparisons.
 */
export function businessTodayAsLocalDate(now = new Date()): Date {
  const [year, month, day] = formatApiDate(now).split("-").map(Number);
  return new Date(year, month - 1, day);
}
