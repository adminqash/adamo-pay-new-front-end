import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { useAccess } from "@/features/auth/application/contexts/access.context";
import { CountryContext } from "@/features/common/contexts/country-context-instance";
import {
  ALPHA2_TO_ALPHA3,
  ALPHA3_TO_ALPHA2,
  getCurrencyForCountry,
  getCurrencyUpperForCountry,
  getLocaleForCountry,
  getStoredCountryCodeAlpha3,
  SELECTABLE_COUNTRIES,
  setStoredCountryCodeAlpha3,
  toCountryCodeAlpha2,
} from "@/lib/country/country-code";

function readInitialAlpha2(): string {
  return ALPHA3_TO_ALPHA2[getStoredCountryCodeAlpha3()] ?? "CO";
}

export function CountryProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const { allowedCountries, operatingCountries, capabilities, isLoading } = useAccess();
  const [countryCodeAlpha2, setCountryCodeAlpha2] = useState(readInitialAlpha2);

  const selectableCountries = useMemo(() => {
    if (isLoading) {
      return [];
    }
    const catalog = operatingCountries;
    if (catalog.length === 0) {
      return [];
    }
    const byOrganization = SELECTABLE_COUNTRIES.filter((country) =>
      catalog.includes(country.alpha3),
    );
    if (capabilities.countryScope !== "assigned") {
      return byOrganization;
    }
    if (allowedCountries.length === 0) {
      return [];
    }
    return byOrganization.filter((country) =>
      allowedCountries.includes(country.alpha3),
    );
  }, [allowedCountries, capabilities.countryScope, isLoading, operatingCountries]);

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

    queryClient.removeQueries({
      predicate: (query) => query.queryKey[0] !== "auth",
    });

    return true;
  }, [countryCodeAlpha2, queryClient]);

  useEffect(() => {
    if (selectableCountries.length === 0) {
      return;
    }
    const isAllowed = selectableCountries.some(
      (country) => country.alpha2 === countryCodeAlpha2,
    );
    if (!isAllowed) {
      setCountry(selectableCountries[0].alpha2);
    }
  }, [countryCodeAlpha2, selectableCountries, setCountry]);

  const value = useMemo(
    () => ({
      countryCodeAlpha2,
      countryCode,
      currency,
      currencyUpper,
      locale,
      selectableCountries,
      setCountry,
    }),
    [countryCode, countryCodeAlpha2, currency, currencyUpper, locale, selectableCountries, setCountry],
  );

  return (
    <CountryContext.Provider value={value}>
      {children}
    </CountryContext.Provider>
  );
}
