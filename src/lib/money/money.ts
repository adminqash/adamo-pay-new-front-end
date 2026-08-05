/**
 * Adamo Pay money — CANONICAL util (mirror of backend `domain/money.ts`).
 *
 * Contract:
 * - API request/response amounts: integer minor units (e.g. 10090).
 * - UI display / inputs: major string (e.g. "100.90").
 * - Never use parseFloat for money.
 *
 * 10090 ↔ "100.90" (scale = 2)
 */

export type MinorAmount = number;

export const MONEY_SCALE = 2;
export const MONEY_FACTOR = 10 ** MONEY_SCALE;

const MAX_MINOR = Number.MAX_SAFE_INTEGER;

type AssertOptions = { allowZero?: boolean, allowNegative?: boolean };

function fail(message: string): never {
  throw new Error(message);
}

export function assertMinorAmount(
  value: unknown,
  field = "amount",
  options: AssertOptions = {},
): MinorAmount {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    fail(`${field} must be an integer minor-unit amount`);
  }
  if (!Number.isInteger(value)) {
    fail(`${field} must be an integer (minor units). Floats are not allowed`);
  }
  if (!Number.isSafeInteger(value) || value > MAX_MINOR) {
    fail(`${field} exceeds safe integer range`);
  }
  if (options.allowNegative) return value;
  if (options.allowZero) {
    if (value < 0) fail(`${field} must be >= 0`);
  } else if (value <= 0) {
    fail(`${field} must be a positive integer (minor units)`);
  }
  return value;
}

/** 10090 → "100.90" */
export function minorToMajor(
  minor: unknown,
  scale: number = MONEY_SCALE,
): string {
  const amount = toMinorInt(minor, "amount");
  const factor = 10 ** scale;
  const sign = amount < 0 ? "-" : "";
  const abs = Math.abs(amount);
  const whole = Math.floor(abs / factor);
  const fraction = String(abs % factor).padStart(scale, "0");
  return `${sign}${whole}.${fraction}`;
}

/** "100.90" | "100,90" → 10090 */
export function majorToMinor(
  major: string | number,
  scale: number = MONEY_SCALE,
  field = "amount",
): MinorAmount {
  if (typeof major === "number") {
    fail(
      `${field} major form must be a string (e.g. "100.90"), not a float number`,
    );
  }

  const trimmed = major.trim().replace(/\s/g, "");
  if (!trimmed) fail(`${field} is empty`);

  const normalized = trimmed.replace(",", ".");
  const sign = normalized.startsWith("-") ? -1 : 1;
  const unsigned = normalized.replace(/^-/, "");

  if (!/^\d+(\.\d+)?$/.test(unsigned)) {
    fail(`${field} must look like "100.90"`);
  }

  const [wholePart, fractionPart = ""] = unsigned.split(".");
  if (fractionPart.length > scale) {
    fail(`${field} has more than ${scale} decimal places`);
  }

  const whole = Number(wholePart);
  const fraction = Number(fractionPart.padEnd(scale, "0") || "0");
  const factor = 10 ** scale;
  const minor = sign * (whole * factor + fraction);
  return assertMinorAmount(minor, field, {
    allowZero: true,
    allowNegative: true,
  });
}

export function toMinorInt(value: unknown, field = "amount"): MinorAmount {
  if (value === null || value === undefined) return 0;

  if (typeof value === "number") {
    return assertMinorAmount(value, field, {
      allowZero: true,
      allowNegative: true,
    });
  }

  if (typeof value === "string") {
    const raw = value.trim();
    if (raw.includes(".") || raw.includes(",")) {
      return majorToMinor(raw, MONEY_SCALE, field);
    }
    if (!/^-?\d+$/.test(raw)) {
      fail(`${field} must be an integer minor-unit value`);
    }
    return assertMinorAmount(Number(raw), field, {
      allowZero: true,
      allowNegative: true,
    });
  }

  fail(`${field} has an invalid money type`);
}

/**
 * Format minor units for UI (COP/USD).
 * Builds the major string from integers, then applies currency locale.
 */
export function formatCurrencyDisplay(
  minor: number,
  currency = "COP",
  locale = "es-CO",
): string {
  const amount = toMinorInt(minor, "amount");
  const major = minorToMajor(amount);
  const [whole, fraction = "00"] = major.replace("-", "").split(".");
  const sign = amount < 0 ? "-" : "";
  const wholeFormatted = new Intl.NumberFormat(locale, {
    maximumFractionDigits: 0,
  }).format(Number(whole));

  const numberPart = `${sign}${wholeFormatted},${fraction}`;

  if (currency.toUpperCase() === "COP") {
    return `$\u00A0${numberPart}`;
  }

  return `${currency.toUpperCase()} ${numberPart}`;
}

/**
 * Parse user-typed money (es-CO or plain) → minor integer for API.
 * Examples: "1.500,90" | "1500,90" | "1500.90" | "1500" → minor units
 */
export function parseCurrencyToMinor(value: string): MinorAmount {
  if (!value.trim()) return 0;

  let normalized = value.trim().replace(/[^\d,.-]/g, "");

  // es-CO: thousands '.' and decimal ','
  if (normalized.includes(",") && normalized.includes(".")) {
    normalized = normalized.replace(/\./g, "").replace(",", ".");
  } else if (normalized.includes(",")) {
    normalized = normalized.replace(",", ".");
  }

  return majorToMinor(normalized);
}

/** @deprecated Use parseCurrencyToMinor — returns minor units, not major float. */
export function parseCurrencyAmount(value: string): number {
  return parseCurrencyToMinor(value);
}

export function formatCurrencyAmount(
  minor: number,
  currency = "COP",
  locale = "es-CO",
): string {
  return formatCurrencyDisplay(minor, currency, locale);
}
