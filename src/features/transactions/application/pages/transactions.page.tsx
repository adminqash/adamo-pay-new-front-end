import { useTranslation } from "react-i18next";
import { usePortalContainer } from "@adamosuiteservices/ui/use-portal-container";
import { createPortal } from "react-dom";
import { Link } from "react-router";
import { PageTitle } from "@/features/common/components/layout/page-title";
import { PageContainer } from "@/features/common/components/layout/page-container";
import { useTransactions } from "../hooks/use-transactions";
import { Button } from "@adamosuiteservices/ui/button";
import { Card } from "@adamosuiteservices/ui/card";
import { Icon } from "@adamosuiteservices/ui/icon";
import { Input } from "@adamosuiteservices/ui/input";
import { Badge } from "@adamosuiteservices/ui/badge";
import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@adamosuiteservices/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@adamosuiteservices/ui/select";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter,
  DialogClose,
} from "@adamosuiteservices/ui/dialog";
import { Checkbox } from "@adamosuiteservices/ui/checkbox";
import { Label } from "@adamosuiteservices/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@adamosuiteservices/ui/table";
import type { TransactionStatus } from "../entities/transaction.entity";
import type { Transaction } from "../entities/transaction.entity";
import { useState } from "react";

/**
 * transactions page
 * 
 * displays transactions list
 */
