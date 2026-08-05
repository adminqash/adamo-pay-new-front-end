import {
  AmountInputContainer,
  AmountInputFlag,
  AmountInput,
  AmountInputAction,
} from "@adamosuiteservices/ui/amount-input";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
} from "@adamosuiteservices/ui/breadcrumb";
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
  DialogDescription,
  DialogBody,
  DialogFooter,
  DialogClose,
} from "@adamosuiteservices/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@adamosuiteservices/ui/dropdown-menu";
import { Icon } from "@adamosuiteservices/ui/icon";
import { Input } from "@adamosuiteservices/ui/input";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@adamosuiteservices/ui/input-otp";
import { Label } from "@adamosuiteservices/ui/label";
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext } from "@adamosuiteservices/ui/pagination";
import { Popover, PopoverContent, PopoverAnchor } from "@adamosuiteservices/ui/popover";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@adamosuiteservices/ui/table";
import { usePortalContainer } from "@adamosuiteservices/ui/use-portal-container";
import { format, subDays } from "date-fns";
import { businessTodayAsLocalDate } from "@/lib/utils/date.utils";
import { es, enUS } from "date-fns/locale";
import { useState, useRef, useState as useStateReact, useMemo, useEffect } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import { Link, useParams, useNavigate } from "react-router";
import { useAccount, useAccountMovements, useAccounts, useDeleteAccount, useTransferAccount, useUpdateAccount } from "../hooks/use-accounts";
import { buildAccountListParams, buildAccountMovementListParams } from "../utils/account-filters.utils";
import type { AccountMovement } from "@/features/accounts/application/entities/account.entity";
import type { DateRange } from "react-day-picker";
import { PageContainer } from "@/features/common/components/layout/page-container";
import { parseCurrencyToMinor } from "@/lib/money/money";

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

