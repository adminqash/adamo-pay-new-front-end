import { Card } from "@adamosuiteservices/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@adamosuiteservices/ui/table";
import { useTranslation } from "react-i18next";

interface FailureData {
  rank: number;
  beneficiary: string;
  returns: number;
  rejections: number;
}

interface RecurringFailuresTableProps {
  _filterPeriod?: string;
}

export function RecurringFailuresTable({ _filterPeriod = "today" }: RecurringFailuresTableProps = {}) {
  const { t } = useTranslation("metrics");

  // Mock data - replace with actual data from API
  const failures: FailureData[] = [
    { rank: 1, beneficiary: "Juan Pérez García", returns: 45, rejections: 12 },
    { rank: 2, beneficiary: "María González López", returns: 38, rejections: 15 },
    { rank: 3, beneficiary: "Carlos Martínez Ruiz", returns: 32, rejections: 8 },
    { rank: 4, beneficiary: "Ana Rodríguez Sánchez", returns: 28, rejections: 10 },
    { rank: 5, beneficiary: "Luis Fernández Torres", returns: 25, rejections: 9 },
  ];

  return (
    <Card className="bg-neutral-50 border-0 p-4 md:p-6 rounded-3xl basis-full">
      <div className="flex flex-col gap-6">
        <p className="text-sm text-neutral-700">
          {t("metrics.recurring_failures.title")}
        </p>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("metrics.recurring_failures.rank")}</TableHead>
              <TableHead>{t("metrics.recurring_failures.beneficiary")}</TableHead>
              <TableHead className="text-right">{t("metrics.recurring_failures.returns")}</TableHead>
              <TableHead className="text-right">{t("metrics.recurring_failures.rejections")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {failures.map((failure) => (
              <TableRow key={failure.rank} className="bg-white">
                <TableCell className="font-medium">{failure.rank}</TableCell>
                <TableCell>{failure.beneficiary}</TableCell>
                <TableCell className="text-right">{failure.returns}</TableCell>
                <TableCell className="text-right">{failure.rejections}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}
