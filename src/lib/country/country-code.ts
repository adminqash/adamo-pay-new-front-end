/**
 * Country / currency helpers for the Pay v2 frontend.
 * Mirrors backend `http/country-currency.ts` (no shared package yet).
 */

export const ALPHA2_TO_ALPHA3: Record<string, string> = {
  CO: "COL",
  AR: "ARG",
  BR: "BRA",
  MX: "MEX",
  PE: "PER",
  CL: "CHL",
};

export const ALPHA3_TO_ALPHA2: Record<string, string> = {
  COL: "CO",
  ARG: "AR",
  BRA: "BR",
  MEX: "MX",
  PER: "PE",
  CHL: "CL",
};

/** Alpha-3 → ISO 4217 lowercase (same map as core/beneficiaries/analytics/realtime). */
export const COUNTRY_CURRENCY: Record<string, string> = {
  COL: "cop",
  ARG: "ars",
  PER: "pen",
  MEX: "mxn",
  BRA: "brl",
  CHL: "clp",
};

export const COUNTRY_LOCALE: Record<string, string> = {
  COL: "es-CO",
  ARG: "es-AR",
  BRA: "pt-BR",
  MEX: "es-MX",
  PER: "es-PE",
  CHL: "es-CL",
};

export const DEFAULT_COUNTRY_CODE_ALPHA3 = "COL";
export const DEFAULT_COUNTRY_CODE_ALPHA2 = "CO";
export const DEFAULT_CURRENCY = "cop";
export const DEFAULT_LOCALE = "es-CO";

export const COUNTRY_CODE_STORAGE_KEY = "countryCode";

export const SELECTABLE_COUNTRIES: Array<{ alpha2: string, alpha3: string, name: string }> = [
  { alpha2: "AR", alpha3: "ARG", name: "Argentina" },
  { alpha2: "BR", alpha3: "BRA", name: "Brasil" },
  { alpha2: "CL", alpha3: "CHL", name: "Chile" },
  { alpha2: "CO", alpha3: "COL", name: "Colombia" },
  { alpha2: "MX", alpha3: "MEX", name: "México" },
  { alpha2: "PE", alpha3: "PER", name: "Perú" },
];

export function normalizeCountryCodeAlpha3(value?: string | null): string {
  if (!value) {
    return DEFAULT_COUNTRY_CODE_ALPHA3;
  }

  const normalized = value.trim().toUpperCase();
  if (normalized === "CHI") {
    return "CHL";
  }
  if (ALPHA2_TO_ALPHA3[normalized]) {
    return ALPHA2_TO_ALPHA3[normalized];
  }
  if (COUNTRY_CURRENCY[normalized] || ALPHA3_TO_ALPHA2[normalized]) {
    return normalized;
  }

  return DEFAULT_COUNTRY_CODE_ALPHA3;
}

export function toCountryCodeAlpha2(value?: string | null): string {
  const alpha3 = normalizeCountryCodeAlpha3(value);
  return ALPHA3_TO_ALPHA2[alpha3] ?? DEFAULT_COUNTRY_CODE_ALPHA2;
}

export function getStoredCountryCodeAlpha3(): string {
  return normalizeCountryCodeAlpha3(localStorage.getItem(COUNTRY_CODE_STORAGE_KEY));
}

export function setStoredCountryCodeAlpha3(countryCode: string): string {
  const alpha3 = normalizeCountryCodeAlpha3(countryCode);
  localStorage.setItem(COUNTRY_CODE_STORAGE_KEY, alpha3);
  return alpha3;
}

export function getCurrencyForCountry(countryCode?: string | null): string {
  const alpha3 = normalizeCountryCodeAlpha3(countryCode);
  return COUNTRY_CURRENCY[alpha3] ?? DEFAULT_CURRENCY;
}

export function getCurrencyUpperForCountry(countryCode?: string | null): string {
  return getCurrencyForCountry(countryCode).toUpperCase();
}

export function getLocaleForCountry(countryCode?: string | null): string {
  const alpha3 = normalizeCountryCodeAlpha3(countryCode);
  return COUNTRY_LOCALE[alpha3] ?? DEFAULT_LOCALE;
}

/** Append country scope to a React Query key so caches never collide across countries. */
export function withCountryScope<T extends readonly unknown[]>(
  key: T,
  countryCode: string = getStoredCountryCodeAlpha3(),
): [...T, string] {
  return [...key, normalizeCountryCodeAlpha3(countryCode)];
}

/**
 * When the user switches country while viewing a country-scoped detail route,
 * send them back to the section list so we don't keep a foreign id on screen.
 */
export function getCountrySwitchRedirect(pathname: string): string | null {
  if (/^\/accounts\/[^/]+/.test(pathname)) {
    return "/accounts";
  }
  if (/^\/beneficiaries\/[^/]+/.test(pathname)) {
    return "/beneficiaries";
  }
  if (/^\/transactions\/correct\/[^/]+/.test(pathname)) {
    return "/transactions";
  }
  if (/^\/batches\/[^/]+/.test(pathname) && !pathname.startsWith("/batches/create")) {
    return "/batches";
  }
  return null;
}
