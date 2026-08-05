import { Alert, AlertTitle, AlertDescription } from "@adamosuiteservices/ui/alert";
import { Badge } from "@adamosuiteservices/ui/badge";
import { Button } from "@adamosuiteservices/ui/button";
import { Calendar } from "@adamosuiteservices/ui/calendar";
import { Card } from "@adamosuiteservices/ui/card";
import { Checkbox } from "@adamosuiteservices/ui/checkbox";
import { Combobox } from "@adamosuiteservices/ui/combobox";
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
import { Icon } from "@adamosuiteservices/ui/icon";
import { usePortalContainer } from "@adamosuiteservices/ui/use-portal-container";
import { useTranslation } from "react-i18next";
import { createPortal } from "react-dom";
import { Link, useSearchParams } from "react-router";
import { PageContainer } from "@/features/common/components/layout/page-container";
import { PageTitle } from "@/features/common/components/layout/page-title";
import { StickyFilterHeader } from "@/features/common/components/layout/sticky-filter-header";
import { useTransactions } from "../hooks/use-transactions";
import { useTransactionDetail } from "../hooks/use-transaction-detail";
import { useAccounts } from "@/features/accounts/application/hooks/use-accounts";
import { buildTransactionListParams } from "../utils/transaction-filters.utils";
import { formatCurrencyDisplay } from "@/lib/money/money";
import { Input } from "@adamosuiteservices/ui/input";
import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@adamosuiteservices/ui/sheet";
import { Popover, PopoverContent, PopoverAnchor } from "@adamosuiteservices/ui/popover";
import type { DateRange } from "react-day-picker";
import { format, subDays } from "date-fns";
import { businessTodayAsLocalDate } from "@/lib/utils/date.utils";
import { es, enUS } from "date-fns/locale";
import { useRef, useState as useStateReact, useState, useMemo } from "react";
import { Label } from "@adamosuiteservices/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@adamosuiteservices/ui/table";
import {
  Timeline,
  TimelineItem,
  TimelineIndicator,
  TimelineContent,
  TimelineTitle,
  TimelineDescription,
  TimelineTime,
} from "@adamosuiteservices/ui/timeline";
import type { TransactionStatus, Transaction } from "../entities/transaction.entity";
import type { TransactionDetail } from "../entities/transaction-detail.entity";

/**
 * custom date range picker component
 * keeps preset ranges (7/30/90 days) independent from custom selection
 */
