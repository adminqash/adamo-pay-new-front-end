import { usePortalContainer } from "@adamosuiteservices/ui/use-portal-container";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
} from "@adamosuiteservices/ui/breadcrumb";
import { Card } from "@adamosuiteservices/ui/card";
import { Badge } from "@adamosuiteservices/ui/badge";
import { Alert, AlertTitle, AlertDescription } from "@adamosuiteservices/ui/alert";
import { Icon } from "@adamosuiteservices/ui/icon";
import { Button } from "@adamosuiteservices/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@adamosuiteservices/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@adamosuiteservices/ui/table";
import { Input } from "@adamosuiteservices/ui/input";
import { Label } from "@adamosuiteservices/ui/label";
import { RadioGroup, RadioGroupItem } from "@adamosuiteservices/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@adamosuiteservices/ui/select";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@adamosuiteservices/ui/input-otp";
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
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
} from "@adamosuiteservices/ui/pagination";
import { Combobox } from "@adamosuiteservices/ui/combobox";
import { Popover, PopoverContent, PopoverAnchor } from "@adamosuiteservices/ui/popover";
import { Calendar } from "@adamosuiteservices/ui/calendar";
import { Checkbox } from "@adamosuiteservices/ui/checkbox";
import type { DateRange } from "react-day-picker";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import { Link, useParams, useNavigate } from "react-router";
import { PageContainer } from "@/features/common/components/layout/page-container";
import { CountryFlag } from "@/features/common/components/flags/country-flag";
import { useCountry } from "@/features/common/contexts/use-country";
import { PermissionGate } from "@/features/auth/application/components/permission-gate";
import { PERMISSIONS } from "@/features/auth/domain/permissions";
import {
  canonicalizeDocumentType,
  DOCUMENT_TYPE_LABELS,
  documentTypeFromLabel,
} from "@/lib/document-type";
import { useSourceCatalog } from "@/features/source/application/hooks/use-source-catalog";
import { EXPORT_DATA } from "@/features/auth/domain/permission-ui";
import { CreditCard, type CreditCardData } from "../components/credit-card";
import { useState, useRef, useEffect, useMemo } from "react";
import { useBeneficiaryDetail, useBeneficiaryTransactions, useUpdateBeneficiary } from "../hooks/use-beneficiaries";
import { usePaymentsRealtime } from "@/features/transactions/application/hooks/use-payments-realtime";
import { buildBeneficiaryTransactionListParams } from "../utils/beneficiary-filters.utils";

const BENEFICIARIES_QUERY_KEY = ["beneficiaries"];