export function AccountMovementsPage() {
  const { t, i18n } = useTranslation("accounts");
  const { accountId } = useParams<{ accountId: string }>();
  const navigate = useNavigate();

  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const pageSize = 15;

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const movementListParams = useMemo(
    () => buildAccountMovementListParams({
      page: currentPage,
      limit: pageSize,
      search: debouncedSearchQuery,
    }),
    [currentPage, debouncedSearchQuery],
  );

  const {
    movements,
    totalCount,
    pages: totalPages,
    isLoading: isMovementsLoading,
  } = useAccountMovements(accountId ?? "", movementListParams);

  const { accounts: transferAccounts } = useAccounts(buildAccountListParams({ page: 1, limit: 100 }));
  const { account: fetchedAccount, refetch: refetchAccount } = useAccount(accountId ?? "");
  const updateAccount = useUpdateAccount();
  const deleteAccount = useDeleteAccount();
  const transferAccountMutation = useTransferAccount();

  const sidebarTopBarPortal = usePortalContainer("[data-slot='sidebar-top-bar-portal']");

  const [isEditNameDialogOpen, setIsEditNameDialogOpen] = useState(false);
  const [newAccountName, setNewAccountName] = useState("");
  const [isOtpDialogOpen, setIsOtpDialogOpen] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [otpAction, setOtpAction] = useState<"edit" | "delete">("edit");

  // delete account dialog state
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // transfer dialog state
  const [isTransferDialogOpen, setIsTransferDialogOpen] = useState(false);
  const [transferAmount, setTransferAmount] = useState("");
  const [transferToAccountId, setTransferToAccountId] = useState<string | null>(null);

  // export dialog state
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [exportDateRange, setExportDateRange] = useState<DateRange>({
    from: undefined,
    to: undefined,
  });
  const [exportTypeFilter, setExportTypeFilter] = useState("all");
  const [exportFormatCSV, setExportFormatCSV] = useState(false);
  const [exportFormatPDF, setExportFormatPDF] = useState(false);

  /**
   * handle open edit name dialog
   */
  const handleOpenEditNameDialog = () => {
    setNewAccountName(account.name);
    setIsEditNameDialogOpen(true);
  };

  /**
   * handle save new name - opens OTP dialog
   */
  const handleSaveNewName = () => {
    setIsEditNameDialogOpen(false);
    setOtpAction("edit");
    setIsOtpDialogOpen(true);
  };

  /**
   * handle open delete dialog
   */
  const handleOpenDeleteDialog = () => {
    setIsDeleteDialogOpen(true);
  };

  /**
   * handle open transfer dialog
   */
  const handleOpenTransferDialog = () => {
    setIsTransferDialogOpen(true);
  };

  /**
   * handle transfer confirm
   */
  const handleTransferConfirm = () => {
    if (!accountId || !transferToAccountId) {
      return;
    }

    transferAccountMutation.mutate({
      fromAccountId: accountId,
      toAccountId: transferToAccountId,
      amount: parseCurrencyToMinor(transferAmount),
    }, {
      onSuccess: () => {
        setIsTransferDialogOpen(false);
        setTransferToAccountId(null);
        setTransferAmount("");
        void refetchAccount();
      },
    });
  };

  /**
   * handle confirm delete - opens OTP dialog
   */
  const handleConfirmDelete = () => {
    setIsDeleteDialogOpen(false);
    setOtpAction("delete");
    setIsOtpDialogOpen(true);
  };

  /**
   * handle OTP submit - confirms name change or account deletion
   */
  const handleOtpSubmit = () => {
    if (otpAction === "edit" && accountId) {
      updateAccount.mutate({
        accountId,
        name: newAccountName,
        totp: otpCode,
      }, {
        onSuccess: () => {
          void refetchAccount();
        },
      });
    } else if (otpAction === "delete" && accountId) {
      deleteAccount.mutate({
        accountId,
        totp: otpCode,
      }, {
        onSuccess: () => {
          setTimeout(() => {
            navigate("/accounts");
          }, 500);
        },
      });
    }

    setIsOtpDialogOpen(false);
    setOtpCode("");
  };

  /**
   * handle OTP cancel
   */
  const handleOtpCancel = () => {
    setIsOtpDialogOpen(false);
    setOtpCode("");
  };

  const account = fetchedAccount ?? {
    id: accountId ?? "",
    name: t("accounts.unknown_account", { defaultValue: "Cuenta desconocida" }),
    balance: "$0,00",
    currency: "COP",
    countryCode: "CO",
  };

  if (!accountId) {
    return null;
  }

  return (
    <>
      {sidebarTopBarPortal && createPortal(
        <Breadcrumb>
          <BreadcrumbList className="flex-nowrap">
            <BreadcrumbItem className={`
              hidden
              md:block
            `}
            >
              <BreadcrumbLink asChild>
                <Link to="/accounts">{t("accounts.page_title")}</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbItem className="md:hidden">
              <button
                onClick={() => navigate("/accounts")}
                className="flex h-9 w-9 items-center justify-center"
              >
                <BreadcrumbEllipsis />
              </button>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem className="min-w-0">
              <BreadcrumbPage className="truncate">{t("movements.page_title")}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>,
        sidebarTopBarPortal,
      )}
      <PageContainer>
        <Card className="flex flex-col gap-6 p-6">
          {/* account header card */}
          <Card className={`
            border-0 bg-gradient-to-r from-[#e5f3fa] to-white p-6
          `}
          >
            <div className="flex flex-col gap-4">
              <div className="text-sm leading-5 font-bold text-foreground">
                {account.name}
              </div>
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className={`
                  inline-flex h-14 items-center gap-3 rounded-full bg-white px-4
                  py-4
                `}
                >
                  <span className="text-sm font-bold text-foreground">
                    {account.balance}
                  </span>
                  <span className="text-sm text-foreground">
                    {account.currency}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-8">
                  <Button
                    variant="default"
                    onClick={handleOpenTransferDialog}
                  >
                    <Icon symbol="swap_horiz" />
                    Transferir
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        className={`
                          border-none bg-transparent p-0
                          hover:bg-transparent
                          focus:outline-none
                          focus-visible:outline-none
                          active:bg-transparent
                        `}
                        style={{ WebkitTapHighlightColor: "transparent" }}
                      >
                        <Icon
                          symbol="more_vert"
                          weight={200}
                          className="text-foreground"
                        />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        {t("accounts.dropdown_menu.add_balance")}
                      </DropdownMenuItem>
                      <DropdownMenuItem onSelect={handleOpenTransferDialog}>
                        {t("accounts.dropdown_menu.transfer")}
                      </DropdownMenuItem>
                      <DropdownMenuItem onSelect={handleOpenEditNameDialog}>
                        {t("accounts.dropdown_menu.edit_name")}
                      </DropdownMenuItem>
                      <DropdownMenuItem variant="destructive" onSelect={handleOpenDeleteDialog}>
                        {t("accounts.dropdown_menu.delete")}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          </Card>
          {/* movements table */}
          <Card className="flex flex-col gap-6 p-6">
            {/* header with search */}
            <div className="flex flex-wrap items-center gap-6">
              <div className="min-w-[220px] flex-1">
                <p className="text-sm font-semibold text-foreground">
                  {t("movements.header.count", { count: totalCount })}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <Dialog open={isExportDialogOpen} onOpenChange={setIsExportDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="secondary">
                      {t("movements.header.export_data")}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[640px]">
                    <DialogHeader>
                      <DialogTitle>{t("movements.export_dialog.title")}</DialogTitle>
                      <p className="mt-2 text-sm text-foreground">{t("movements.export_dialog.description")}</p>
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
                              last7Days: t("movements.filters.last_7_days"),
                              last30Days: t("movements.filters.last_30_days"),
                              last90Days: t("movements.filters.last_90_days"),
                              custom: t("movements.filters.custom"),
                              placeholder: t("movements.export_dialog.date_filter"),
                              cancel: t("movements.filters.cancel"),
                              apply: t("movements.filters.apply"),
                            }}
                            className="h-10 w-full"
                            currentLanguage={i18n.language}
                          />
                        </div>
                        {/* type filter */}
                        <div className="flex-1">
                          <Combobox
                            alwaysShowPlaceholder
                            valuePosition="right"
                            selectedFeedback="check"
                            icon="format_list_bulleted"
                            options={[
                              { value: "all", label: t("movements.export_dialog.type_all") },
                              { value: "debit", label: t("movements.type.debit") },
                              { value: "credit", label: t("movements.type.credit") },
                            ]}
                            value={exportTypeFilter}
                            onValueChange={(value) => setExportTypeFilter(value as string)}
                            labels={{
                              placeholder: t("movements.export_dialog.type_filter"),
                            }}
                            classNames={{
                              trigger: "h-10 w-full",
                            }}
                          />
                        </div>
                      </div>
                      {/* file type checkboxes */}
                      <div className="flex items-center gap-8">
                        <p className="text-sm text-foreground">{t("movements.export_dialog.file_type_label")}</p>
                        <div className="flex items-center gap-3">
                          <Checkbox
                            id="movements-csv"
                            checked={exportFormatCSV}
                            onCheckedChange={(checked) => setExportFormatCSV(checked as boolean)}
                          />
                          <Label
                            htmlFor="movements-csv"
                            className="cursor-pointer text-sm text-foreground"
                          >
                            {t("movements.export_dialog.csv_excel")}
                          </Label>
                        </div>
                        <div className="flex items-center gap-3">
                          <Checkbox
                            id="movements-pdf"
                            checked={exportFormatPDF}
                            onCheckedChange={(checked) => setExportFormatPDF(checked as boolean)}
                          />
                          <Label
                            htmlFor="movements-pdf"
                            className="cursor-pointer text-sm text-foreground"
                          >
                            {t("movements.export_dialog.pdf")}
                          </Label>
                        </div>
                      </div>
                    </DialogBody>
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button variant="secondary">
                          {t("movements.export_dialog.cancel")}
                        </Button>
                      </DialogClose>
                      <Button
                        variant="default"
                        disabled={!exportFormatCSV && !exportFormatPDF}
                      >
                        {t("movements.export_dialog.export")}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
              <div className={`
                basis-full
                lg:min-w-[500px] lg:flex-1 lg:basis-0
              `}
              >
                <div className="relative">
                  <Icon
                    symbol="search"
                    className={`
                      absolute top-1/2 left-2 -translate-y-1/2
                      text-muted-foreground
                    `}
                  />
                  <Input
                    placeholder={t("movements.header.search_placeholder")}
                    className="pl-10"
                    value={searchQuery}
                    onChange={(event) => {
                      setSearchQuery(event.target.value);
                      setCurrentPage(1);
                    }}
                  />
                </div>
              </div>
            </div>
            {/* table */}
            <Table className="rounded-2xl">
              <TableHeader>
                <TableRow className="bg-muted">
                  <TableHead className="text-xs font-semibold text-foreground">FECHA</TableHead>
                  <TableHead className="text-xs font-semibold text-foreground">TIPO DE MOVIMIENTO</TableHead>
                  <TableHead className="text-xs font-semibold text-foreground">MONTO</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {!isMovementsLoading && movements.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={3}
                      className="py-8 text-center text-sm text-foreground"
                    >
                      {t("movements.empty", { defaultValue: "No hay movimientos para esta cuenta" })}
                    </TableCell>
                  </TableRow>
                )}
                {movements.map((movement: AccountMovement) => (
                  <TableRow key={movement.id}>
                    <TableCell className="text-sm text-foreground">{movement.date}</TableCell>
                    <TableCell className="text-sm text-foreground">{movement.type}</TableCell>
                    <TableCell className="text-sm text-foreground">{movement.amount}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {/* pagination */}
            {totalPages > 1 && (
              <Pagination className="justify-start">
                <PaginationContent>
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, index) => {
                    const page = index + 1;
                    return (
                      <PaginationItem key={page}>
                        <PaginationLink
                          isActive={page === currentPage}
                          onClick={() => setCurrentPage(page)}
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  })}
                  {totalPages > 5 && (
                    <PaginationItem>
                      <PaginationEllipsis />
                    </PaginationItem>
                  )}
                  {totalPages > 5 && (
                    <PaginationItem>
                      <PaginationLink onClick={() => setCurrentPage(totalPages)}>
                        {totalPages}
                      </PaginationLink>
                    </PaginationItem>
                  )}
                  {currentPage < totalPages && (
                    <PaginationItem>
                      <PaginationNext onClick={() => setCurrentPage(currentPage + 1)} />
                    </PaginationItem>
                  )}
                </PaginationContent>
              </Pagination>
            )}
          </Card>
        </Card>
      </PageContainer>
      {/* Edit Name Dialog */}
      <Dialog open={isEditNameDialogOpen} onOpenChange={setIsEditNameDialogOpen}>
        <DialogContent className="sm:max-w-[640px]">
          <DialogHeader>
            <DialogTitle>{t("accounts.edit_name_dialog.title")}</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <div className="flex flex-col gap-2">
              <Label htmlFor="account-name" className="text-sm text-foreground">
                {t("accounts.edit_name_dialog.label")}
              </Label>
              <Input
                id="account-name"
                value={newAccountName}
                onChange={(e) => setNewAccountName(e.target.value)}
                placeholder={t("accounts.edit_name_dialog.placeholder")}
              />
            </div>
          </DialogBody>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="secondary">
                {t("accounts.edit_name_dialog.cancel")}
              </Button>
            </DialogClose>
            <Button
              variant="default"
              onClick={handleSaveNewName}
              disabled={!newAccountName.trim() || newAccountName === account.name}
            >
              {t("accounts.edit_name_dialog.save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* OTP Confirmation Dialog */}
      <Dialog open={isOtpDialogOpen} onOpenChange={setIsOtpDialogOpen}>
        <DialogContent className="max-w-[610px] gap-12">
          <DialogHeader className="gap-2">
            <DialogTitle>
              {otpAction === "edit" ? t("accounts.otp_dialog.title") : t("accounts.otp_dialog.delete_title")}
            </DialogTitle>
            <p className="text-sm text-foreground">
              {otpAction === "edit" ? t("accounts.otp_dialog.description") : t("accounts.otp_dialog.delete_description")}
            </p>
          </DialogHeader>
          <InputOTP
            maxLength={6}
            value={otpCode}
            onChange={setOtpCode}
          >
            <InputOTPGroup className="w-full gap-2">
              <InputOTPSlot index={0} className="h-10 flex-1" />
              <InputOTPSlot index={1} className="h-10 flex-1" />
              <InputOTPSlot index={2} className="h-10 flex-1" />
              <InputOTPSlot index={3} className="h-10 flex-1" />
              <InputOTPSlot index={4} className="h-10 flex-1" />
              <InputOTPSlot index={5} className="h-10 flex-1" />
            </InputOTPGroup>
          </InputOTP>
          <DialogFooter className="gap-6">
            <Button
              variant="secondary"
              onClick={handleOtpCancel}
            >
              {t("accounts.otp_dialog.cancel")}
            </Button>
            <Button
              variant="default"
              onClick={handleOtpSubmit}
              disabled={otpCode.length !== 6}
            >
              {t("accounts.otp_dialog.confirm")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Delete Account Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className={`
          gap-12
          sm:max-w-[640px]
        `}
        >
          <DialogHeader>
            <DialogTitle>{t("accounts.delete_dialog.title")}</DialogTitle>
            <p className="text-sm text-foreground">
              {t("accounts.delete_dialog.warning_message")}
            </p>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="secondary">
                {t("accounts.delete_dialog.cancel")}
              </Button>
            </DialogClose>
            <Button
              variant="destructive-medium"
              onClick={handleConfirmDelete}
            >
              {t("accounts.delete_dialog.continue")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Transfer Dialog */}
      <Dialog open={isTransferDialogOpen} onOpenChange={setIsTransferDialogOpen}>
        <DialogContent className="sm:max-w-[640px]">
          <DialogHeader>
            <DialogTitle>
              {t("accounts.transfer_dialog.title", {
                accountName: account.name || "",
              })}
            </DialogTitle>
            <DialogDescription>
              {t("accounts.transfer_dialog.description")}
            </DialogDescription>
          </DialogHeader>
          <DialogBody className="flex flex-col gap-6">
            {/* amount */}
            <div className="flex flex-col gap-2">
              <Label
                htmlFor="transfer-amount"
                className="text-xs text-foreground"
              >
                {t("accounts.transfer_dialog.amount")}
              </Label>
              <AmountInputContainer className="gap-2">
                <AmountInputFlag locale="es-CO" currencySymbol="" />
                <AmountInput
                  id="transfer-amount"
                  value={transferAmount}
                  onValueChange={(value) => setTransferAmount(value !== undefined ? String(value) : "")}
                  locale="es-CO"
                  placeholder="0.00"
                  minimumFractionDigits={2}
                  maximumFractionDigits={2}
                />
                <AmountInputAction
                  onClick={() => {
                    // Extract numeric value from balance (e.g., "$90.784.510,46" -> "90784510.46")
                    const numericBalance = account.balance.replace(/[^0-9,]/g, "").replace(".", "").replace(",", ".");
                    setTransferAmount(numericBalance);
                  }}
                >
                  {t("accounts.transfer_dialog.use_all")}
                </AmountInputAction>
              </AmountInputContainer>
              <p className="text-xs text-foreground">
                {t("accounts.transfer_dialog.available_balance")}: {account.balance}
              </p>
            </div>
            {/* to account */}
            <Combobox
              alwaysShowPlaceholder
              valuePosition="right"
              selectedFeedback="check"
              icon="swap_horiz"
              value={transferToAccountId || ""}
              onValueChange={(value) => setTransferToAccountId(value as string)}
              labels={{
                placeholder: t("accounts.transfer_dialog.to_account"),
              }}
              options={transferAccounts
                .filter((acc) => acc.id !== accountId)
                .map((acc) => ({
                  value: acc.id,
                  label: acc.name,
                  supportiveText: `${acc.balance} ${acc.currency}`,
                }))}
              classNames={{
                trigger: "h-10 w-full",
              }}
            />
          </DialogBody>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="secondary">
                {t("accounts.transfer_dialog.cancel")}
              </Button>
            </DialogClose>
            <Button
              variant="default"
              onClick={handleTransferConfirm}
              disabled={!transferToAccountId || !transferAmount || parseFloat(transferAmount) <= 0}
            >
              {t("accounts.transfer_dialog.confirm")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