export const TransactionsPage = () => {
  const { t } = useTranslation("transactions");
  const { transactions, totalCount } = useTransactions();

  const sidebarTopBarPortal = usePortalContainer("[data-slot='sidebar-top-bar-portal']");

  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [dateFilter, setDateFilter] = useState("all");
  const [accountFilter, setAccountFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // export dialog state
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [exportDateFilter, setExportDateFilter] = useState("all");
  const [exportStatusFilter, setExportStatusFilter] = useState("all");
  const [exportFormatCSV, setExportFormatCSV] = useState(false);
  const [exportFormatPDF, setExportFormatPDF] = useState(false);

  /**
   * check if any filter is active
   */
  const hasActiveFilters = dateFilter !== "all" || accountFilter !== "all" || statusFilter !== "all";

  /**
   * reset all filters
   */
  const handleResetFilters = () => {
    setDateFilter("all");
    setAccountFilter("all");
    setStatusFilter("all");
  };

  /**
   * handle row click
   */
  const handleRowClick = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsSheetOpen(true);
  };

  /**
   * get badge variant based on transaction status
   */
  const getStatusVariant = (status: TransactionStatus): "default-medium" | "success-medium" | "warning-medium" | "destructive-medium" | "waiting-medium" => {
    switch (status) {
      case "paid":
        return "success-medium";
      case "returned":
        return "warning-medium";
      case "rejected":
        return "destructive-medium";
      case "pending":
      default:
        return "waiting-medium";
    }
  };

  /**
   * format currency amount
   */
  const formatAmount = (amount: number): string => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <>
      {sidebarTopBarPortal && createPortal(
        <PageTitle>{t("transactions.page_title")}</PageTitle>,
        sidebarTopBarPortal,
      )}
      <PageContainer className="bg-neutrals-25">
        <Card className="p-6">
        {/* header section */}
        <div className="flex flex-col gap-6">
          {/* header + search */}
          <div className="flex flex-wrap items-center gap-6">
            {/* title + refresh button */}
            <div className="flex flex-1 items-center gap-4 min-w-[220px]">
              <Button
                variant="secondary"
              >
                <Icon symbol="refresh" weight={200} />
              </Button>
              <p className="text-sm font-semibold text-neutrals-700">
                {t("transactions.header.count", { count: totalCount })}
              </p>
            </div>

            {/* action buttons */}
            <div className="flex items-center gap-4">
              <Button
                variant="default"
                asChild
              >
                <Link to="/transactions/create">
                  {t("transactions.header.new_payment")}
                </Link>
              </Button>
              <Dialog open={isExportDialogOpen} onOpenChange={setIsExportDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    variant="secondary"
                  >
                    {t("transactions.header.export_data")}
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[640px]">
                  <DialogHeader>
                    <DialogTitle>{t("transactions.export_dialog.title")}</DialogTitle>
                    <p className="text-sm text-neutrals-700 mt-2">{t("transactions.export_dialog.description")}</p>
                  </DialogHeader>
                  <DialogBody className="flex flex-col gap-8">
                    {/* filters */}
                    <div className="flex gap-4">
                      {/* date filter */}
                      <div className="flex-1">
                        <Select value={exportDateFilter} onValueChange={setExportDateFilter}>
                          <SelectTrigger className="h-10 w-full">
                            <div className="flex items-center gap-2">
                              <Icon symbol="calendar_today" className="text-neutrals-400" />
                              <span className="text-neutrals-400 text-sm">{t("transactions.export_dialog.date_filter")}</span>
                              <span className="ml-auto text-neutrals-900 text-sm font-normal">
                                {exportDateFilter === "all" ? t("transactions.export_dialog.date_all") : exportDateFilter}
                              </span>
                            </div>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">{t("transactions.export_dialog.date_all")}</SelectItem>
                            <SelectItem value="today">Hoy</SelectItem>
                            <SelectItem value="week">Esta semana</SelectItem>
                            <SelectItem value="month">Este mes</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* status filter */}
                      <div className="flex-1">
                        <Select value={exportStatusFilter} onValueChange={setExportStatusFilter}>
                          <SelectTrigger className="h-10 w-full">
                            <div className="flex items-center gap-2">
                              <Icon symbol="circle" className="text-neutrals-400" />
                              <span className="text-neutrals-400 text-sm">{t("transactions.export_dialog.status_filter")}</span>
                              <span className="ml-auto text-neutrals-900 text-sm font-normal">
                                {exportStatusFilter === "all" ? t("transactions.export_dialog.status_all") : exportStatusFilter}
                              </span>
                            </div>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">{t("transactions.export_dialog.status_all")}</SelectItem>
                            <SelectItem value="paid">{t("transactions.status.paid")}</SelectItem>
                            <SelectItem value="pending">{t("transactions.status.pending")}</SelectItem>
                            <SelectItem value="returned">{t("transactions.status.returned")}</SelectItem>
                            <SelectItem value="rejected">{t("transactions.status.rejected")}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* file type checkboxes */}
                    <div className="flex items-center gap-8">
                      <p className="text-sm text-neutrals-700">{t("transactions.export_dialog.file_type_label")}</p>
                      <div className="flex items-center gap-3">
                        <Checkbox
                          id="csv"
                          checked={exportFormatCSV}
                          onCheckedChange={(checked) => setExportFormatCSV(checked as boolean)}
                        />
                        <Label htmlFor="csv" className="text-sm text-neutrals-700 cursor-pointer">
                          {t("transactions.export_dialog.csv_excel")}
                        </Label>
                      </div>
                      <div className="flex items-center gap-3">
                        <Checkbox
                          id="pdf"
                          checked={exportFormatPDF}
                          onCheckedChange={(checked) => setExportFormatPDF(checked as boolean)}
                        />
                        <Label htmlFor="pdf" className="text-sm text-neutrals-700 cursor-pointer">
                          {t("transactions.export_dialog.pdf")}
                        </Label>
                      </div>
                    </div>
                  </DialogBody>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant="secondary">
                        {t("transactions.export_dialog.cancel")}
                      </Button>
                    </DialogClose>
                    <Button variant="default" disabled>
                      {t("transactions.export_dialog.export")}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {/* search input */}
            <div className="flex-1 min-w-[500px]">
              <div className="relative">
                <Icon
                  symbol="search"
                  className="absolute left-2 top-1/2 -translate-y-1/2 text-neutrals-400"
                />
                <Input
                  placeholder={t("transactions.header.search_placeholder")}
                  className="h-10 pl-10 border-neutrals-100 text-sm"
                />
              </div>
            </div>
          </div>

          {/* filters */}
          <div className="flex flex-wrap items-center gap-6">
            {/* date filter */}
            <div className="flex-1 min-w-[240px]">
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="h-10 border-[#e2e3e5] w-full">
                  <div className="flex items-center gap-2">
                    <Icon symbol="calendar_today" className="text-[#898f99]" />
                    <SelectValue placeholder={t("transactions.filters.date")} />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("transactions.filters.all")}</SelectItem>
                  <SelectItem value="today">Hoy</SelectItem>
                  <SelectItem value="week">Esta semana</SelectItem>
                  <SelectItem value="month">Este mes</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* account filter */}
            <div className="flex-1 min-w-[240px]">
              <Select value={accountFilter} onValueChange={setAccountFilter}>
                <SelectTrigger className="h-10 border-[#e2e3e5] w-full">
                  <div className="flex items-center gap-2">
                    <Icon symbol="account_balance_wallet" className="text-[#898f99]" />
                    <SelectValue placeholder={t("transactions.filters.account")} />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("transactions.filters.all")}</SelectItem>
                  <SelectItem value="account1">Cuenta 1</SelectItem>
                  <SelectItem value="account2">Cuenta 2</SelectItem>
                  <SelectItem value="account3">Cuenta 3</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* status filter */}
            <div className="flex-1 min-w-[240px]">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-10 border-[#e2e3e5] w-full">
                  <div className="flex items-center gap-2">
                    <Icon symbol="circle" className="text-[#898f99]" />
                    <SelectValue placeholder={t("transactions.filters.status")} />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("transactions.filters.all_status")}</SelectItem>
                  <SelectItem value="paid">{t("transactions.status.paid")}</SelectItem>
                  <SelectItem value="pending">{t("transactions.status.pending")}</SelectItem>
                  <SelectItem value="returned">{t("transactions.status.returned")}</SelectItem>
                  <SelectItem value="rejected">{t("transactions.status.rejected")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* reset filters button */}
            {hasActiveFilters && (
              <Button 
                variant="link" 
                onClick={handleResetFilters}
                className="h-10 text-pay-500 shrink-0"
              >
                Restablecer filtros
              </Button>
            )}
          </div>
        </div>

        {/* table */}
        <Table className="rounded-2xl">
          <TableHeader>
              <TableRow>
                <TableHead className="text-xs font-semibold text-neutrals-700 uppercase">
                  {t("transactions.table.date")}
                </TableHead>
                <TableHead className="text-xs font-semibold text-neutrals-700 uppercase">
                  {t("transactions.table.beneficiary")}
                </TableHead>
                <TableHead className="text-xs font-semibold text-neutrals-700 uppercase">
                  {t("transactions.table.id_number")}
                </TableHead>
                <TableHead className="text-xs font-semibold text-neutrals-700 uppercase">
                  {t("transactions.table.amount")}
                </TableHead>
                <TableHead className="text-xs font-semibold text-neutrals-700 uppercase">
                  {t("transactions.table.reference")}
                </TableHead>
                <TableHead className="text-xs font-semibold text-neutrals-700 uppercase">
                  {t("transactions.table.status")}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((transaction) => (
                <TableRow 
                  key={transaction.id}
                  onClick={() => handleRowClick(transaction)}
                  className="cursor-pointer hover:bg-neutrals-25"
                >
                  <TableCell className="text-sm text-neutrals-700">
                    {transaction.date}
                  </TableCell>
                  <TableCell className="text-sm text-neutrals-700">
                    {transaction.beneficiary}
                  </TableCell>
                  <TableCell className="text-sm text-neutrals-700">
                    {transaction.idNumber}
                  </TableCell>
                  <TableCell className="text-sm text-neutrals-700">
                    {formatAmount(transaction.amount)}
                  </TableCell>
                  <TableCell className="text-sm text-neutrals-700">
                    {transaction.reference}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(transaction.status)}>
                      {t(`transactions.status.${transaction.status}`)}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
      </Card>
    </PageContainer>

    {/* transaction detail sheet */}
    <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Detalle de transacción</SheetTitle>
          <SheetDescription>
            Información completa de la transacción
          </SheetDescription>
        </SheetHeader>
        <SheetBody>
          {selectedTransaction && (
            <div className="flex flex-col gap-6">
              {/* status badge */}
              <div className="flex items-center gap-3">
                <span className="text-sm text-neutrals-400">Estado:</span>
                <Badge variant={getStatusVariant(selectedTransaction.status)}>
                  {t(`transactions.status.${selectedTransaction.status}`)}
                </Badge>
              </div>

              {/* transaction details */}
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-neutrals-400 uppercase">Fecha</span>
                  <span className="text-sm text-neutrals-700 font-medium">{selectedTransaction.date}</span>
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-xs text-neutrals-400 uppercase">Beneficiario</span>
                  <span className="text-sm text-neutrals-700 font-medium">{selectedTransaction.beneficiary}</span>
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-xs text-neutrals-400 uppercase">Número de ID</span>
                  <span className="text-sm text-neutrals-700 font-medium">{selectedTransaction.idNumber}</span>
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-xs text-neutrals-400 uppercase">Monto</span>
                  <span className="text-sm text-neutrals-700 font-semibold">{formatAmount(selectedTransaction.amount)}</span>
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-xs text-neutrals-400 uppercase">Referencia</span>
                  <span className="text-sm text-neutrals-700 font-medium">{selectedTransaction.reference}</span>
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-xs text-neutrals-400 uppercase">ID de transacción</span>
                  <span className="text-sm text-neutrals-700 font-mono">{selectedTransaction.id}</span>
                </div>
              </div>
            </div>
          )}
        </SheetBody>
      </SheetContent>
    </Sheet>
    </>
  );
};
