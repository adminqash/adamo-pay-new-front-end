import { useContext } from "react";
import { CountryContext, type CountryContextValue } from "@/features/common/contexts/country-context-instance";

export function useCountry(): CountryContextValue {
  const context = useContext(CountryContext);
  if (!context) {
    throw new Error("useCountry must be used within CountryProvider");
  }
  return context;
}
