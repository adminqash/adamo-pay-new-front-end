import type { ReactNode } from "react";

interface CountryFlagProps {
  countryCode: string;
  className?: string;
}

export function CountryFlag({ countryCode, className = "" }: CountryFlagProps) {
  const flagConfig: Record<string, ReactNode> = {
    CO: (
      <>
        <div className="h-1/2 bg-[#FCD116]" />
        <div className="h-1/4 bg-[#003893]" />
        <div className="h-1/4 bg-[#CE1126]" />
      </>
    ),
    AR: (
      <>
        <div className="h-1/3 bg-[#74ACDF]" />
        <div className="h-1/3 bg-white" />
        <div className="h-1/3 bg-[#74ACDF]" />
      </>
    ),
    MX: (
      <>
        <div className="h-full w-1/3 bg-[#006847]" />
        <div className="h-full w-1/3 bg-white" />
        <div className="h-full w-1/3 bg-[#CE1126]" />
      </>
    ),
    BR: (
      <>
        <div className="h-full w-full bg-[#009739]" />
      </>
    ),
  };

  const flag = flagConfig[countryCode.toUpperCase()];

  if (!flag) {
    return (
      <div className={`w-6 h-6 rounded-full overflow-hidden flex items-center justify-center bg-gray-100 ${className}`}>
        <span className="text-xs font-bold">{countryCode}</span>
      </div>
    );
  }

  return (
    <div className={`w-6 h-6 rounded-full overflow-hidden flex ${countryCode === 'MX' ? 'flex-row' : 'flex-col'} ${className}`}>
      {flag}
    </div>
  );
}
