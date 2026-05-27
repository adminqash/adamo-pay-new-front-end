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

interface RecurringBeneficiary {
  rank: number;
  beneficiary: string;
  transactions: number;
  amount: number;
}

interface AccountTransactionsTableProps {
  _filterPeriod?: string;
}

export function AccountTransactionsTable({ _filterPeriod = "today" }: AccountTransactionsTableProps = {}) {
  const { t } = useTranslation("metrics");

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Mock data - replace with actual data from API
  const beneficiaries: RecurringBeneficiary[] = [
    { rank: 1, beneficiary: "Juan Pérez García", transactions: 487, amount: 45300000 },
    { rank: 2, beneficiary: "María González López", transactions: 532, amount: 68700000 },
    { rank: 3, beneficiary: "Carlos Martínez Ruiz", transactions: 423, amount: 38900000 },
    { rank: 4, beneficiary: "Ana Rodríguez Sánchez", transactions: 356, amount: 29400000 },
    { rank: 5, beneficiary: "Luis Fernández Torres", transactions: 298, amount: 24100000 },
  ];

  return (
    <Card className="bg-neutral-50 border-0 p-4 md:p-6 rounded-3xl basis-full">
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
            {beneficiaries.map((beneficiary) => (
              <TableRow key={beneficiary.rank} className="bg-white">
                <TableCell className="font-medium">{beneficiary.rank}</TableCell>
                <TableCell>{beneficiary.beneficiary}</TableCell>
                <TableCell className="text-right">{beneficiary.transactions.toLocaleString()}</TableCell>
                <TableCell className="text-right">{formatCurrency(beneficiary.amount)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}