export function BeneficiaryDetailPage() {
  const { t } = useTranslation("beneficiaries");
  const { beneficiaryId } = useParams();
  const navigate = useNavigate();
  const { currencyUpper, locale: moneyLocale } = useCountry();
  const { documentTypes } = useSourceCatalog("beneficiaries");
  const [activeTab, setActiveTab] = useState("physical");
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftButton, setShowLeftButton] = useState(false);
  const [showRightButton, setShowRightButton] = useState(false);

  const { beneficiary: fetchedBeneficiary, isLoading: isBeneficiaryLoading, refetch: refetchBeneficiary } = useBeneficiaryDetail(beneficiaryId ?? "");
  usePaymentsRealtime({ extraInvalidateKeys: [BENEFICIARIES_QUERY_KEY] });
  const updateBeneficiary = useUpdateBeneficiary();
  const beneficiary = fetchedBeneficiary;

  const [transactionSearch, setTransactionSearch] = useState("");
  const [transactionPage, setTransactionPage] = useState(1);
  const transactionPageSize = 15;

  const transactionListParams = useMemo(
    () => buildBeneficiaryTransactionListParams({
      search: transactionSearch,
      page: transactionPage,
      limit: transactionPageSize,
    }),
    [transactionSearch, transactionPage],
  );

  const {
    transactions,
    totalCount: transactionTotalCount,
    isLoading: isTransactionsLoading,
  } = useBeneficiaryTransactions(beneficiaryId ?? "", transactionListParams);

  const transactionTotalPages = Math.max(1, Math.ceil(transactionTotalCount / transactionPageSize));

  useEffect(() => {
    setTransactionPage(1);
  }, [transactionSearch]);

  // create card dialog state
  const [isCreateCardDialogOpen, setIsCreateCardDialogOpen] = useState(false);
  const [cardType, setCardType] = useState("physical");
  const [cardFormData, setCardFormData] = useState({
    alias: "",
    monthlyAmount: "",
    deliveryAddress: "",
    city: "",
    country: "",
    state: "",
    postalCode: "",
  });

  // OTP dialog state
  const [isOtpDialogOpen, setIsOtpDialogOpen] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [otpAction, setOtpAction] = useState<"create-card" | "edit-beneficiary">("create-card");

  // edit beneficiary dialog state
  const [isEditBeneficiaryDialogOpen, setIsEditBeneficiaryDialogOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    firstName: "",
    lastName: "",
    idType: "CC",
    idNumber: "",
  });

  // export dialog state
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [exportDateFilter, setExportDateFilter] = useState("all");
  const [exportStatusFilter, setExportStatusFilter] = useState<string[]>(["all"]);
  const [exportFormatCSV, setExportFormatCSV] = useState(false);
  const [exportFormatPDF, setExportFormatPDF] = useState(false);
  const [exportCustomDateRange, setExportCustomDateRange] = useState<DateRange>({
    from: undefined,
    to: undefined,
  });
  const [exportTempDateRange, setExportTempDateRange] = useState<DateRange>({
    from: undefined,
    to: undefined,
  });
  const [isExportCalendarOpen, setIsExportCalendarOpen] = useState(false);
  const exportDateComboboxRef = useRef<HTMLButtonElement>(null);

  // credit cards state to allow adding new cards
  const [cards, setCards] = useState<CreditCardData[]>([
    {
      id: "1",
      name: "Nombre de la tarjeta",
      type: "physical",
      balance: 0,
      currency: currencyUpper,
      cardNumber: "1234567890120121",
      status: "reported",
      gradient: "linear-gradient(147.63deg, rgb(14, 147, 132) 0%, rgb(159, 212, 206) 100%)",
    },
    {
      id: "2",
      name: "Tarjeta corporativa",
      type: "physical",
      balance: 1500000,
      currency: currencyUpper,
      cardNumber: "9876543210984567",
      status: "active",
      gradient: "linear-gradient(147.63deg, rgb(14, 147, 132) 0%, rgb(159, 212, 206) 100%)",
    },
    {
      id: "3",
      name: "Tarjeta expirada",
      type: "physical",
      balance: 500000,
      currency: currencyUpper,
      cardNumber: "5555444433332222",
      status: "expired",
      gradient: "linear-gradient(147.63deg, rgb(14, 147, 132) 0%, rgb(159, 212, 206) 100%)",
    },
    {
      id: "4",
      name: "Tarjeta temporal",
      type: "physical",
      balance: 250000,
      currency: currencyUpper,
      cardNumber: "4444333322221111",
      status: "frozen",
      gradient: "linear-gradient(147.63deg, rgb(14, 147, 132) 0%, rgb(159, 212, 206) 100%)",
    },
  ]);

  const sidebarTopBarPortal = usePortalContainer("[data-slot='sidebar-top-bar-portal']");

  // Handle scroll to check button visibility
  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      const isAtStart = scrollLeft <= 10;
      const isAtEnd = scrollLeft >= scrollWidth - clientWidth - 72 - 5; // 72px margin + 5px threshold
      setShowLeftButton(!isAtStart);
      setShowRightButton(!isAtEnd);
    }
  };

  // Scroll left
  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft: currentScroll } = scrollContainerRef.current;
      
      // If we're close to the start, scroll all the way to the beginning
      if (currentScroll <= 334) {
        scrollContainerRef.current.scrollTo({
          left: 0,
          behavior: "smooth",
        });
      } else {
        scrollContainerRef.current.scrollBy({
          left: -334, // Card width (318px) + gap (16px)
          behavior: "smooth",
        });
      }
    }
  };

  // Scroll right
  const scrollRight = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      const remainingScroll = scrollWidth - clientWidth - scrollLeft;
      
      // If we're close to the end, scroll to show last card fully (accounting for margin)
      if (remainingScroll <= 334 + 72) {
        scrollContainerRef.current.scrollTo({
          left: scrollWidth - clientWidth - 72, // Stop before the margin
          behavior: "smooth",
        });
      } else {
        scrollContainerRef.current.scrollBy({
          left: 334, // Card width (318px) + gap (16px)
          behavior: "smooth",
        });
      }
    }
  };

  // Get badge variant based on transaction status
  const getTransactionStatusVariant = (status: string): "success-medium" | "waiting-medium" | "destructive-medium" => {
    switch (status) {
      case "completed":
        return "success-medium";
      case "pending":
        return "waiting-medium";
      case "failed":
      default:
        return "destructive-medium";
    }
  };

  /**
   * map id type full name to code
   */
  const getIdTypeCode = (idTypeName: string): string => {
    return documentTypeFromLabel(idTypeName);
  };

  /**
   * map id type code to full name
   */
  const getIdTypeName = (idType: string): string => {
    return DOCUMENT_TYPE_LABELS[idType] || idType;
  };

  /**
   * handle confirm card creation - opens OTP dialog
   */
  const handleConfirmCardCreation = () => {
    setIsCreateCardDialogOpen(false);
    // Small delay to allow create card dialog to close before opening OTP dialog
    setTimeout(() => {
      setOtpAction("create-card");
      setIsOtpDialogOpen(true);
    }, 200);
  };

  /**
   * check if beneficiary form has changes
   */
  const hasNoBeneficiaryChanges = () => {
    if (!beneficiary) return true;
    return (
      editFormData.firstName === beneficiary.firstName
      && editFormData.lastName === beneficiary.lastName
      && canonicalizeDocumentType(editFormData.idType) === canonicalizeDocumentType(beneficiary.identificationDocument.type)
      && editFormData.idNumber === beneficiary.identificationDocument.number
    );
  };

  /**
   * handle confirm beneficiary edit - opens OTP dialog
   */
  const handleConfirmBeneficiaryEdit = () => {
    setIsEditBeneficiaryDialogOpen(false);
    // Small delay to allow edit dialog to close before opening OTP dialog
    setTimeout(() => {
      setOtpAction("edit-beneficiary");
      setIsOtpDialogOpen(true);
    }, 200);
  };

  /**
   * handle OTP submit - handles both card creation and beneficiary edit
   */
  const handleOtpSubmit = () => {
    if (otpAction === "create-card") {
      // Generate a new card with the form data
      const newCard: CreditCardData = {
        id: Date.now().toString(),
        name: cardFormData.alias,
        type: cardType as "physical" | "virtual",
        balance: cardType === "virtual" ? parseFloat(cardFormData.monthlyAmount) || 0 : 0,
        currency: currencyUpper,
        cardNumber: Math.random().toString().slice(2, 18),
        status: "active",
        gradient: cardType === "physical" 
          ? "linear-gradient(147.63deg, rgb(14, 147, 132) 0%, rgb(159, 212, 206) 100%)"
          : "linear-gradient(147.63deg, rgb(6, 59, 53) 0%, rgb(62, 169, 157) 100%)",
      };

      // Add the new card to the cards array
      setCards([...cards, newCard]);

      // Reset card form
      setTimeout(() => {
        setCardType("physical");
        setCardFormData({
          alias: "",
          monthlyAmount: "",
          deliveryAddress: "",
          city: "",
          country: "",
          state: "",
          postalCode: "",
        });
      }, 200);
    } else if (otpAction === "edit-beneficiary" && beneficiary && beneficiaryId) {
      updateBeneficiary.mutate({
        beneficiaryId,
        firstName: editFormData.firstName,
        lastName: editFormData.lastName,
        idType: editFormData.idType,
        idNumber: editFormData.idNumber,
        totp: otpCode,
      }, {
        onSuccess: () => {
          void refetchBeneficiary();
        },
      });
    }

    // Close OTP dialog and reset states
    setIsOtpDialogOpen(false);
    setOtpCode("");
  };

  /**
   * update card status
   */
  const handleUpdateCardStatus = (cardId: string, newStatus: CreditCardData["status"]) => {
    setCards((prevCards) =>
      prevCards.map((card) =>
        card.id === cardId ? { ...card, status: newStatus } : card,
      ),
    );
  };

  /**
   * format export custom date range for display
   */
  const formatExportCustomDateRange = () => {
    if (exportCustomDateRange.from && exportCustomDateRange.to) {
      return `${format(exportCustomDateRange.from, "dd/MM/yyyy", { locale: es })} - ${format(exportCustomDateRange.to, "dd/MM/yyyy", { locale: es })}`;
    }
    return "";
  };

  /**
   * handle export date filter change
   */
  const handleExportDateFilterChange = (value: string | string[]) => {
    const newValue = value as string;
    setExportDateFilter(newValue);
    if (newValue === "custom") {
      setExportTempDateRange(exportCustomDateRange);
      setIsExportCalendarOpen(true);
    } else {
      setIsExportCalendarOpen(false);
    }
  };

  /**
   * handle apply export date range
   */
  const handleApplyExportDateRange = () => {
    setExportCustomDateRange(exportTempDateRange);
    setIsExportCalendarOpen(false);
  };

  /**
   * handle cancel export date range
   */
  const handleCancelExportDateRange = () => {
    setExportTempDateRange(exportCustomDateRange);
    setIsExportCalendarOpen(false);
    if (!exportCustomDateRange.from && !exportCustomDateRange.to) {
      setExportDateFilter("all");
    }
  };

  const filteredCards = cards.filter((card) => {
    if (activeTab === "physical") return card.type === "physical";
    if (activeTab === "virtual") return card.type === "virtual";
    return true;
  });

  // Check scroll buttons visibility on mount and when cards change
  useEffect(() => {
    const checkScrollButtons = () => {
      if (scrollContainerRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
        const isAtStart = scrollLeft <= 10;
        const isAtEnd = scrollLeft >= scrollWidth - clientWidth - 72 - 5; // 72px margin + 5px threshold
        setShowLeftButton(!isAtStart);
        setShowRightButton(!isAtEnd);
      }
    };

    // Small delay to ensure layout is rendered
    const timer = setTimeout(checkScrollButtons, 100);
    return () => clearTimeout(timer);
  }, [filteredCards]);

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
                <Link to="/beneficiaries">{t("beneficiaries.page_title")}</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbItem className="md:hidden">
              <button
                onClick={() => navigate("/beneficiaries")}
                className="flex h-9 w-9 items-center justify-center"
              >
                <BreadcrumbEllipsis />
              </button>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem className="min-w-0">
              <BreadcrumbPage className="truncate">{t("beneficiaries.detail.page_title")}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>,
        sidebarTopBarPortal,
      )}
      <PageContainer>
        {!beneficiary ? (
          <Card className="flex flex-col gap-6 border-neutral-200 p-6">
            <p className="text-sm text-muted-foreground">
              {isBeneficiaryLoading
                ? t("beneficiaries.loading", { defaultValue: "Cargando..." })
                : t("beneficiaries.not_found", { defaultValue: "Beneficiario no encontrado" })}
            </p>
          </Card>
        ) : (
        <Card className="flex flex-col gap-6 border-neutral-200 p-6">
          {/* Header: Name + Badge */}
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex shrink-0 items-center gap-3">
              <div className={`
                flex size-11 shrink-0 items-center justify-center rounded-full
                bg-muted
              `}
              >
                <Icon symbol="account_circle" weight={200} className="text-2xl" />
              </div>
              <p className="text-sm font-bold text-foreground">
                {beneficiary.fullName}
              </p>
            </div>
            {beneficiary.hasUpdates && (
              <Badge
                variant="warning-medium"
                className="h-8 px-2 text-sm leading-5"
              >
                {t("beneficiaries.detail.badge_with_news")}
              </Badge>
            )}
          </div>

          {/* Alert: Pending payments */}
          {beneficiary.hasUpdates && beneficiary.hasPendingPayments && (
            <Alert variant="warning" className="border-0">
              <Icon symbol="error" />
              <AlertTitle>{t("beneficiaries.detail.alert_title")}</AlertTitle>
              <AlertDescription>
                {t("beneficiaries.detail.alert_description")}
              </AlertDescription>
            </Alert>
          )}

          {/* Beneficiary Information Card */}
          <Card className="flex flex-col gap-6 border-0 bg-muted p-6">
            {/* Title + Edit Button */}
            <div className="flex h-5 items-center justify-between">
              <p className="text-sm text-foreground">
                {t("beneficiaries.detail.info_title")}
              </p>
              <PermissionGate permission={PERMISSIONS.BENEFICIARIES_CREATE}>
              <Dialog 
                open={isEditBeneficiaryDialogOpen} 
                onOpenChange={(open) => {
                  setIsEditBeneficiaryDialogOpen(open);
                  // Load current beneficiary data when dialog opens, reset when closes
                  if (open) {
                    setEditFormData({
                      firstName: beneficiary.firstName,
                      lastName: beneficiary.lastName,
                      idType: canonicalizeDocumentType(beneficiary.identificationDocument.type) ?? "CC",
                      idNumber: beneficiary.identificationDocument.number,
                    });
                  } else {
                    setTimeout(() => {
                      setEditFormData({
                        firstName: beneficiary.firstName,
                        lastName: beneficiary.lastName,
                        idType: canonicalizeDocumentType(beneficiary.identificationDocument.type) ?? "CC",
                        idNumber: beneficiary.identificationDocument.number,
                      });
                    }, 200);
                  }
                }}
              >
                <DialogTrigger asChild>
                  <Button variant="outline" size="default">
                    <Icon symbol="edit" />
                    {t("beneficiaries.detail.edit_button")}
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[640px]">
                  <DialogHeader>
                    <DialogTitle>{t("beneficiaries.detail.edit_dialog.title")}</DialogTitle>
                    <DialogDescription>
                      {t("beneficiaries.detail.edit_dialog.description")}
                    </DialogDescription>
                  </DialogHeader>
                  <DialogBody className="flex flex-col gap-6">
                    {/* First name and last name */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col gap-2">
                        <Label>
                          {t("beneficiaries.detail.edit_dialog.first_name_label")}
                        </Label>
                        <Input
                          placeholder={t("beneficiaries.detail.edit_dialog.first_name_placeholder")}
                          value={editFormData.firstName}
                          onChange={(e) => setEditFormData({ ...editFormData, firstName: e.target.value })}
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <Label>
                          {t("beneficiaries.detail.edit_dialog.last_name_label")}
                        </Label>
                        <Input
                          placeholder={t("beneficiaries.detail.edit_dialog.last_name_placeholder")}
                          value={editFormData.lastName}
                          onChange={(e) => setEditFormData({ ...editFormData, lastName: e.target.value })}
                        />
                      </div>
                    </div>

                    {/* ID Type and Number */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col gap-2">
                        <Label>
                          {t("beneficiaries.detail.edit_dialog.id_type_label")}
                        </Label>
                        <Select
                          value={editFormData.idType}
                          onValueChange={(value) => setEditFormData({ ...editFormData, idType: value })}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {documentTypes.map((item) => (
                              <SelectItem key={item.code} value={item.code}>
                                {item.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Label>
                          {t("beneficiaries.detail.edit_dialog.id_number_label")}
                        </Label>
                        <Input
                          placeholder={t("beneficiaries.detail.edit_dialog.id_number_placeholder")}
                          value={editFormData.idNumber}
                          onChange={(e) => setEditFormData({ ...editFormData, idNumber: e.target.value })}
                        />
                      </div>
                    </div>
                  </DialogBody>
                  <DialogFooter>
                    <Button
                      variant="secondary"
                      onClick={() => setIsEditBeneficiaryDialogOpen(false)}
                    >
                      {t("beneficiaries.detail.edit_dialog.cancel")}
                    </Button>
                    <Button
                      variant="default"
                      disabled={
                        !editFormData.firstName
                        || !editFormData.lastName
                        || !editFormData.idNumber
                        || hasNoBeneficiaryChanges()
                      }
                      onClick={handleConfirmBeneficiaryEdit}
                    >
                      {t("beneficiaries.detail.edit_dialog.submit")}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              </PermissionGate>
            </div>

            {/* Info Fields */}
            <Card className="flex flex-col gap-6 border-0 bg-white p-4">
              {/* Full Name Field */}
              <div className="flex h-16 items-center">
                <div className={`
                  flex flex-1 flex-col items-start justify-center gap-0
                `}
                >
                  <div className="flex w-full flex-col items-start gap-2">
                    <p className="text-xs text-foreground-secondary">
                      {t("beneficiaries.detail.full_name_label")}
                    </p>
                    <div className={`
                      flex h-10 w-full items-center justify-center gap-2 pl-2
                    `}
                    >
                      <div className={`
                        flex h-8 min-w-[230px] flex-1 items-center gap-2
                      `}
                      >
                        <Icon
                          symbol="account_circle"
                          className="text-2xl text-foreground"
                        />
                        <p className="text-sm font-semibold text-foreground">
                          {beneficiary.fullName}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ID Type and Number Field */}
              <div className="flex h-16 items-center">
                <div className={`
                  flex flex-1 flex-col items-start justify-center gap-0
                `}
                >
                  <div className="flex w-full flex-col items-start gap-2">
                    <p className="text-xs text-foreground-secondary">
                      {t("beneficiaries.detail.id_type_label")}
                    </p>
                    <div className={`
                      flex h-10 w-full items-center justify-center gap-2 pl-2
                    `}
                    >
                      <div className={`
                        flex h-8 min-w-[230px] flex-1 items-center gap-2
                      `}
                      >
                        <Icon
                          symbol="contacts"
                          className="text-2xl text-foreground"
                        />
                        <p className="text-sm font-semibold text-foreground">
                          {t(`beneficiaries.detail.edit_dialog.id_types.${beneficiary.identificationDocument.type}`)}: {beneficiary.identificationDocument.number}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Account Type and Number Field */}
              <div className="flex min-h-16 items-center">
                <div className={`
                  flex flex-1 flex-col items-start justify-center gap-0
                `}
                >
                  <div className="flex w-full flex-col items-start gap-2">
                    <p className="text-xs text-foreground-secondary">
                      {t("beneficiaries.detail.account_type_label")}
                    </p>
                    <div className={`
                      flex w-full flex-wrap items-center gap-2 pl-2
                    `}
                    >
                      <div className={`
                        flex h-8 min-w-[230px] flex-1 items-center gap-2
                      `}
                      >
                        <Icon
                          symbol="account_balance"
                          className="text-2xl text-foreground"
                        />
                        <p className="text-sm font-semibold text-foreground">
                          {beneficiary.bankAccount.type}. {beneficiary.bankAccount.bank} Nº {beneficiary.bankAccount.number}
                        </p>
                      </div>
                      <Button variant="link" size="sm" asChild>
                        <Link
                          to={`/beneficiaries/${beneficiaryId}/bank-accounts`}
                          className="flex items-center gap-2"
                        >
                          <span>{t("beneficiaries.detail.manage_accounts_link")}</span>
                          <Icon symbol="chevron_right" className="text-2xl" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </Card>

          {/* Total Paid Card */}
          <Card className={`
            flex min-h-[96px] min-w-[230px] flex-col gap-0 border-0
            bg-gradient-to-r from-[#e5f3fa] to-white p-4
          `}
          >
            <div className="flex min-h-[64px] items-center">
              <div className={`
                flex flex-1 flex-col items-start justify-center gap-0
              `}
              >
                <div className="flex w-full flex-col items-start gap-2">
                  <p className="text-xs text-foreground-secondary">
                    {t("beneficiaries.detail.total_paid_label")}
                  </p>
                  <div className="flex w-full flex-wrap items-center gap-4 pl-2">
                    <div className="flex h-8 flex-1 items-center gap-2">
                      <CountryFlag
                        countryCode={beneficiary.totalPaid.countryCode}
                        className="size-6"
                      />
                      <p className="text-sm font-semibold text-foreground">
                        ${beneficiary.totalPaid.amount.toLocaleString(moneyLocale, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {beneficiary.totalPaid.currency}
                      </p>
                    </div>
                    <PermissionGate permission={PERMISSIONS.PAYMENTS_INDIVIDUAL_CREATE}>
                    <Button 
                      variant="secondary" 
                      size="default"
                      onClick={() => navigate(`/beneficiaries/${beneficiaryId}/quick-payment`, { 
                        state: { 
                          beneficiary: {
                            fullName: beneficiary.fullName,
                            bankAccount: beneficiary.bankAccount,
                          },
                        }, 
                      })}
                    >
                      {t("beneficiaries.detail.quick_payment_button")}
                    </Button>
                    </PermissionGate>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Credit Cards Section */}
          <Card className="flex flex-col gap-6 border-0 bg-muted p-6">
            {/* Title + Tabs + Create Button */}
            <div className="flex flex-wrap items-center justify-between gap-y-6">
              <div className="flex items-center gap-8">
                <p className="text-sm text-foreground">
                  {t("beneficiaries.detail.cards_title")}
                </p>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList>
                    <TabsTrigger value="physical">
                      {t("beneficiaries.detail.cards_tab_physical")}
                    </TabsTrigger>
                    <TabsTrigger value="virtual">
                      {t("beneficiaries.detail.cards_tab_virtual")}
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
              <PermissionGate permission={PERMISSIONS.BENEFICIARIES_CREATE}>
              <Dialog 
                open={isCreateCardDialogOpen} 
                onOpenChange={(open) => {
                  setIsCreateCardDialogOpen(open);
                  // Reset form when dialog closes
                  if (!open) {
                    setTimeout(() => {
                      setCardType("physical");
                      setCardFormData({
                        alias: "",
                        monthlyAmount: "",
                        deliveryAddress: "",
                        city: "",
                        country: "",
                        state: "",
                        postalCode: "",
                      });
                    }, 200); // Wait for dialog close animation
                  }
                }}
              >
                <DialogTrigger asChild>
                  <Button variant="link" size="sm" className="h-6 p-0">
                    <Icon symbol="add" className="text-2xl" />
                    {t("beneficiaries.detail.create_card_button")}
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[640px]">
                  <DialogHeader>
                    <DialogTitle>{t("beneficiaries.detail.create_card_dialog.title")}</DialogTitle>
                    <DialogDescription>
                      {t("beneficiaries.detail.create_card_dialog.description")}
                    </DialogDescription>
                  </DialogHeader>
                  <DialogBody className="flex flex-col gap-8">
                    {/* card type radio buttons */}
                    <RadioGroup
                      value={cardType}
                      onValueChange={setCardType}
                      className="flex gap-8"
                    >
                      <div className="flex items-center gap-2">
                        <RadioGroupItem value="physical" id="physical" />
                        <Label
                          htmlFor="physical"
                          className="cursor-pointer text-sm"
                        >
                          {t("beneficiaries.detail.create_card_dialog.card_type_physical")}
                        </Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <RadioGroupItem value="virtual" id="virtual" />
                        <Label
                          htmlFor="virtual"
                          className="cursor-pointer text-sm"
                        >
                          {t("beneficiaries.detail.create_card_dialog.card_type_virtual")}
                        </Label>
                      </div>
                    </RadioGroup>

                    {/* form fields */}
                    {cardType === "physical" ? (
                      /* Physical card fields */
                      <div className="grid grid-cols-2 gap-4">
                        {/* alias - full width */}
                        <div className="col-span-2 flex flex-col gap-2">
                          <Label>
                            {t("beneficiaries.detail.create_card_dialog.card_alias_label")}
                          </Label>
                          <Input
                            placeholder={t("beneficiaries.detail.create_card_dialog.card_alias_placeholder")}
                            value={cardFormData.alias}
                            onChange={(e) => setCardFormData({ ...cardFormData, alias: e.target.value })}
                          />
                        </div>

                        {/* delivery address - full width */}
                        <div className="col-span-2 flex flex-col gap-2">
                          <Label>
                            {t("beneficiaries.detail.create_card_dialog.delivery_address_label")}
                          </Label>
                          <Input
                            placeholder={t("beneficiaries.detail.create_card_dialog.delivery_address_placeholder")}
                            value={cardFormData.deliveryAddress}
                            onChange={(e) => setCardFormData({ ...cardFormData, deliveryAddress: e.target.value })}
                          />
                        </div>

                        {/* city - left column */}
                        <div className="flex min-w-[250px] flex-col gap-2">
                          <Label>
                            {t("beneficiaries.detail.create_card_dialog.city_label")}
                          </Label>
                          <Input
                            placeholder={t("beneficiaries.detail.create_card_dialog.city_placeholder")}
                            value={cardFormData.city}
                            onChange={(e) => setCardFormData({ ...cardFormData, city: e.target.value })}
                          />
                        </div>

                        {/* country - right column */}
                        <div className="flex min-w-[250px] flex-col gap-2">
                          <Label>
                            {t("beneficiaries.detail.create_card_dialog.country_label")}
                          </Label>
                          <Select
                            value={cardFormData.country}
                            onValueChange={(value) => setCardFormData({ ...cardFormData, country: value })}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder={t("beneficiaries.detail.create_card_dialog.country_placeholder")} />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="co">Colombia</SelectItem>
                              <SelectItem value="ar">Argentina</SelectItem>
                              <SelectItem value="mx">México</SelectItem>
                              <SelectItem value="cl">Chile</SelectItem>
                              <SelectItem value="pe">Perú</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {/* state - left column */}
                        <div className="flex min-w-[250px] flex-col gap-2">
                          <Label>
                            {t("beneficiaries.detail.create_card_dialog.state_label")}
                          </Label>
                          <Select
                            value={cardFormData.state}
                            onValueChange={(value) => setCardFormData({ ...cardFormData, state: value })}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder={t("beneficiaries.detail.create_card_dialog.state_placeholder")} />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="bogota">Bogotá D.C.</SelectItem>
                              <SelectItem value="antioquia">Antioquia</SelectItem>
                              <SelectItem value="valle">Valle del Cauca</SelectItem>
                              <SelectItem value="cundinamarca">Cundinamarca</SelectItem>
                              <SelectItem value="atlantico">Atlántico</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {/* postal code - right column */}
                        <div className="flex min-w-[250px] flex-col gap-2">
                          <Label>
                            {t("beneficiaries.detail.create_card_dialog.postal_code_label")}
                          </Label>
                          <Input
                            placeholder={t("beneficiaries.detail.create_card_dialog.postal_code_placeholder")}
                            value={cardFormData.postalCode}
                            onChange={(e) => setCardFormData({ ...cardFormData, postalCode: e.target.value })}
                          />
                        </div>
                      </div>
                    ) : (
                      /* Virtual card fields */
                      <div className="flex gap-4">
                        {/* alias - left side */}
                        <div className={`
                          flex min-w-[250px] flex-1 flex-col gap-2
                        `}
                        >
                          <Label>
                            {t("beneficiaries.detail.create_card_dialog.card_alias_label")}
                          </Label>
                          <Input
                            placeholder={t("beneficiaries.detail.create_card_dialog.card_alias_placeholder")}
                            value={cardFormData.alias}
                            onChange={(e) => setCardFormData({ ...cardFormData, alias: e.target.value })}
                          />
                        </div>

                        {/* monthly amount - right side */}
                        <div className={`
                          flex min-w-[250px] flex-1 flex-col gap-2
                        `}
                        >
                          <Label>
                            {t("beneficiaries.detail.create_card_dialog.monthly_amount_label")}
                          </Label>
                          <Input
                            placeholder={t("beneficiaries.detail.create_card_dialog.monthly_amount_placeholder")}
                            value={cardFormData.monthlyAmount}
                            onChange={(e) => setCardFormData({ ...cardFormData, monthlyAmount: e.target.value })}
                          />
                        </div>
                      </div>
                    )}
                  </DialogBody>
                  <DialogFooter>
                    <Button
                      variant="secondary"
                      onClick={() => {
                        setIsCreateCardDialogOpen(false);
                      }}
                    >
                      {t("beneficiaries.detail.create_card_dialog.cancel")}
                    </Button>
                    <Button
                      variant="default"
                      disabled={
                        cardType === "physical"
                          ? !cardFormData.alias
                          || !cardFormData.deliveryAddress
                          || !cardFormData.city
                          || !cardFormData.country
                          || !cardFormData.state
                          || !cardFormData.postalCode
                          : !cardFormData.alias || !cardFormData.monthlyAmount
                      }
                      onClick={handleConfirmCardCreation}
                    >
                      {t("beneficiaries.detail.create_card_dialog.submit")}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              </PermissionGate>
            </div>

            {/* Credit Cards Grid */}
            <div className="relative h-[232px]">
              {filteredCards.length === 0 ? (
                /* Empty state */
                <div className={`
                  flex h-full flex-col items-center justify-center gap-7
                  rounded-3xl bg-white
                `}
                >
                  <div className={`
                    flex size-11 items-center justify-center rounded-full
                    bg-primary-50
                  `}
                  >
                    <Icon symbol="add_card" className="text-2xl text-primary" />
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <p className="text-sm text-foreground-secondary">
                      {t("beneficiaries.detail.cards_empty_message")}
                    </p>
                    <PermissionGate permission={PERMISSIONS.BENEFICIARIES_CREATE}>
                    <Button 
                      variant="link" 
                      size="sm" 
                      className="h-6 p-0"
                      onClick={() => {
                        setCardType(activeTab); // Set card type based on active tab
                        setIsCreateCardDialogOpen(true);
                      }}
                    >
                      {t("beneficiaries.detail.cards_empty_action")}
                    </Button>
                    </PermissionGate>
                  </div>
                </div>
              ) : (
                <>
                  {/* Left gradient overlay */}
                  {showLeftButton && (
                    <div className={`
                      pointer-events-none absolute top-0 left-0 z-[15] h-full
                      w-[72px] bg-gradient-to-r from-neutral-50 to-transparent
                    `}
                    />
                  )}
                  
                  {/* Right gradient overlay */}
                  {showRightButton && (
                    <div className={`
                      pointer-events-none absolute top-0 right-0 z-[15] h-full
                      w-[72px] bg-gradient-to-l from-neutral-50 to-transparent
                    `}
                    />
                  )}

                  {/* Scroll container - horizontal scroll with snap */}
                  <div
                    ref={scrollContainerRef}
                    onScroll={handleScroll}
                    className={`
                      scrollbar-hide flex h-full snap-x snap-mandatory
                      items-start gap-4 overflow-x-auto scroll-smooth
                    `}
                    style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                  >
                    {filteredCards.map((card, index) => (
                      <div
                        key={card.id}
                        className={`
                          group relative shrink-0 transition-all
                          ${index === 0 ? "snap-start" : index === filteredCards.length - 1 ? `
                            mr-[72px] snap-end
                          ` : "snap-center"}
                        `}
                        style={{ zIndex: index + 1 }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.zIndex = "10";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.zIndex = (index + 1).toString();
                        }}
                      >
                        <CreditCard 
                          card={card} 
                          beneficiaryId={beneficiaryId || ""} 
                          onUpdateCardStatus={handleUpdateCardStatus}
                        />
                      </div>
                    ))}
                  </div>

                  {/* Left navigation button */}
                  {showLeftButton && (
                    <Button
                      onClick={scrollLeft}
                      variant="outline"
                      size="icon"
                      className={`
                        absolute top-1/2 left-0 z-20 hidden -translate-y-1/2
                        rounded-xl
                        md:flex
                      `}
                      aria-label="Scroll left"
                    >
                      <Icon symbol="chevron_left" className="text-2xl" />
                    </Button>
                  )}

                  {/* Right navigation button */}
                  {showRightButton && (
                    <Button
                      onClick={scrollRight}
                      variant="outline"
                      size="icon"
                      className={`
                        absolute top-1/2 right-0 z-20 hidden -translate-y-1/2
                        rounded-xl
                        md:flex
                      `}
                      aria-label="Scroll right"
                    >
                      <Icon symbol="chevron_right" className="text-2xl" />
                    </Button>
                  )}
                </>
              )}
            </div>
          </Card>

          {/* Transactions Section */}
          <div className={`
            flex flex-col gap-6 rounded-3xl border border-border bg-white p-6
          `}
          >
            {/* Header + Search */}
            <div className="flex flex-wrap items-center gap-6">
              <div className="flex min-w-[220px] flex-1 items-center gap-4">
                <p className="text-sm font-semibold text-foreground">
                  {t("beneficiaries.detail.transactions_title", { count: transactionTotalCount })}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <PermissionGate permission={[...EXPORT_DATA]} mode="any">
                <Dialog open={isExportDialogOpen} onOpenChange={setIsExportDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="secondary" size="default">
                      {t("beneficiaries.detail.transactions_export_button")}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[640px]">
                    <DialogHeader>
                      <DialogTitle>{t("beneficiaries.detail.export_dialog.title")}</DialogTitle>
                      <p className="mt-2 text-sm text-foreground">{t("beneficiaries.detail.export_dialog.description")}</p>
                    </DialogHeader>
                    <DialogBody className="flex flex-col gap-8">
                      {/* filters */}
                      <div className="flex gap-4">
                        {/* date filter */}
                        <div className="flex-1">
                          <Combobox
                            ref={exportDateComboboxRef}
                            alwaysShowPlaceholder
                            valuePosition="right"
                            selectedFeedback="check"
                            icon="calendar_today"
                            options={[
                              { value: "all", label: t("beneficiaries.detail.export_dialog.date_all") },
                              { value: "today", label: t("beneficiaries.detail.export_dialog.date_today") },
                              { value: "week", label: t("beneficiaries.detail.export_dialog.date_week") },
                              { value: "month", label: t("beneficiaries.detail.export_dialog.date_month") },
                              { value: "custom", label: exportDateFilter === "custom" && exportCustomDateRange.from && exportCustomDateRange.to ? formatExportCustomDateRange() : t("beneficiaries.detail.export_dialog.date_custom") },
                            ]}
                            value={exportDateFilter}
                            onValueChange={handleExportDateFilterChange}
                            labels={{
                              placeholder: t("beneficiaries.detail.export_dialog.date_filter"),
                            }}
                            classNames={{
                              trigger: "h-10 w-full",
                            }}
                          />
                          
                          {/* Custom date range popover */}
                          <Popover open={isExportCalendarOpen} onOpenChange={setIsExportCalendarOpen}>
                            <PopoverAnchor virtualRef={exportDateComboboxRef as React.RefObject<Element>} />
                            <PopoverContent className="w-auto p-0" align="start">
                              <div className="flex flex-col gap-4 p-4">
                                <Calendar
                                  mode="range"
                                  selected={exportTempDateRange}
                                  onSelect={(range) => setExportTempDateRange(range || { from: undefined, to: undefined })}
                                  locale={es}
                                />
                                <div className={`
                                  flex justify-end gap-2 border-t pt-4
                                `}
                                >
                                  <Button variant="secondary" size="sm" onClick={handleCancelExportDateRange}>
                                    {t("beneficiaries.detail.export_dialog.cancel_date")}
                                  </Button>
                                  <Button 
                                    variant="default" 
                                    size="sm" 
                                    onClick={handleApplyExportDateRange}
                                    disabled={!exportTempDateRange.from || !exportTempDateRange.to}
                                  >
                                    {t("beneficiaries.detail.export_dialog.apply_date")}
                                  </Button>
                                </div>
                              </div>
                            </PopoverContent>
                          </Popover>
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
                              { value: "all", label: t("beneficiaries.detail.export_dialog.status_all") },
                              { value: "pending", label: t("beneficiaries.detail.transactions_status.pending") },
                              { value: "completed", label: t("beneficiaries.detail.transactions_status.completed") },
                              { value: "failed", label: t("beneficiaries.detail.transactions_status.failed") },
                            ]}
                            value={exportStatusFilter}
                            onValueChange={(value) => setExportStatusFilter(value as string[])}
                            labels={{
                              placeholder: t("beneficiaries.detail.export_dialog.status_filter"),
                            }}
                            classNames={{
                              trigger: "h-10 w-full",
                            }}
                          />
                        </div>
                      </div>

                      {/* file type checkboxes */}
                      <div className="flex items-center gap-8">
                        <p className="text-sm text-foreground">{t("beneficiaries.detail.export_dialog.file_type_label")}</p>
                        <div className="flex items-center gap-3">
                          <Checkbox
                            id="csv"
                            checked={exportFormatCSV}
                            onCheckedChange={(checked) => setExportFormatCSV(checked as boolean)}
                          />
                          <Label
                            htmlFor="csv"
                            className="cursor-pointer text-sm"
                          >
                            {t("beneficiaries.detail.export_dialog.csv_excel")}
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
                            className="cursor-pointer text-sm"
                          >
                            {t("beneficiaries.detail.export_dialog.pdf")}
                          </Label>
                        </div>
                      </div>
                    </DialogBody>
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button variant="secondary">
                          {t("beneficiaries.detail.export_dialog.cancel")}
                        </Button>
                      </DialogClose>
                      <Button 
                        variant="default" 
                        disabled={!exportFormatCSV && !exportFormatPDF}
                      >
                        {t("beneficiaries.detail.export_dialog.export")}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                </PermissionGate>
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
                    placeholder={t("beneficiaries.detail.transactions_search_placeholder")}
                    className="h-10 pl-10"
                    value={transactionSearch}
                    onChange={(e) => setTransactionSearch(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Transactions Table */}
            <Table className="rounded-2xl">
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs font-semibold uppercase">
                    {t("beneficiaries.detail.transactions_table.date")}
                  </TableHead>
                  <TableHead className="text-xs font-semibold uppercase">
                    {t("beneficiaries.detail.transactions_table.amount")}
                  </TableHead>
                  <TableHead className="text-xs font-semibold uppercase">
                    {t("beneficiaries.detail.transactions_table.reference")}
                  </TableHead>
                  <TableHead className="text-xs font-semibold uppercase">
                    {t("beneficiaries.detail.transactions_table.status")}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isTransactionsLoading && transactions.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-center text-sm text-muted-foreground"
                    >
                      {t("beneficiaries.loading", { defaultValue: "Cargando..." })}
                    </TableCell>
                  </TableRow>
                ) : transactions.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-center text-sm text-muted-foreground"
                    >
                      {t("beneficiaries.detail.transactions_empty", { defaultValue: "No hay transacciones" })}
                    </TableCell>
                  </TableRow>
                ) : transactions.map((transaction) => (
                  <TableRow
                    key={transaction.id}
                    className={`
                      cursor-pointer transition-colors
                      hover:bg-muted
                    `}
                  >
                    <TableCell>
                      {transaction.date}
                    </TableCell>
                    <TableCell>
                      {transaction.amount}
                    </TableCell>
                    <TableCell>
                      {transaction.reference}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={getTransactionStatusVariant(transaction.status)}
                        className={`
                          h-8 px-2 text-sm leading-5
                          ${transaction.status === "pending" ? "bg-muted" : ""}
                        `}
                      >
                        {t(`beneficiaries.detail.transactions_status.${transaction.status}`)}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Pagination */}
            {transactionTotalPages > 1 && (
            <Pagination className="justify-start">
              <PaginationContent>
                {Array.from({ length: Math.min(transactionTotalPages, 5) }, (_, index) => {
                  const page = index + 1;
                  return (
                    <PaginationItem key={page}>
                      <PaginationLink
                        isActive={page === transactionPage}
                        onClick={() => setTransactionPage(page)}
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  );
                })}
                {transactionTotalPages > 5 && (
                  <PaginationItem>
                    <PaginationEllipsis />
                  </PaginationItem>
                )}
                {transactionTotalPages > 5 && (
                  <PaginationItem>
                    <PaginationLink onClick={() => setTransactionPage(transactionTotalPages)}>
                      {transactionTotalPages}
                    </PaginationLink>
                  </PaginationItem>
                )}
                {transactionPage < transactionTotalPages && (
                  <PaginationItem>
                    <PaginationNext onClick={() => setTransactionPage(transactionPage + 1)}>
                      {t("beneficiaries.detail.transactions_pagination.next")}
                    </PaginationNext>
                  </PaginationItem>
                )}
              </PaginationContent>
            </Pagination>
            )}
          </div>
        </Card>
        )}
      </PageContainer>

      {/* OTP confirmation dialog */}
      <Dialog open={isOtpDialogOpen} onOpenChange={setIsOtpDialogOpen}>
        <DialogContent className="max-w-[610px] gap-12">
          <DialogHeader className="gap-2">
            <DialogTitle>
              {otpAction === "create-card" 
                ? t("beneficiaries.detail.otp_dialog.create_card_title")
                : t("beneficiaries.detail.otp_dialog.edit_beneficiary_title")}
            </DialogTitle>
            <DialogDescription>
              {otpAction === "create-card"
                ? t("beneficiaries.detail.otp_dialog.create_card_description")
                : t("beneficiaries.detail.otp_dialog.edit_beneficiary_description")}
            </DialogDescription>
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
              onClick={() => {
                setIsOtpDialogOpen(false);
                setOtpCode("");
              }}
            >
              {t("beneficiaries.detail.otp_dialog.cancel")}
            </Button>
            <Button 
              variant="default" 
              onClick={handleOtpSubmit}
              disabled={otpCode.length !== 6}
            >
              {t("beneficiaries.detail.otp_dialog.confirm")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
