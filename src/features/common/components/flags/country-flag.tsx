import arFlag from "@/assets/flags/ar.png";
import brFlag from "@/assets/flags/br.png";
import coFlag from "@/assets/flags/co.png";
import mxFlag from "@/assets/flags/mx.png";

interface CountryFlagProps {
  countryCode: string;
  className?: string;
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
      <div className={`rounded-full overflow-hidden flex items-center justify-center bg-gray-100 ${className || 'w-6 h-6'}`}>
        <span className="text-xs font-bold">{countryCode}</span>
      </div>
    );
  }

  return (
    <img 
      src={flagSrc} 
      alt={`${countryCode} flag`}
      className={`rounded-full object-cover ${className || 'w-6 h-6'}`}
    />
  );
}
