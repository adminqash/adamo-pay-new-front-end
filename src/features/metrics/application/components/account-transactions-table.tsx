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

interface AccountTransactionsTableProps {
  _filterPeriod?: string
  accounts?: Array<{
    rank: number
    name: string
    transactions: number
    amount: string
  }>
}

export function AccountTransactionsTable({
  accounts = [],
}: AccountTransactionsTableProps = {}) {
  const { t } = useTranslation("metrics");
  return (
    <Card className={`
      basis-full rounded-3xl border-0 bg-neutral-50 p-4
      md:p-6
    `}
    >
      <div className="flex flex-col gap-6">
        <p className="text-sm text-neutral-700">
          {t("metrics.recurring_beneficiaries_table.title")}
        </p>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("metrics.recurring_beneficiaries_table.rank")}</TableHead>
              <TableHead>{t("metrics.recurring_beneficiaries_table.beneficiary")}</TableHead>
              <TableHead className="text-right">{t("metrics.recurring_beneficiaries_table.transactions")}</TableHead>
              <TableHead className="text-right">{t("metrics.recurring_beneficiaries_table.amount")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {accounts.map((account) => (
              <TableRow key={account.rank} className="bg-white">
                <TableCell className="font-medium">{account.rank}</TableCell>
                <TableCell>{account.name}</TableCell>
                <TableCell className="text-right">{account.transactions.toLocaleString()}</TableCell>
                <TableCell className="text-right">{account.amount}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}
