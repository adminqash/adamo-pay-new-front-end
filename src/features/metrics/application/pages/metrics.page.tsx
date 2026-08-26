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
import { Label } from "@adamosuiteservices/ui/label";
import { Popover, PopoverContent, PopoverAnchor } from "@adamosuiteservices/ui/popover";
import { Tabs, TabsList, TabsTrigger } from "@adamosuiteservices/ui/tabs";
import {
  Tabs as TabsUnderline,
  TabsList as TabsUnderlineList,
  TabsTrigger as TabsUnderlineTrigger,
} from "@adamosuiteservices/ui/tabs-underline";
import { usePortalContainer } from "@adamosuiteservices/ui/use-portal-container";
import { format, subDays } from "date-fns";
import { businessTodayAsLocalDate } from "@/lib/utils/date.utils";
import { es, enUS } from "date-fns/locale";
import { useMemo, useState as useStateReact, useRef } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import { AccountTransactionCountChart } from "../components/account-status-chart";
import { AccountTransactionsTable } from "../components/account-transactions-table";
import { AccountTransactionAmountChart } from "../components/account-type-chart";
import { AmlComplianceChart } from "../components/aml-compliance-chart";
import { BatchRejectionChart } from "../components/batch-rejection-chart";
import { BatchStats } from "../components/batch-stats";
import { BatchStatusChart } from "../components/batch-status-chart";
import { BeneficiaryStatCard } from "../components/beneficiary-stat-card";
import { MetricCard } from "../components/metric-card";
import { PaymentFrequencyChart } from "../components/payment-frequency-chart";
import { RecurringFailuresTable } from "../components/recurring-failures-table";
import { RejectionReasons } from "../components/rejection-reasons";
import { TopBanksChart } from "../components/top-banks-chart";
import { TopBeneficiariesByAmount } from "../components/top-beneficiaries-by-amount";
import { TopBeneficiariesByTransactions } from "../components/top-beneficiaries-by-transactions";
import { TransactionStatusChart } from "../components/transaction-status-chart";
import { useMetricsAccounts, useMetricsBatches, useMetricsBeneficiaries, useMetricsOverview, useMetricsTransactions } from "../hooks/use-metrics";
import { buildMetricsParams } from "../utils/metrics-filters.utils";
import type { DateRange } from "react-day-picker";
import { PageContainer } from "@/features/common/components/layout/page-container";
import { PageTitle } from "@/features/common/components/layout/page-title";
import { useCountry } from "@/features/common/contexts/use-country";
import { usePermissions } from "@/features/auth/application/hooks/use-permissions";
import { PermissionGate } from "@/features/auth/application/components/permission-gate";
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

