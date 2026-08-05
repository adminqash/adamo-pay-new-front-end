import arFlag from "@/assets/flags/AR.png";
import brFlag from "@/assets/flags/BR.png";
import coFlag from "@/assets/flags/CO.png";
import mxFlag from "@/assets/flags/MX.png";
import { ALPHA3_TO_ALPHA2 } from "@/lib/country/country-code";

interface CountryFlagProps {
  countryCode: string
  className?: string
}

export function CountryFlag({ countryCode, className = "" }: CountryFlagProps) {
  const flagConfig: Record<string, string> = {
    CO: coFlag,
    AR: arFlag,
    MX: mxFlag,
    BR: brFlag,
  };

  // Accepts both alpha-2 ("CO") and alpha-3 ("COL") — the backend deals in
  // alpha-3, but the flag assets/config here are keyed by alpha-2.
  const normalized = countryCode.toUpperCase();
  const flagSrc = flagConfig[ALPHA3_TO_ALPHA2[normalized] ?? normalized];

  if (!flagSrc) {
    return (
      <div className={`
        flex items-center justify-center overflow-hidden rounded-full
        bg-gray-100
        ${className || "h-6 w-6"}
      `}
      >
        <span className="text-xs font-bold">{countryCode}</span>
      </div>
    );
  }

  return (
    <img
      src={flagSrc}
      alt={`${countryCode} flag`}
      className={`
        rounded-full object-cover
        ${className || "h-6 w-6"}
      `}
    />
  );
}
