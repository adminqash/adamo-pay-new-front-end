import type { RiskBand } from "@/features/compliance/application/entities/compliance-case.entity";
import { cn } from "@adamosuiteservices/ui/lib";

type RiskMeterProps = {
  band: RiskBand
  label: string
};

export function RiskMeter({ band, label }: RiskMeterProps) {
  const filled = band === "high" ? 3 : band === "medium" ? 2 : 1;
  const segments = band === "high" ? 4 : 3;

  return (
    <div className="flex items-center gap-3">
      <div className="flex w-[100px] gap-1 rounded-2xl bg-neutrals-50 p-1">
        {Array.from({ length: segments }).map((_, index) => (
          <div
            key={index}
            className={cn(
              "h-2 flex-1 rounded-full border border-neutrals-200",
              index < filled
                ? band === "high"
                  ? "bg-destructive"
                  : band === "medium"
                    ? "bg-warning"
                    : "bg-success"
                : "bg-white",
            )}
          />
        ))}
      </div>
      <p className="text-sm font-semibold text-neutrals-900">{label}</p>
    </div>
  );
}
