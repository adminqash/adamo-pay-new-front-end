export const ALPHA2_TO_ALPHA3: Record<string, string> = {
  CO: "COL",
  AR: "ARG",
  BR: "BRA",
  MX: "MEX",
};

export const ALPHA3_TO_ALPHA2: Record<string, string> = {
  COL: "CO",
  ARG: "AR",
  BRA: "BR",
  MEX: "MX",
};

export const DEFAULT_COUNTRY_CODE_ALPHA3 = "COL";

export const COUNTRY_CODE_STORAGE_KEY = "countryCode";

export function getStoredCountryCodeAlpha3(): string {
  return localStorage.getItem(COUNTRY_CODE_STORAGE_KEY) || DEFAULT_COUNTRY_CODE_ALPHA3;
}