const DateRangePicker = ({
  dateRange,
  onDateRangeChange,
  labels,
  className,
  currentLanguage,
}: {
  dateRange: DateRange
  onDateRangeChange: (range: DateRange) => void
  labels: {
    last7Days: string
    last30Days: string
    last90Days: string
    custom: string
    placeholder: string
    cancel: string
    apply: string
  }
  className?: string
  currentLanguage: string
}) => {
  const comboboxRef = useRef<HTMLElement | null>(null);
  const [selectedOption, setSelectedOption] = useStateReact<string>(() => {
    // calculate initial option based on dateRange
    if (!dateRange.from || !dateRange.to) return "";
    const today = businessTodayAsLocalDate();
    if (dateRange.from.getTime() === subDays(today, 7).getTime() && dateRange.to.getTime() === today.getTime()) {
      return "7_days";
    }
    if (dateRange.from.getTime() === subDays(today, 30).getTime() && dateRange.to.getTime() === today.getTime()) {
      return "30_days";
    }
    if (dateRange.from.getTime() === subDays(today, 90).getTime() && dateRange.to.getTime() === today.getTime()) {
      return "90_days";
    }
    return "custom";
  });
  const [isCalendarOpen, setIsCalendarOpen] = useStateReact(false);
  const [tempDateRange, setTempDateRange] = useStateReact<DateRange>({ from: undefined, to: undefined });

  // get locale based on current language
  const locale = currentLanguage === "es" ? es : enUS;

  const handleComboboxChange = (value: string | string[]) => {
    const selectedValue = Array.isArray(value) ? value[0] : value;
    if (selectedValue === "custom") {
      // open calendar with empty selection
      setSelectedOption("custom");
      setTempDateRange({ from: undefined, to: undefined });
      setIsCalendarOpen(true);
      return;
    }

    // handle preset selection
    setSelectedOption(selectedValue);
    const today = businessTodayAsLocalDate();
    const daysMap = { "7_days": 7, "30_days": 30, "90_days": 90 };
    const days = daysMap[selectedValue as keyof typeof daysMap];
    if (days) {
      onDateRangeChange({ from: subDays(today, days), to: today });
    }
  };

  const handleApply = () => {
    if (tempDateRange.from && tempDateRange.to) {
      onDateRangeChange(tempDateRange);
      setIsCalendarOpen(false);
    }
  };

  const handleCancel = () => {
    setIsCalendarOpen(false);
  };

  // get display text for combobox
  const getDisplayText = () => {
    if (selectedOption === "custom" && dateRange.from && dateRange.to) {
      return format(dateRange.from, "dd/MM/yyyy") + " - " + format(dateRange.to, "dd/MM/yyyy");
    }
    return "";
  };

  return (
    <>
      <Combobox
        ref={(node) => {
          comboboxRef.current = node;
        }}
        alwaysShowPlaceholder
        selectedFeedback="check"
        icon="calendar_today"
        options={[
          { label: labels.last7Days, value: "7_days" },
          { label: labels.last30Days, value: "30_days" },
          { label: labels.last90Days, value: "90_days" },
          { label: labels.custom, value: "custom" },
        ]}
        labels={{ placeholder: labels.placeholder }}
        value={selectedOption}
        onValueChange={handleComboboxChange}
        classNames={{ trigger: className }}
        renders={{
          displayValue: ({ text, value }) => {
            if (value === "custom" && dateRange.from && dateRange.to) {
              return getDisplayText();
            }
            return text;
          },
        }}
      />
      <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
        <PopoverAnchor virtualRef={comboboxRef as React.RefObject<HTMLElement>} />
        <PopoverContent align="start">
          <Calendar
            required
            mode="range"
            selected={tempDateRange}
            onSelect={setTempDateRange}
            captionLayout="dropdown"
            locale={locale}
            formatters={{
              formatMonthDropdown: (date) => {
                const monthName = date.toLocaleString(currentLanguage === "es" ? "es-ES" : "en-US", { month: "long" });
                return monthName.charAt(0).toUpperCase() + monthName.slice(1);
              },
            }}
            classNames={{ root: "adm:p-0!" }}
          />
          <div className="adm:mt-2 adm:flex adm:justify-end adm:gap-2">
            <Button variant="link" onClick={handleCancel}>
              {labels.cancel}
            </Button>
            <Button variant="link" onClick={handleApply} disabled={!tempDateRange.from || !tempDateRange.to}>
              {labels.apply}
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </>
  );
};

/**
 * transactions page
 *
 * displays transactions list
 */
