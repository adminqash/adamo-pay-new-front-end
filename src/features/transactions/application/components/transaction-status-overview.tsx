import { Button } from "@adamosuiteservices/ui/button";
import { Card } from "@adamosuiteservices/ui/card";
import { useTranslation } from "react-i18next";

type StatusCounts = {
  pending: number
  returned: number
  rejected: number
  validated: number
  paid: number
};

const CARDS = [
  {
    key: "pending",
    icon: "/icons/pending.png",
    statuses: ["reviewed", "for-review", "waiting-for-resolution"],
    variant: "default" as const,
  },
  {
    key: "returned",
    icon: "/icons/returned.png",
    statuses: ["returned"],
    variant: "default" as const,
  },
  {
    key: "rejected",
    icon: "/icons/rejected.png",
    statuses: ["rejected"],
    variant: "default" as const,
  },
  {
    key: "validated",
    icon: "/icons/validated.png",
    statuses: ["validated"],
    variant: "secondary" as const,
  },
  {
    key: "paid",
    icon: "/icons/paid.png",
    statuses: ["paid"],
    variant: "secondary" as const,
  },
] as const;

type TransactionStatusOverviewProps = Readonly<{
  counts: StatusCounts
  onSelectStatus: (statuses: string[]) => void
}>;

export function TransactionStatusOverview({
  counts,
  onSelectStatus,
}: TransactionStatusOverviewProps) {
  const { t } = useTranslation(["home"]);

  return (
    <div className="flex w-full flex-wrap gap-4">
      {CARDS.map((card) => (
        <Card
          key={card.key}
          className="flex min-w-[240px] flex-1 flex-col gap-8 bg-muted p-6"
        >
          <div className="flex flex-col items-start gap-4">
            <div className={`
              inline-flex h-14 items-center gap-3 rounded-full bg-background
              px-4 py-4
            `}
            >
              <img src={card.icon} alt="" className="size-6" />
              <span className="text-sm font-bold text-foreground">
                {counts[card.key].toLocaleString()}
              </span>
            </div>
            <p className="text-sm leading-5 text-foreground">
              {t(`home:home.transactions.${card.key}.title`)}
            </p>
          </div>
          <Button
            variant={card.variant}
            className="w-fit"
            onClick={() => onSelectStatus([...card.statuses])}
          >
            {t(`home:home.transactions.${card.key}.button`)}
          </Button>
        </Card>
      ))}
    </div>
  );
}