export function MetricsPage() {
  const { t, i18n } = useTranslation("metrics");
  const { capabilities } = usePermissions();
  const { countryCodeAlpha2 } = useCountry();
  const [filterTab, setFilterTab] = useStateReact("today");
  const [chartTab, setChartTab] = useStateReact("transactions");
  const [isDatePickerOpen, setIsDatePickerOpen] = useStateReact(false);
  const [customDateRange, setCustomDateRange] = useStateReact<DateRange>({
    from: undefined,
    to: undefined,
  });
  const [tempDateRange, setTempDateRange] = useStateReact<DateRange>({
    from: undefined,
    to: undefined,
  });
  const filterTabsRef = useRef<HTMLDivElement>(null);

  // Export dialog state
  const [isExportDialogOpen, setIsExportDialogOpen] = useStateReact(false);
  const [exportFormatCSV, setExportFormatCSV] = useStateReact(false);
  const [exportFormatPDF, setExportFormatPDF] = useStateReact(false);
  const [exportDateRange, setExportDateRange] = useStateReact<DateRange>({
    from: undefined,
    to: undefined,
  });
  const [exportTypeFilter, setExportTypeFilter] = useStateReact<string[]>(["all"]);

  // Handle filter tab change
  const handleFilterTabChange = (value: string) => {
    setFilterTab(value);
    setIsDatePickerOpen(false);
    // Reset custom date range when selecting a predefined tab
    if (value !== "custom") {
      setCustomDateRange({ from: undefined, to: undefined });
      setTempDateRange({ from: undefined, to: undefined });
    }
  };

  // Handle open custom date picker
  const handleOpenCustomDatePicker = () => {
    setTempDateRange(customDateRange);
    setIsDatePickerOpen(true);
  };

  // Handle date range apply
  const handleApplyDateRange = () => {
    setCustomDateRange(tempDateRange);
    setIsDatePickerOpen(false);
    setFilterTab("");
  };

  // Handle date range cancel
  const handleCancelDateRange = () => {
    setTempDateRange(customDateRange);
    setIsDatePickerOpen(false);
    // Reset to previous tab if no custom range is set
    if (!customDateRange.from || !customDateRange.to) {
      setFilterTab("today");
    }
  };

  // Format custom date range for display
  const formatCustomDateRange = () => {
    if (customDateRange.from && customDateRange.to) {
      const formatter = new Intl.DateTimeFormat(i18n.language === "es" ? "es-ES" : "en-US", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
      return `${formatter.format(customDateRange.from)} - ${formatter.format(customDateRange.to)}`;
    }
    return "";
  };

  // Handle clear custom date filter
  const handleClearCustomDate = () => {
    setCustomDateRange({ from: undefined, to: undefined });
    setTempDateRange({ from: undefined, to: undefined });
    setFilterTab("today");
    setIsDatePickerOpen(false);
  };

  const sidebarTopBarPortal = usePortalContainer("[data-slot='sidebar-top-bar-portal']");

  const metricsParams = useMemo(
    () => buildMetricsParams({ filterTab, customDateRange }),
    [filterTab, customDateRange],
  );

  const { overview, refetch: refetchOverview } = useMetricsOverview(metricsParams);
  const { transactions, refetch: refetchTransactions } = useMetricsTransactions(
    metricsParams,
    chartTab === "transactions",
  );
  const { beneficiaries, refetch: refetchBeneficiaries } = useMetricsBeneficiaries(
    metricsParams,
    chartTab === "beneficiaries",
  );
  const { batches, refetch: refetchBatches } = useMetricsBatches(
    metricsParams,
    chartTab === "batches",
  );
  const { accounts, refetch: refetchAccounts } = useMetricsAccounts(
    metricsParams,
    chartTab === "accounts" && capabilities.canViewFundings,
  );

  const refetch = () => {
    void refetchOverview();
    if (chartTab === "transactions") void refetchTransactions();
    if (chartTab === "beneficiaries") void refetchBeneficiaries();
    if (chartTab === "batches") void refetchBatches();
    if (chartTab === "accounts") void refetchAccounts();
  };

  const metricsData = overview ?? {
    totalVolume: { value: "$0,00", countryCode: countryCodeAlpha2, variation: { value: 0, trend: "up" as const } },
    totalTransactions: { value: "0", variation: { value: 0, trend: "up" as const } },
    averageTicket: { value: "$0,00", variation: { value: 0, trend: "up" as const } },
    averageFunding: { value: "$0,00", variation: { value: 0, trend: "up" as const } },
  };

  return (
    <>
      {sidebarTopBarPortal && createPortal(
        <PageTitle>{t("metrics.page_title")}</PageTitle>,
        sidebarTopBarPortal,
      )}
      <PageContainer className="flex flex-col gap-4">
        {/* Filter and Metrics Section */}
        <Card className="flex flex-col gap-8 p-6">
          {/* Filter Section */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-4" ref={filterTabsRef}>
              <Button variant="secondary" size="icon" onClick={() => refetch()}>
                <Icon symbol="refresh" weight={200} />
              </Button>
              <div className="flex flex-wrap items-center gap-2">
                <Tabs value={filterTab} onValueChange={handleFilterTabChange}>
                  <TabsList>
                    <TabsTrigger value="today">
                      {t("metrics.filters.today")}
                    </TabsTrigger>
                    <TabsTrigger value="this_week">
                      {t("metrics.filters.this_week")}
                    </TabsTrigger>
                    <TabsTrigger value="this_month">
                      {t("metrics.filters.this_month")}
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
                {/* Custom date button or chip */}
                {customDateRange.from && customDateRange.to
                  ? (
                    <div className={`
                      inline-flex h-10 items-center justify-center gap-2
                      rounded-xl border bg-background px-3 text-sm font-medium
                      whitespace-nowrap text-foreground
                    `}
                    >
                      {formatCustomDateRange()}
                      <Icon
                        symbol="cancel"
                        fill={1}
                        className={`
                          cursor-pointer text-destructive
                          hover:text-destructive/80
                        `}
                        onClick={handleClearCustomDate}
                      />
                    </div>
                  )
                  : (
                    <Button variant="link" onClick={handleOpenCustomDatePicker}>
                      <Icon symbol="tune" />
                      {t("metrics.filters.custom_range_button")}
                    </Button>
                  )}
              </div>
            </div>
            <PermissionGate permission={[...EXPORT_DATA]} mode="any">
            <Dialog open={isExportDialogOpen} onOpenChange={setIsExportDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="secondary">
                  {t("metrics.export_data")}
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[640px]">
                <DialogHeader>
                  <DialogTitle>{t("metrics.export_dialog.title")}</DialogTitle>
                  <p className="mt-2 text-sm text-foreground">{t("metrics.export_dialog.description")}</p>
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
                          last7Days: t("metrics.export_dialog.filters.last_7_days"),
                          last30Days: t("metrics.export_dialog.filters.last_30_days"),
                          last90Days: t("metrics.export_dialog.filters.last_90_days"),
                          custom: t("metrics.export_dialog.filters.custom"),
                          placeholder: t("metrics.export_dialog.filters.date_placeholder"),
                          cancel: t("metrics.date_picker.cancel"),
                          apply: t("metrics.date_picker.apply"),
                        }}
                        className="h-10 w-full"
                        currentLanguage={i18n.language}
                      />
                    </div>
                    {/* type filter */}
                    <div className="flex-1">
                      <Combobox
                        multiple
                        exclusiveOption="all"
                        alwaysShowPlaceholder
                        valuePosition="right"
                        icon="format_list_bulleted"
                        options={[
                          { value: "all", label: t("metrics.export_dialog.filters.all_types") },
                          { value: "transactions", label: t("metrics.export_dialog.filters.transactions") },
                          { value: "batches", label: t("metrics.export_dialog.filters.batches") },
                          { value: "beneficiaries", label: t("metrics.export_dialog.filters.beneficiaries") },
                          { value: "accounts", label: t("metrics.export_dialog.filters.accounts") },
                        ]}
                        value={exportTypeFilter}
                        onValueChange={(value) => setExportTypeFilter(value as string[])}
                        labels={{
                          placeholder: t("metrics.export_dialog.filters.type_placeholder"),
                        }}
                        classNames={{
                          trigger: "h-10 w-full",
                        }}
                      />
                    </div>
                  </div>
                  {/* file type checkboxes */}
                  <div className="flex items-center gap-8">
                    <p className="text-sm text-foreground">{t("metrics.export_dialog.file_type_label")}</p>
                    <div className="flex items-center gap-3">
                      <Checkbox
                        id="metrics-csv"
                        checked={exportFormatCSV}
                        onCheckedChange={(checked) => setExportFormatCSV(checked as boolean)}
                      />
                      <Label
                        htmlFor="metrics-csv"
                        className="cursor-pointer text-sm text-foreground"
                      >
                        {t("metrics.export_dialog.csv_excel")}
                      </Label>
                    </div>
                    <div className="flex items-center gap-3">
                      <Checkbox
                        id="metrics-pdf"
                        checked={exportFormatPDF}
                        onCheckedChange={(checked) => setExportFormatPDF(checked as boolean)}
                      />
                      <Label
                        htmlFor="metrics-pdf"
                        className="cursor-pointer text-sm text-foreground"
                      >
                        {t("metrics.export_dialog.pdf")}
                      </Label>
                    </div>
                  </div>
                </DialogBody>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="secondary">
                      {t("metrics.export_dialog.cancel")}
                    </Button>
                  </DialogClose>
                  <Button
                    variant="default"
                    disabled={!exportFormatCSV && !exportFormatPDF}
                  >
                    {t("metrics.export_dialog.export")}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            </PermissionGate>
          </div>
          {/* Metrics Cards */}
          <div className="flex flex-wrap gap-4">
            <MetricCard
              title={t("metrics.cards.total_volume")}
              value={metricsData.totalVolume.value}
              icon="flag"
              countryCode={metricsData.totalVolume.countryCode}
              variation={metricsData.totalVolume.variation}
              background="neutral"
            />
            <MetricCard
              title={t("metrics.cards.total_transactions")}
              value={metricsData.totalTransactions.value}
              icon="swap_horiz"
              variation={metricsData.totalTransactions.variation}
            />
            <MetricCard
              title={t("metrics.cards.average_ticket")}
              value={metricsData.averageTicket.value}
              icon="confirmation_number"
              variation={metricsData.averageTicket.variation}
            />
            <PermissionGate when={capabilities.canViewFundings}>
            <MetricCard
              title={t("metrics.cards.average_funding")}
              value={metricsData.averageFunding.value}
              icon="paid"
              variation={metricsData.averageFunding.variation}
            />
            </PermissionGate>
          </div>
          {/* Chart Section */}
          <div className="flex flex-col gap-4">
            {/* Chart Tabs */}
            <TabsUnderline value={chartTab} onValueChange={setChartTab}>
              <TabsUnderlineList>
                <TabsUnderlineTrigger value="transactions">
                  {t("metrics.tabs.transactions")}
                </TabsUnderlineTrigger>
                <TabsUnderlineTrigger value="batches">
                  {t("metrics.tabs.batches")}
                </TabsUnderlineTrigger>
                <TabsUnderlineTrigger value="beneficiaries">
                  {t("metrics.tabs.beneficiaries")}
                </TabsUnderlineTrigger>
                {capabilities.canViewFundings && (
                  <TabsUnderlineTrigger value="accounts">
                    {t("metrics.tabs.accounts")}
                  </TabsUnderlineTrigger>
                )}
              </TabsUnderlineList>
            </TabsUnderline>
            {/* Chart Container */}
            {chartTab === "transactions" && (
              <>
                <Card className="flex flex-col gap-6 border-0 bg-muted p-6">
                  <p className="text-sm text-foreground">
                    {t("metrics.chart.title")}
                  </p>
                  <PaymentFrequencyChart
                    filterType={filterTab as "today" | "this_week" | "this_month" | "custom"}
                    data={transactions?.paymentFrequency ?? []}
                    totalPayments={transactions?.paymentFrequencyTotal ?? 0}
                  />
                </Card>
                {/* Transaction Status and Rejection Reasons */}
                <Card className={`
                  flex flex-row flex-wrap items-start gap-6 border-0 bg-muted
                  p-6
                `}
                >
                  <div className={`
                    flex flex-1 basis-full flex-col items-start gap-6
                    md:basis-[340px]
                  `}
                  >
                    <p className="text-sm text-foreground">
                      {t("metrics.transaction_status.title")}
                    </p>
                    <TransactionStatusChart
                      _filterPeriod={filterTab}
                      data={transactions?.transactionStatusData}
                      totalTransactions={transactions?.transactionStatusTotal}
                    />
                  </div>
                  <div className={`
                    flex flex-1 basis-full flex-col items-start gap-6
                    md:basis-[340px]
                  `}
                  >
                    <p className="text-sm text-foreground">
                      {t("metrics.rejection_reasons.title")}
                    </p>
                    <RejectionReasons _filterPeriod={filterTab} reasons={transactions?.rejectionReasons ?? []} />
                  </div>
                </Card>
                {/* Top Banks and AML Compliance */}
                <Card className={`
                  flex flex-row flex-wrap items-start gap-6 border-0 bg-muted
                  p-6
                `}
                >
                  <div className={`
                    flex flex-1 basis-full flex-col items-start gap-6
                    md:basis-[340px]
                  `}
                  >
                    <p className="text-sm text-foreground">
                      {t("metrics.top_banks.title")}
                    </p>
                    <TopBanksChart _filterPeriod={filterTab} banks={transactions?.topBanks ?? []} />
                  </div>
                  <div className={`
                    flex flex-1 basis-full flex-col items-start gap-6
                    md:basis-[340px]
                  `}
                  >
                    <p className="text-sm text-foreground">
                      {t("metrics.aml_compliance.title")}
                    </p>
                    <AmlComplianceChart
                      _filterPeriod={filterTab}
                      data={transactions?.amlComplianceData}
                      totalValidations={transactions?.amlComplianceTotal}
                    />
                  </div>
                </Card>
              </>
            )}
            {chartTab === "batches" && (
              <>
                {/* Batch Status and Rejection */}
                <Card className={`
                  flex flex-row flex-wrap items-start gap-6 border-0 bg-muted
                  p-6
                `}
                >
                  <div className={`
                    flex flex-1 basis-full flex-col items-start gap-6
                    md:basis-[340px]
                  `}
                  >
                    <p className="text-sm text-foreground">
                      {t("metrics.batch_status.title")}
                    </p>
                    <BatchStatusChart
                      _filterPeriod={filterTab}
                      data={batches?.batchStatusData}
                      totalBatches={batches?.batchRejectionTotal ?? 0}
                    />
                  </div>
                  <div className={`
                    flex flex-1 basis-full flex-col items-start gap-6
                    md:basis-[340px]
                  `}
                  >
                    <p className="text-sm text-foreground">
                      {t("metrics.batch_rejection.title")}
                    </p>
                    <BatchRejectionChart
                      _filterPeriod={filterTab}
                      data={batches?.batchRejectionData}
                      totalBatches={batches?.batchRejectionTotal}
                      totalPayments={batches?.batchRejectionPayments}
                    />
                  </div>
                </Card>
                {/* Batch Stats */}
                <BatchStats _filterPeriod={filterTab} stats={batches?.batchStats} />
              </>
            )}
            {chartTab === "beneficiaries" && (
              <>
                {/* Beneficiary Stats */}
                <BeneficiaryStatCard
                  _filterPeriod={filterTab}
                  newBeneficiaries={beneficiaries?.newBeneficiaries ?? 0}
                  percentageChange={beneficiaries?.newBeneficiariesVariation ?? 0}
                  trend={beneficiaries?.newBeneficiariesTrend}
                />
                {/* Top Beneficiaries by Amount and Transactions */}
                <Card className={`
                  flex flex-row flex-wrap items-start gap-6 border-0 bg-muted
                  p-6
                `}
                >
                  <TopBeneficiariesByAmount _filterPeriod={filterTab} beneficiaries={beneficiaries?.topBeneficiariesByAmount ?? []} />
                  <TopBeneficiariesByTransactions _filterPeriod={filterTab} beneficiaries={beneficiaries?.topBeneficiariesByCount ?? []} />
                </Card>
                {/* Recurring Failures Table */}
                <RecurringFailuresTable _filterPeriod={filterTab} failures={beneficiaries?.recurringFailures ?? []} />
              </>
            )}
            {chartTab === "accounts" && capabilities.canViewFundings && (
              <>
                {/* Account Transaction Count and Amount */}
                <Card className={`
                  flex flex-row flex-wrap items-start gap-6 border-0 bg-muted
                  p-6
                `}
                >
                  <div className={`
                    flex flex-1 basis-full flex-col items-start gap-6
                    md:basis-[340px]
                  `}
                  >
                    <p className="text-sm text-foreground">
                      {t("metrics.account_transaction_count.title")}
                    </p>
                    <AccountTransactionCountChart
                      _filterPeriod={filterTab}
                      data={accounts?.accountCountData}
                    />
                  </div>
                  <div className={`
                    flex flex-1 basis-full flex-col items-start gap-6
                    md:basis-[340px]
                  `}
                  >
                    <p className="text-sm text-foreground">
                      {t("metrics.account_transaction_amount.title")}
                    </p>
                    <AccountTransactionAmountChart
                      _filterPeriod={filterTab}
                      data={accounts?.accountAmountData}
                    />
                  </div>
                </Card>
                {/* Account Transactions Table */}
                <AccountTransactionsTable
                  _filterPeriod={filterTab}
                  accounts={accounts?.accountTableData ?? []}
                />
              </>
            )}
          </div>
        </Card>
        {/* Custom Date Range Popover */}
        <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen} modal={true}>
          <PopoverAnchor virtualRef={filterTabsRef as React.RefObject<Element>} />
          <PopoverContent align="start">
            <Calendar
              mode="range"
              selected={tempDateRange}
              onSelect={(range) => setTempDateRange(range || { from: undefined, to: undefined })}
              locale={i18n.language === "es" ? es : undefined}
              captionLayout="dropdown"
              classNames={{ root: "adm:p-0!" }}
              formatters={{
                formatMonthDropdown: (date) => {
                  const monthName = date.toLocaleString(i18n.language === "es" ? "es-ES" : "en-US", { month: "long" });
                  return monthName.charAt(0).toUpperCase() + monthName.slice(1);
                },
              }}
            />
            <div className="adm:mt-2 adm:flex adm:justify-end adm:gap-2">
              <Button variant="link" onClick={handleCancelDateRange}>
                {t("metrics.date_picker.cancel")}
              </Button>
              <Button variant="link" onClick={handleApplyDateRange} disabled={!tempDateRange.from || !tempDateRange.to}>
                {t("metrics.date_picker.apply")}
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </PageContainer>
    </>
  );
}