export const TransactionsPage = () => {
  const { t, i18n } = useTranslation("transactions");
  const { accounts } = useAccounts({ page: 1, limit: 20 });
  const [searchParams] = useSearchParams();

  const sidebarTopBarPortal = usePortalContainer("[data-slot='sidebar-top-bar-portal']");

  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [selectedTransactionId, setSelectedTransactionId] = useState<string | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [showTimeline, setShowTimeline] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [dateRange, setDateRange] = useState<DateRange>(() => {
    const today = businessTodayAsLocalDate();
    return {
      from: subDays(today, 30),
      to: today,
    };
  });
  const [accountFilter, setAccountFilter] = useState<string[]>(["all"]);
  const [statusFilter, setStatusFilter] = useState<string[]>(() => {
    const statusParam = searchParams.get("status");
    if (statusParam && ["pending", "validated", "returned", "rejected", "paid"].includes(statusParam)) {
      return [statusParam];
    }
    return ["all"];
  });

  // export dialog state
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [exportDateRange, setExportDateRange] = useState<DateRange>({
    from: undefined,
    to: undefined,
  });
  const [exportStatusFilter, setExportStatusFilter] = useState<string[]>(["all"]);
  const [exportFormatCSV, setExportFormatCSV] = useState(false);
  const [exportFormatPDF, setExportFormatPDF] = useState(false);

  const accountFilterOptions = useMemo(
    () => [
      { value: "all", label: t("transactions.filters.all") },
      ...accounts.map((account) => ({
        value: account.id,
        label: account.name,
      })),
    ],
    [accounts, t],
  );

  const listParams = useMemo(
    () => buildTransactionListParams({
      dateRange,
      statusFilter,
      accountFilter,
      search: searchQuery,
    }),
    [dateRange, statusFilter, accountFilter, searchQuery],
  );

  const { transactions, totalCount, refetch } = useTransactions(listParams);
  const { detail: transactionDetail } = useTransactionDetail(
    selectedTransactionId,
    isSheetOpen,
  );

  const displayedTransaction = useMemo<TransactionDetail | null>(() => {
    if (transactionDetail) {
      return transactionDetail;
    }

    if (!selectedTransaction) {
      return null;
    }

    return {
      ...selectedTransaction,
      idTypeLabel: "",
      destinationAccountLabel: "",
      sourceAccountName: "Cuenta",
      timeline: [],
    };
  }, [transactionDetail, selectedTransaction]);

  /**
   * check if date range is different from default (last 7 days)
   */
  const isDateRangeCustom = () => {
    if (!dateRange.from || !dateRange.to) return false;
    const today = businessTodayAsLocalDate();
    const defaultFrom = subDays(today, 30);
    return dateRange.from.getTime() !== defaultFrom.getTime() || dateRange.to.getTime() !== today.getTime();
  };

  /**
   * check if any filter is active
   */
  const hasActiveFilters = isDateRangeCustom()
    || (accountFilter.length > 0 && !accountFilter.includes("all"))
    || (statusFilter.length > 0 && !statusFilter.includes("all"))
    || searchQuery.trim().length > 0;

  /**
   * reset all filters
   */
  const handleResetFilters = () => {
    const today = businessTodayAsLocalDate();
    setDateRange({
      from: subDays(today, 30),
      to: today,
    });
    setAccountFilter(["all"]);
    setStatusFilter(["all"]);
    setSearchQuery("");
  };

  /**
   * handle row click
   */
  const handleRowClick = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setSelectedTransactionId(transaction.id);
    setShowTimeline(false);
    setIsSheetOpen(true);
  };

  /**
   * get badge variant based on transaction status
   */
  const getStatusVariant = (status: TransactionStatus): "default-medium" | "success-medium" | "warning-medium" | "destructive-medium" | "waiting-medium" => {
    switch (status) {
      case "paid":
        return "success-medium";
      case "validated":
        return "default-medium";
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
   * format currency amount (API amounts are integer minor units)
   */
  const formatAmount = (amountMinor: number): string => {
    return formatCurrencyDisplay(amountMinor, "COP");
  };

  return (
    <>
      {sidebarTopBarPortal && createPortal(
        <PageTitle>{t("transactions.page_title")}</PageTitle>,
        sidebarTopBarPortal,
      )}
      <PageContainer className="bg-neutrals-25">
        <Card className="overflow-visible border p-6">
          <StickyFilterHeader className="flex flex-col gap-0">
            {/* header + search */}
            <div className="flex flex-wrap items-center gap-6">
              {/* title + refresh button */}
              <div className="flex min-w-[220px] flex-1 items-center gap-4">
                <Button
                  variant="secondary"
                  onClick={() => void refetch()}
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
                      <p className="mt-2 text-sm text-neutrals-700">{t("transactions.export_dialog.description")}</p>
                    </DialogHeader>
                    <DialogBody className="flex flex-col gap-8">
                      {/* filters */}
                      <div className="flex gap-4">
                        {/* date filter */}
                        <div className="flex-1">
                          <DateRangePicker
                            dateRange={exportDateRange}
                            onDateRangeChange={setExportDateRange}
                            labels={{
                              last7Days: t("transactions.filters.last_7_days"),
                              last30Days: t("transactions.filters.last_30_days"),
                              last90Days: t("transactions.filters.last_90_days"),
                              custom: t("transactions.filters.custom"),
                              placeholder: t("transactions.export_dialog.date_filter"),
                              cancel: t("transactions.filters.cancel"),
                              apply: t("transactions.filters.apply"),
                            }}
                            className="h-10 w-full"
                            currentLanguage={i18n.language}
                          />
                        </div>
                        {/* status filter */}
                        <div className="flex-1">
                          <Combobox
                            multiple
                            exclusiveOption="all"
                            alwaysShowPlaceholder
                            valuePosition="right"
                            icon="search_activity"
                            options={[
                              { value: "all", label: t("transactions.export_dialog.status_all") },
                              { value: "pending", label: t("transactions.status.pending") },
                              { value: "validated", label: t("transactions.status.validated") },
                              { value: "paid", label: t("transactions.status.paid") },
                              { value: "returned", label: t("transactions.status.returned") },
                              { value: "rejected", label: t("transactions.status.rejected") },
                            ]}
                            value={exportStatusFilter}
                            onValueChange={(value) => setExportStatusFilter(value as string[])}
                            labels={{
                              placeholder: t("transactions.export_dialog.status_filter"),
                            }}
                            classNames={{
                              trigger: "h-10 w-full",
                            }}
                          />
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
                          <Label
                            htmlFor="csv"
                            className="cursor-pointer text-sm text-neutrals-700"
                          >
                            {t("transactions.export_dialog.csv_excel")}
                          </Label>
                        </div>
                        <div className="flex items-center gap-3">
                          <Checkbox
                            id="pdf"
                            checked={exportFormatPDF}
                            onCheckedChange={(checked) => setExportFormatPDF(checked as boolean)}
                          />
                          <Label
                            htmlFor="pdf"
                            className="cursor-pointer text-sm text-neutrals-700"
                          >
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
                      <Button
                        variant="default"
                        disabled={!exportFormatCSV && !exportFormatPDF}
                      >
                        {t("transactions.export_dialog.export")}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
              {/* search input */}
              <div className={`
                w-full
                md:min-w-[500px] md:flex-1
              `}
              >
                <div className="relative">
                  <Icon
                    symbol="search"
                    className={`
                      absolute top-1/2 left-2 -translate-y-1/2 text-neutrals-400
                    `}
                  />
                  <Input
                    placeholder={t("transactions.header.search_placeholder")}
                    className="h-10 pl-10 text-sm"
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                  />
                </div>
              </div>
            </div>
            {/* filters */}
            <div className="mt-6 flex flex-wrap items-center gap-6">
              {/* date filter */}
              <div className="min-w-[240px] flex-1">
                <DateRangePicker
                  dateRange={dateRange}
                  onDateRangeChange={setDateRange}
                  labels={{
                    last7Days: t("transactions.filters.last_7_days"),
                    last30Days: t("transactions.filters.last_30_days"),
                    last90Days: t("transactions.filters.last_90_days"),
                    custom: t("transactions.filters.custom"),
                    placeholder: t("transactions.filters.date"),
                    cancel: t("transactions.filters.cancel"),
                    apply: t("transactions.filters.apply"),
                  }}
                  className="h-10 w-full"
                  currentLanguage={i18n.language}
                />
              </div>
              {/* account filter */}
              <div className="min-w-[240px] flex-1">
                <Combobox
                  multiple
                  exclusiveOption="all"
                  alwaysShowPlaceholder
                  valuePosition="right"
                  icon="account_balance_wallet"
                  options={accountFilterOptions}
                  value={accountFilter}
                  onValueChange={(value) => setAccountFilter(value as string[])}
                  labels={{
                    placeholder: t("transactions.filters.account"),
                  }}
                  classNames={{
                    trigger: "h-10 w-full",
                  }}
                />
              </div>
              {/* status filter */}
              <div className="min-w-[240px] flex-1">
                <Combobox
                  multiple
                  exclusiveOption="all"
                  alwaysShowPlaceholder
                  valuePosition="right"
                  icon="search_activity"
                  options={[
                    { value: "all", label: t("transactions.filters.all_status") },
                    { value: "pending", label: t("transactions.status.pending") },
                    { value: "validated", label: t("transactions.status.validated") },
                    { value: "paid", label: t("transactions.status.paid") },
                    { value: "returned", label: t("transactions.status.returned") },
                    { value: "rejected", label: t("transactions.status.rejected") },
                  ]}
                  value={statusFilter}
                  onValueChange={(value) => setStatusFilter(value as string[])}
                  labels={{
                    placeholder: t("transactions.filters.status"),
                  }}
                  classNames={{
                    trigger: "h-10 w-full",
                  }}
                />
              </div>
              {/* reset filters button */}
              {hasActiveFilters && (
                <Button
                  variant="link"
                  onClick={handleResetFilters}
                  className="h-10 shrink-0 text-pay-500"
                >
                  Restablecer filtros
                </Button>
              )}
            </div>
          </StickyFilterHeader>
          {/* table */}
          <Table className="rounded-2xl">
            <TableHeader>
              <TableRow>
                <TableHead className={`
                  text-xs font-semibold text-neutrals-700 uppercase
                `}
                >
                  {t("transactions.table.date")}
                </TableHead>
                <TableHead className={`
                  text-xs font-semibold text-neutrals-700 uppercase
                `}
                >
                  {t("transactions.table.beneficiary")}
                </TableHead>
                <TableHead className={`
                  text-xs font-semibold text-neutrals-700 uppercase
                `}
                >
                  {t("transactions.table.id_number")}
                </TableHead>
                <TableHead className={`
                  text-xs font-semibold text-neutrals-700 uppercase
                `}
                >
                  {t("transactions.table.amount")}
                </TableHead>
                <TableHead className={`
                  text-xs font-semibold text-neutrals-700 uppercase
                `}
                >
                  {t("transactions.table.reference")}
                </TableHead>
                <TableHead className={`
                  text-xs font-semibold text-neutrals-700 uppercase
                `}
                >
                  {t("transactions.table.status")}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((transaction) => (
                <TableRow
                  key={transaction.id}
                  onClick={() => handleRowClick(transaction)}
                  className={`
                    cursor-pointer
                    hover:bg-neutrals-25
                  `}
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
                    <Badge
                      variant={getStatusVariant(transaction.status)}
                      className={`
                        h-8 px-2 text-sm leading-5
                        ${
                transaction.status === "pending"
                  ? "bg-neutrals-50"
                  : transaction.status === "validated"
                    ? "bg-[#E5F3FA] text-neutrals-700"
                    : ""
                }
                      `}
                    >
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
        <SheetContent className="sm:w-[576px] sm:max-w-[576px]">
          <SheetHeader>
            <SheetTitle className="text-sm font-bold text-neutrals-900">Detalles del pago</SheetTitle>
          </SheetHeader>
          <SheetBody className="flex flex-col gap-8 overflow-y-auto">
            {displayedTransaction && (
              <>
                {/* Transaction details fields */}
                <div className="flex flex-col gap-4">
                  {/* Fecha */}
                  <div className="flex flex-col gap-2">
                    <span className="text-xs text-neutrals-500">Fecha</span>
                    <div className="flex h-10 items-center gap-2 pl-2">
                      <Icon
                        symbol="calendar_today"
                        className="size-6 text-neutrals-700"
                      />
                      <span className="text-sm font-semibold text-neutrals-700">{displayedTransaction.date}</span>
                    </div>
                  </div>
                  {/* Beneficiario */}
                  <div className="flex flex-col gap-2">
                    <span className="text-xs text-neutrals-500">Beneficiario</span>
                    <div className="flex h-10 items-center gap-2 pl-2">
                      <Icon
                        symbol="account_circle"
                        className="size-6 text-neutrals-700"
                      />
                      <span className="text-sm font-semibold text-neutrals-700">{displayedTransaction.beneficiary}</span>
                    </div>
                  </div>
                  {/* Tipo y número de identificación */}
                  <div className="flex flex-col gap-2">
                    <span className="text-xs text-neutrals-500">Tipo y número de identificación</span>
                    <div className="flex h-10 items-center gap-2 pl-2">
                      <Icon
                        symbol="contacts"
                        className="size-6 text-neutrals-700"
                      />
                      <span className="text-sm font-semibold text-neutrals-700">
                        {displayedTransaction.idTypeLabel
                          ? `${displayedTransaction.idTypeLabel}: ${displayedTransaction.idNumber}`
                          : `Cédula de Ciudadanía: ${displayedTransaction.idNumber}`}
                      </span>
                    </div>
                  </div>
                  {/* Tipo y número de cuenta */}
                  <div className="flex flex-col gap-2">
                    <span className="text-xs text-neutrals-500">Tipo y número de cuenta</span>
                    <div className="flex h-10 items-center gap-2 pl-2">
                      <Icon
                        symbol="account_balance"
                        className="size-6 text-neutrals-700"
                      />
                      <span className="text-sm font-semibold text-neutrals-700">
                        {displayedTransaction.destinationAccountLabel || "Corriente. Davivienda Nº 002-83336-90116"}
                      </span>
                    </div>
                  </div>
                  {/* Número de referencia */}
                  <div className="flex flex-col gap-2">
                    <span className="text-xs text-neutrals-500">Número de referencia</span>
                    <div className="flex h-10 items-center gap-2 pl-2">
                      <Icon
                        symbol="confirmation_number"
                        className="size-6 text-neutrals-700"
                      />
                      <span className="text-sm font-semibold text-neutrals-700">{displayedTransaction.reference}</span>
                    </div>
                  </div>
                  {/* Monto */}
                  <div className="flex flex-col gap-2">
                    <span className="text-xs text-neutrals-500">Monto</span>
                    <div className="flex h-10 items-center gap-2 pl-2">
                      <Icon symbol="paid" className="size-6 text-neutrals-700" />
                      <span className="text-sm font-semibold text-neutrals-700">{formatAmount(displayedTransaction.amount)}</span>
                    </div>
                  </div>
                  {/* Cuenta */}
                  <div className="flex flex-col gap-2">
                    <span className="text-xs text-neutrals-500">Cuenta</span>
                    <div className="flex h-10 items-center gap-2 pl-2">
                      <Icon
                        symbol="account_balance_wallet"
                        className="size-6 text-neutrals-700"
                      />
                      <span className="text-sm font-semibold text-neutrals-700">
                        {displayedTransaction.sourceAccountName || "Cuenta de ahorros"}
                      </span>
                    </div>
                  </div>
                  {/* Estado */}
                  <div className="flex flex-col gap-2">
                    <span className="text-xs text-neutrals-500">Estado</span>
                    <div className="flex h-10 items-center gap-2 pl-2">
                      <Badge
                        variant={getStatusVariant(displayedTransaction.status)}
                        className={`
                          h-8 px-2 text-sm leading-5
                          ${
              displayedTransaction.status === "pending"
                ? "bg-neutrals-50"
                : displayedTransaction.status === "validated"
                  ? "bg-[#E5F3FA] text-neutrals-700"
                  : ""
              }
                        `}
                      >
                        {t(`transactions.status.${displayedTransaction.status}`)}
                      </Badge>
                    </div>
                  </div>
                  {/* Alert/Motivo - only show for returned/rejected */}
                  {(displayedTransaction.status === "returned" || displayedTransaction.status === "rejected") && (
                    <Alert variant="warning" className="border-0 bg-warning-50">
                      <Icon symbol="info" />
                      <AlertTitle>
                        {displayedTransaction.status === "returned" ? "Motivo de retorno" : "Motivo de rechazo"}
                      </AlertTitle>
                      <AlertDescription>
                        {displayedTransaction.statusReason
                          ?? "Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat."}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
                {/* Timeline section */}
                <div className="flex flex-col gap-6">
                  <Button
                    variant="link"
                    className={`
                      flex h-6 items-center gap-2 self-start px-0 text-primary
                    `}
                    onClick={() => setShowTimeline(!showTimeline)}
                  >
                    <span className="text-sm">{showTimeline ? "Ocultar timeline de pago" : "Ver timeline de pago"}</span>
                    <Icon
                      symbol={showTimeline ? "expand_less" : "expand_more"}
                      className="size-6"
                    />
                  </Button>
                  {showTimeline && (
                    <Timeline>
                      {displayedTransaction.timeline.length > 0
                        ? displayedTransaction.timeline.map((event) => (
                          <TimelineItem key={event.id} status={event.status}>
                            <TimelineIndicator />
                            <TimelineContent>
                              <TimelineTitle>{event.title}</TimelineTitle>
                              {event.description && (
                                <TimelineDescription>{event.description}</TimelineDescription>
                              )}
                              <TimelineTime>{event.time}</TimelineTime>
                            </TimelineContent>
                          </TimelineItem>
                        ))
                        : (
                          <>
                            <TimelineItem status="complete">
                              <TimelineIndicator />
                              <TimelineContent>
                                <TimelineTitle>Pago completado con éxito.</TimelineTitle>
                                <TimelineDescription>
                                  El pago ha sido procesado exitosamente. Confirmación bancaria recibida.
                                </TimelineDescription>
                                <TimelineTime>02 Septiembre. 02:35 PM</TimelineTime>
                              </TimelineContent>
                            </TimelineItem>
                            <TimelineItem status="active">
                              <TimelineIndicator />
                              <TimelineContent>
                                <TimelineTitle>En proceso</TimelineTitle>
                                <TimelineDescription>
                                  El pago está siendo procesado por el banco.
                                </TimelineDescription>
                                <TimelineTime>01 Septiembre. 10:15 AM</TimelineTime>
                              </TimelineContent>
                            </TimelineItem>
                            <TimelineItem status="pending">
                              <TimelineIndicator />
                              <TimelineContent>
                                <TimelineTitle>Pago iniciado</TimelineTitle>
                                <TimelineDescription>
                                  Solicitud de pago recibida.
                                </TimelineDescription>
                                <TimelineTime>01 Septiembre. 09:00 AM</TimelineTime>
                              </TimelineContent>
                            </TimelineItem>
                          </>
                        )}
                    </Timeline>
                  )}
                </div>
              </>
            )}
          </SheetBody>
          {/* Action button - only show for returned/rejected */}
          {displayedTransaction && (displayedTransaction.status === "returned" || displayedTransaction.status === "rejected") && (
            <SheetFooter>
              <Button
                variant="default"
                size="default"
                className="self-start"
                asChild
              >
                <Link to={`/transactions/correct/${displayedTransaction.id}`}>
                  Corregir y volver a enviar pago
                </Link>
              </Button>
            </SheetFooter>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
};
