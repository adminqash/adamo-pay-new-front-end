import { format, parseISO, isValid } from "date-fns";

export function formatDisplayDate(value: string | Date | undefined | null): string {
  if (!value) return "";

  const date = value instanceof Date ? value : parseISO(value);

  if (!isValid(date)) {
    return typeof value === "string" ? value : "";
  }

  return format(date, "dd/MM/yyyy");
}

export function formatApiDate(value: Date): string {
  return format(value, "yyyy-MM-dd");
}
