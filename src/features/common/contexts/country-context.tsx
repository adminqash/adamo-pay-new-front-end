import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo, useState, type ReactNode } from "react";
import { CountryContext } from "@/features/common/contexts/country-context-instance";
import {
  ALPHA2_TO_ALPHA3,
  ALPHA3_TO_ALPHA2,
  getCurrencyForCountry,
  getCurrencyUpperForCountry,
  getLocaleForCountry,
  getStoredCountryCodeAlpha3,
  setStoredCountryCodeAlpha3,
  toCountryCodeAlpha2,
} from "@/lib/country/country-code";

function readInitialAlpha2(): string {
  return ALPHA3_TO_ALPHA2[getStoredCountryCodeAlpha3()] ?? "CO";
}

export function CountryProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [countryCodeAlpha2, setCountryCodeAlpha2] = useState(readInitialAlpha2);

  const countryCode = ALPHA2_TO_ALPHA3[countryCodeAlpha2] ?? getStoredCountryCodeAlpha3();
  const currency = getCurrencyForCountry(countryCode);
  const currencyUpper = getCurrencyUpperForCountry(countryCode);
  const locale = getLocaleForCountry(countryCode);

  const setCountry = useCallback((alpha2: string) => {
    const normalizedAlpha2 = toCountryCodeAlpha2(alpha2);
    if (normalizedAlpha2 === countryCodeAlpha2) {
      return false;
    }

    const alpha3 = setStoredCountryCodeAlpha3(ALPHA2_TO_ALPHA3[normalizedAlpha2] ?? alpha2);
    setCountryCodeAlpha2(toCountryCodeAlpha2(alpha3));

    // Drop every country-scoped cache entry so `keepPreviousData` cannot keep
    // showing the previous country's lists/dashboards after the switch.
    queryClient.removeQueries({
      predicate: (query) => query.queryKey[0] !== "auth",
    });

    return true;
  }, [countryCodeAlpha2, queryClient]);

  const value = useMemo(
    () => ({
      countryCodeAlpha2,
      countryCode,
      currency,
      currencyUpper,
      locale,
      setCountry,
    }),
    [countryCode, countryCodeAlpha2, currency, currencyUpper, locale, setCountry],
  );

  return (
    <CountryContext.Provider value={value}>
      {children}
    </CountryContext.Provider>
  );
}
