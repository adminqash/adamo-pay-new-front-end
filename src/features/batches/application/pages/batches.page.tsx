import { useTranslation } from "react-i18next";
import { usePortalContainer } from "@adamosuiteservices/ui/use-portal-container";
import { createPortal } from "react-dom";
import { PageTitle } from "@/features/common/components/layout/page-title";
import { PageContainer } from "@/features/common/components/layout/page-container";
import { StickyFilterHeader } from "@/features/common/components/layout/sticky-filter-header";
import { useCountry } from "@/features/common/contexts/use-country";
import { useBatches } from "../hooks/use-batches";
import { useBatchesRealtime } from "../hooks/use-batches-realtime";
import { buildBatchListParams } from "../utils/batch-filters.utils";
import { Button } from "@adamosuiteservices/ui/button";
import { Card } from "@adamosuiteservices/ui/card";
import { Icon } from "@adamosuiteservices/ui/icon";
import { Input } from "@adamosuiteservices/ui/input";
import { Badge } from "@adamosuiteservices/ui/badge";
import { Combobox } from "@adamosuiteservices/ui/combobox";
import { Popover, PopoverContent, PopoverAnchor } from "@adamosuiteservices/ui/popover";
import { Calendar } from "@adamosuiteservices/ui/calendar";
import type { DateRange } from "react-day-picker";
import { format, subDays } from "date-fns";
import { businessTodayAsLocalDate, formatApiDate } from "@/lib/utils/date.utils";
import { es, enUS } from "date-fns/locale";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@adamosuiteservices/ui/table";
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
import { ToastManager } from "@adamosuiteservices/ui/toaster";
import { ReportsService } from "@/features/reports/api/services/reports.service";
import type { BatchStatus } from "../entities/batch.entity";
import { useState, useRef, useState as useStateReact, useEffect, useMemo } from "react";
import { useNavigate, Link, useLocation } from "react-router";
import { PermissionGate } from "@/features/auth/application/components/permission-gate";
import { PERMISSIONS } from "@/features/auth/domain/permissions";
import { EXPORT_DATA } from "@/features/auth/domain/permission-ui";

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
 * batches page
 * 
 * displays batches list
 */
