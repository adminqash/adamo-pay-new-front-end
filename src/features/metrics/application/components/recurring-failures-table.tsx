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
  rank: number
  beneficiary: string
  returns: number
  rejections: number
}

interface RecurringFailuresTableProps {
  _filterPeriod?: string
  failures?: FailureData[]
}

export function RecurringFailuresTable({
  failures = [],
}: RecurringFailuresTableProps = {}) {
  const { t } = useTranslation("metrics");
  return (
    <Card className={`
      basis-full rounded-3xl border-0 bg-neutral-50 p-4
      md:p-6
    `}
    >
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
