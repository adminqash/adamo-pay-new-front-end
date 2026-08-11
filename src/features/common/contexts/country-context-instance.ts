import { createContext } from "react";

export type CountryContextValue = {
  /** ISO 3166-1 alpha-2 (UI / flags): CO, MX, … */
  countryCodeAlpha2: string
  /** ISO 3166-1 alpha-3 (API query/body): COL, MEX, … */
  countryCode: string
  /** ISO 4217 lowercase (API body): cop, mxn, … */
  currency: string
  /** ISO 4217 uppercase (display): COP, MXN, … */
  currencyUpper: string
  /** BCP 47 locale for money formatting */
  locale: string
  /**
   * Persist a new country (alpha-2), clear country-scoped React Query cache,
   * and return whether the country actually changed.
   */
  setCountry: (alpha2: string) => boolean
};

export const CountryContext = createContext<CountryContextValue | null>(null);