export const BatchesPage = () => {
  const { t, i18n } = useTranslation("batches");
  const navigate = useNavigate();
  const location = useLocation();
  const { currencyUpper, locale } = useCountry();

  const sidebarTopBarPortal = usePortalContainer("[data-slot='sidebar-top-bar-portal']");

  const [searchQuery, setSearchQuery] = useState("");
  const [dateRange, setDateRange] = useState<DateRange>(() => {
    const today = businessTodayAsLocalDate();
    return {
      from: subDays(today, 30),
      to: today,
    };
  });
  const [statusFilter, setStatusFilter] = useState<string[]>(["all"]);

  const listParams = useMemo(
    () => buildBatchListParams({
      dateRange,
      statusFilter,
      search: searchQuery,
    }),
    [dateRange, statusFilter, searchQuery],
  );

  const { batches, totalCount, refetch } = useBatches(listParams);
  useBatchesRealtime();

  // Show success toast if redirected from create batch
  useEffect(() => {
    const state = location.state as { showSuccessToast?: boolean, showSavedToast?: boolean } | null;
    if (state?.showSuccessToast) {
      ToastManager.show({
        message: t("batches.messages.batch_created"),
        variant: "success",
      });
      // Clear the state to prevent showing toast on refresh
      window.history.replaceState({}, document.title);
    } else if (state?.showSavedToast) {
      ToastManager.show({
        message: t("batches.messages.batch_saved"),
        variant: "success",
      });
      // Clear the state to prevent showing toast on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location.state, t]);

  // export dialog state
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [exportDateRange, setExportDateRange] = useState<DateRange>({
    from: undefined,
    to: undefined,
  });
  const [exportStatusFilter, setExportStatusFilter] = useState<string[]>(["all"]);
  const [exportFormatCSV, setExportFormatCSV] = useState(false);
  const [exportFormatPDF, setExportFormatPDF] = useState(false);

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
    setStatusFilter(["all"]);
    setSearchQuery("");
  };

  /**
   * generate a batches report from the export dialog filters
   */
  const handleExportBatches = async() => {
    try {
      const statuses = exportStatusFilter.filter((status) => status !== "all");
      const from = exportDateRange.from ? formatApiDate(exportDateRange.from) : undefined;
      const to = exportDateRange.to ? formatApiDate(exportDateRange.to) : undefined;
      const nameParts = ["Lotes", from, to].filter(Boolean);

      await ReportsService.create({
        name: nameParts.join(" "),
        type: "batches",
        format: "csv",
        filters: {
          dateFrom: from,
          dateTo: to,
          status: statuses.length > 0 ? statuses.join(",") : undefined,
        },
      });

      ToastManager.show({
        message: t("batches.export_dialog.success"),
        variant: "success",
      });
      setIsExportDialogOpen(false);
      setExportFormatCSV(false);
      setExportFormatPDF(false);
    } catch {
      ToastManager.show({
        message: t("batches.export_dialog.error"),
        variant: "destructive",
      });
    }
  };

  /**
   * handle row click
   */
  const handleRowClick = (batchId: string) => {
    navigate(`/batches/${batchId}`);
  };

  /**
   * get badge variant based on batch status
   */
  const getStatusVariant = (status: BatchStatus): "default-medium" | "success-medium" | "warning-medium" | "destructive-medium" | "waiting-medium" => {
    switch (status) {
      case "completed":
        return "success-medium";
      case "processing":
        return "warning-medium";
      case "pending":
      default:
        return "default-medium";
    }
  };

  /**
   * format currency amount
   */
  const formatAmount = (amount: number): string => {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: currencyUpper,
      minimumFractionDigits: 2,
    }).format(amount);
  };

  /**
   * format transaction count
   */
  const formatTransactionCount = (count: number): string => {
    return new Intl.NumberFormat(locale).format(count);
  };

  return (
    <>
      {sidebarTopBarPortal && createPortal(
        <PageTitle>{t("batches.page_title")}</PageTitle>,
        sidebarTopBarPortal,
      )}
      <PageContainer>
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
              <p className="text-sm font-semibold text-[#41454c]">
                {t("batches.header.count", { count: totalCount })}
              </p>
            </div>

            {/* action buttons */}
            <div className="flex items-center gap-4">
              <PermissionGate permission={PERMISSIONS.PAYMENTS_BATCH_CREATE}>
              <Button
                variant="default"
                asChild
              >
                <Link to="/batches/create">{t("batches.header.new_batch")}</Link>
              </Button>
              </PermissionGate>
              <PermissionGate permission={[...EXPORT_DATA]} mode="any">
              <Dialog open={isExportDialogOpen} onOpenChange={setIsExportDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    variant="secondary"
                  >
                    {t("batches.header.export_data")}
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[640px]">
                  <DialogHeader>
                    <DialogTitle>{t("batches.export_dialog.title")}</DialogTitle>
                    <p className="mt-2 text-sm text-neutrals-700">{t("batches.export_dialog.description")}</p>
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
                            last7Days: t("batches.filters.last_7_days"),
                            last30Days: t("batches.filters.last_30_days"),
                            last90Days: t("batches.filters.last_90_days"),
                            custom: t("batches.filters.custom"),
                            placeholder: t("batches.filters.date"),
                            cancel: t("batches.filters.cancel"),
                            apply: t("batches.filters.apply"),
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
                            { value: "all", label: t("batches.filters.all_status") },
                            { value: "pending", label: t("batches.status.pending") },
                            { value: "processing", label: t("batches.status.processing") },
                            { value: "completed", label: t("batches.status.completed") },
                          ]}
                          value={exportStatusFilter}
                          onValueChange={(value) => setExportStatusFilter(value as string[])}
                          labels={{
                            placeholder: t("batches.filters.status"),
                          }}
                          classNames={{
                            trigger: "h-10 w-full",
                          }}
                        />
                      </div>
                    </div>

                    {/* file type checkboxes */}
                    <div className="flex items-center gap-8">
                      <p className="text-sm text-neutrals-700">{t("batches.export_dialog.file_type_label")}</p>
                      <div className="flex items-center gap-3">
                        <Checkbox
                          id="batch-csv"
                          checked={exportFormatCSV}
                          onCheckedChange={(checked) => setExportFormatCSV(checked as boolean)}
                        />
                        <Label
                          htmlFor="batch-csv"
                          className="cursor-pointer text-sm text-neutrals-700"
                        >
                          {t("batches.export_dialog.csv_excel")}
                        </Label>
                      </div>
                      <div className="flex items-center gap-3">
                        <Checkbox
                          id="batch-pdf"
                          checked={exportFormatPDF}
                          disabled
                          onCheckedChange={(checked) => setExportFormatPDF(checked as boolean)}
                        />
                        <Label
                          htmlFor="batch-pdf"
                          className={`
                            cursor-not-allowed text-sm text-neutrals-400
                          `}
                        >
                          {t("batches.export_dialog.pdf")}
                        </Label>
                      </div>
                    </div>
                  </DialogBody>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant="secondary">
                        {t("batches.export_dialog.cancel")}
                      </Button>
                    </DialogClose>
                    <Button
                      variant="default"
                      disabled={!exportFormatCSV}
                      onClick={() => void handleExportBatches()}
                    >
                      {t("batches.export_dialog.export")}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              </PermissionGate>
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
                    absolute top-1/2 left-2 -translate-y-1/2 text-[#898f99]
                  `}
                />
                <Input
                  placeholder={t("batches.header.search_placeholder")}
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
                  last7Days: t("batches.filters.last_7_days"),
                  last30Days: t("batches.filters.last_30_days"),
                  last90Days: t("batches.filters.last_90_days"),
                  custom: t("batches.filters.custom"),
                  placeholder: t("batches.filters.date"),
                  cancel: t("batches.filters.cancel"),
                  apply: t("batches.filters.apply"),
                }}
                className="h-10 w-full"
                currentLanguage={i18n.language}
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
                  { value: "all", label: t("batches.filters.all_status") },
                  { value: "pending", label: t("batches.status.pending") },
                  { value: "processing", label: t("batches.status.processing") },
                  { value: "completed", label: t("batches.status.completed") },
                ]}
                value={statusFilter}
                onValueChange={(value) => setStatusFilter(value as string[])}
                labels={{
                  placeholder: t("batches.filters.status"),
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
                className="h-10 shrink-0 text-[#0e9384]"
              >
                {t("batches.filters.reset")}
              </Button>
            )}
          </div>
          </StickyFilterHeader>

          {/* table */}
        <Table className="rounded-2xl">
          <TableHeader>
              <TableRow>
                <TableHead className={`
                  text-xs font-semibold text-[#41454c] uppercase
                `}
                >
                  {t("batches.table.date")}
                </TableHead>
                <TableHead className={`
                  text-xs font-semibold text-[#41454c] uppercase
                `}
                >
                  {t("batches.table.batch_name")}
                </TableHead>
                <TableHead className={`
                  text-xs font-semibold text-[#41454c] uppercase
                `}
                >
                  {t("batches.table.transactions")}
                </TableHead>
                <TableHead className={`
                  text-xs font-semibold text-[#41454c] uppercase
                `}
                >
                  {t("batches.table.amount")}
                </TableHead>
                <TableHead className={`
                  text-xs font-semibold text-[#41454c] uppercase
                `}
                >
                  {t("batches.table.batch_id")}
                </TableHead>
                <TableHead className={`
                  text-xs font-semibold text-[#41454c] uppercase
                `}
                >
                  {t("batches.table.status")}
                </TableHead>
              </TableRow>
          </TableHeader>
            <TableBody>
              {batches.map((batch) => (
                <TableRow 
                  key={batch.id}
                  onClick={() => handleRowClick(batch.id)}
                  className={`
                    cursor-pointer
                    hover:bg-[#f8f8f9]
                  `}
                >
                  <TableCell className="text-sm text-[#41454c]">
                    {batch.date}
                  </TableCell>
                  <TableCell className="text-sm text-[#41454c]">
                    {batch.name}
                  </TableCell>
                  <TableCell className="text-sm text-[#41454c]">
                    {formatTransactionCount(batch.transactions)}
                  </TableCell>
                  <TableCell className="text-sm text-[#41454c]">
                    {formatAmount(batch.amount)}
                  </TableCell>
                  <TableCell className="text-sm text-[#41454c]">
                    {batch.batchId}
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={getStatusVariant(batch.status)} 
                      className={`
                        h-8 px-2 text-sm leading-5
                        ${batch.status === "pending" ? "bg-neutrals-50" : ""}
                      `}
                    >
                      {t(`batches.status.${batch.status}`)}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
        </Table>
        </Card>
      </PageContainer>
    </>
  );
};
