import arFlag from "@/assets/flags/AR.png";
import brFlag from "@/assets/flags/BR.png";
import coFlag from "@/assets/flags/CO.png";
import mxFlag from "@/assets/flags/MX.png";

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

  const flagSrc = flagConfig[countryCode.toUpperCase()];

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
