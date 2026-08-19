import { Alert, AlertTitle, AlertDescription } from "@adamosuiteservices/ui/alert";
import { Badge } from "@adamosuiteservices/ui/badge";
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
import { Card } from "@adamosuiteservices/ui/card";
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
import { Icon } from "@adamosuiteservices/ui/icon";
import { Input } from "@adamosuiteservices/ui/input";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@adamosuiteservices/ui/input-otp";
import { Label } from "@adamosuiteservices/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@adamosuiteservices/ui/select";
import {
  SelectableCard,
  SelectableCardGroup,
} from "@adamosuiteservices/ui/selectable-card";
import { ToastManager } from "@adamosuiteservices/ui/toaster";
import { usePortalContainer } from "@adamosuiteservices/ui/use-portal-container";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import { useParams, useNavigate, Link } from "react-router";
import type { BatchTransactionDetail } from "@/features/batches/application/entities/batch-transaction-detail.entity";
import { AddBankAccountDialog } from "@/features/beneficiaries/application/components/add-bank-account-dialog";
import { PageContainer } from "@/features/common/components/layout/page-container";
import { useCountry } from "@/features/common/contexts/use-country";
import { CorrectPaymentMapper } from "@/features/transactions/api/mappers/correct-payment.mapper";
import { PaymentsService } from "@/features/transactions/api/services/payments.service";
import { useCorrectPayment } from "@/features/transactions/application/hooks/use-payment-mutations";
import { withCountryScope } from "@/lib/country/country-code";
import {
  DOCUMENT_TYPE_CODES,
  DOCUMENT_TYPE_LABELS,
  documentTypeFromLabel,
} from "@/lib/document-type";
import { queryKeys } from "@/lib/query/query-keys";
import {
  formatCurrencyDisplay,
  minorToMajor,
  parseCurrencyToMinor,
} from "@/lib/money/money";

function RiskLevel({ level }: { level: "low" | "medium" | "high" }) {
  const config = {
    low: { label: "Riesgo bajo", className: "bg-success-100 text-success-700" },
    medium: { label: "Riesgo medio", className: "bg-warning-100 text-warning-700" },
    high: { label: "Riesgo alto", className: "bg-error-100 text-error-700" },
  };

  const { label, className } = config[level];

  return (
    <div className={`
      inline-flex items-center gap-2 rounded-full px-3 py-1
      ${className}
    `}
    >
      <div className="size-2 rounded-full bg-current" />
      <span className="text-sm font-semibold">{label}</span>
    </div>
  );
}

/**
 * correct payment page
 *
 * allows users to correct and resend returned/rejected payments
 */
export const CorrectPaymentPage = () => {
  const { t } = useTranslation(["transactions", "batches"]);
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const sidebarTopBarPortal = usePortalContainer("[data-slot='sidebar-top-bar-portal']");
  const correctPayment = useCorrectPayment();
  const { countryCode, currencyUpper } = useCountry();

  const paymentQuery = useQuery({
    queryKey: withCountryScope(queryKeys.payments.detail(id ?? ""), countryCode),
    queryFn: async() => {
      const result = await PaymentsService.getDetailDto(id!);
      return result.data ?? null;
    },
    enabled: Boolean(id),
  });

  const [editedTransaction, setEditedTransaction] = useState<BatchTransactionDetail | null>(null);
  const mappedTransaction = paymentQuery.data
    ? CorrectPaymentMapper.toViewModel(paymentQuery.data)
    : null;
  const transaction = editedTransaction ?? mappedTransaction;

  // Beneficiary dialog state
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [documentType, setDocumentType] = useState("");
  const [documentNumber, setDocumentNumber] = useState("");
  const [originalFirstName, setOriginalFirstName] = useState("");
  const [originalLastName, setOriginalLastName] = useState("");
  const [originalDocumentType, setOriginalDocumentType] = useState("");
  const [originalDocumentNumber, setOriginalDocumentNumber] = useState("");

  // Payment dialog state
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [accountType, setAccountType] = useState("");
  const [bank, setBank] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [originalPaymentAmount, setOriginalPaymentAmount] = useState("");
  const [originalAccountType, setOriginalAccountType] = useState("");
  const [originalBank, setOriginalBank] = useState("");
  const [originalAccountNumber, setOriginalAccountNumber] = useState("");

  // account selection dialog state
  const [isAccountSelectionDialogOpen, setIsAccountSelectionDialogOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState("");

  // add bank account dialog state
  const [isAddBankAccountDialogOpen, setIsAddBankAccountDialogOpen] = useState(false);

  // saved bank accounts state
  const [savedAccounts, setSavedAccounts] = useState<Array<{
    id: string
    accountType: string
    bank: string
    accountNumber: string
    displayBank: string
    displayAccountType: string
    isPrimary?: boolean
  }>>([
    {
      id: "account-1",
      accountType: "ahorros",
      bank: "bancolombia",
      accountNumber: "123-45678-90123",
      displayBank: "Bancolombia",
      displayAccountType: "Ahorros",
    },
    {
      id: "account-2",
      accountType: "ahorros",
      bank: "bbva",
      accountNumber: "9876-5432-1098",
      displayBank: "BBVA",
      displayAccountType: "Ahorros",
      isPrimary: true,
    },
    {
      id: "account-3",
      accountType: "corriente",
      bank: "davivienda",
      accountNumber: "0123-93838-001",
      displayBank: "Davivienda",
      displayAccountType: "Corriente",
    },
  ]);

  // Reference dialog state
  const [isReferenceDialogOpen, setIsReferenceDialogOpen] = useState(false);
  const [referenceNumber, setReferenceNumber] = useState("");
  const [originalReferenceNumber, setOriginalReferenceNumber] = useState("");

  // OTP dialog state
  const [isOtpDialogOpen, setIsOtpDialogOpen] = useState(false);
  const [otpCode, setOtpCode] = useState("");

  /**
   * map document type from display name to code
   */
  const mapDocumentTypeToCode = (displayType: string): string => {
    return documentTypeFromLabel(displayType);
  };

  /**
   * map bank from display name to code
   */
  const mapBankToCode = (displayBank: string): string => {
    const normalized = displayBank.toLowerCase().trim();

    if (normalized.includes("bancolombia")) return "bancolombia";
    if (normalized.includes("bogotá") || normalized.includes("bogota")) return "banco-bogota";
    if (normalized.includes("davivienda")) return "davivienda";
    if (normalized.includes("bbva")) return "bbva";
    if (normalized.includes("popular")) return "banco-popular";
    if (normalized.includes("av villas") || normalized.includes("villas")) return "av-villas";
    if (normalized.includes("caja social")) return "caja-social";
    if (normalized.includes("colpatria") || normalized.includes("scotiabank")) return "colpatria";
    if (normalized.includes("agrario")) return "agrario";
    if (normalized.includes("occidente")) return "occidente";
    if (normalized.includes("gnb") || normalized.includes("sudameris")) return "gnb-sudameris";
    if (normalized.includes("citibank")) return "citibank";

    return normalized;
  };

  const openBeneficiaryDialog = () => {
    if (!transaction) {
      return;
    }

    const nameParts = transaction.beneficiary.fullName.split(" ").filter((part) => part.length > 0);

    let nextFirstName = "";
    let nextLastName = "";

    if (nameParts.length === 1) {
      nextFirstName = nameParts[0];
    } else if (nameParts.length === 2) {
      nextFirstName = nameParts[0];
      nextLastName = nameParts[1];
    } else if (nameParts.length === 3) {
      nextFirstName = nameParts.slice(0, 2).join(" ");
      nextLastName = nameParts[2];
    } else {
      nextFirstName = nameParts.slice(0, 2).join(" ");
      nextLastName = nameParts.slice(2).join(" ");
    }

    const nextDocumentType = mapDocumentTypeToCode(transaction.beneficiary.idType);
    const nextDocumentNumber = transaction.beneficiary.idNumber.replace(/\./g, "");

    setFirstName(nextFirstName);
    setLastName(nextLastName);
    setDocumentType(nextDocumentType);
    setDocumentNumber(nextDocumentNumber);
    setOriginalFirstName(nextFirstName);
    setOriginalLastName(nextLastName);
    setOriginalDocumentType(nextDocumentType);
    setOriginalDocumentNumber(nextDocumentNumber);
    setIsEditDialogOpen(true);
  };

  const openPaymentDialog = () => {
    if (!transaction) {
      return;
    }

    const accountTypeCode
      = transaction.payment.accountType.toLowerCase() === "corriente" ? "corriente" : "ahorros";
    const bankCode = mapBankToCode(transaction.payment.bank);
    const nextPaymentAmount = minorToMajor(transaction.payment.amount);

    setPaymentAmount(nextPaymentAmount);
    setAccountType(accountTypeCode);
    setBank(bankCode);
    setAccountNumber(transaction.payment.accountNumber);
    setOriginalPaymentAmount(nextPaymentAmount);
    setOriginalAccountType(accountTypeCode);
    setOriginalBank(bankCode);
    setOriginalAccountNumber(transaction.payment.accountNumber);
    setIsPaymentDialogOpen(true);
  };

  const openReferenceDialog = () => {
    if (!transaction) {
      return;
    }

    const refNumber = transaction.reference.number || "";
    setReferenceNumber(refNumber);
    setOriginalReferenceNumber(refNumber);
    setIsReferenceDialogOpen(true);
  };

  /**
   * check if beneficiary has changes
   */
  const hasBeneficiaryChanges = (): boolean => {
    return (
      firstName !== originalFirstName
      || lastName !== originalLastName
      || documentType !== originalDocumentType
      || documentNumber !== originalDocumentNumber
    );
  };

  /**
   * check if payment has changes
   */
  const hasPaymentChanges = (): boolean => {
    return (
      paymentAmount !== originalPaymentAmount
      || accountType !== originalAccountType
      || bank !== originalBank
      || accountNumber !== originalAccountNumber
    );
  };

  /**
   * check if reference has changes
   */
  const hasReferenceChanges = (): boolean => {
    return referenceNumber !== originalReferenceNumber;
  };

  /**
   * handle save beneficiary
   */
  const handleSaveBeneficiary = () => {
    const documentTypeMap: Record<string, string> = { ...DOCUMENT_TYPE_LABELS };

    const formattedNumber = documentNumber.replace(/\B(?=(\d{3})+(?!\d))/g, ".");

    setEditedTransaction((prev) => {
      const current = prev ?? transaction;
      if (!current) {
        return current;
      }

      return {
        ...current,
        beneficiary: {
          ...current.beneficiary,
          fullName: `${firstName} ${lastName}`,
          idType: documentTypeMap[documentType] || documentType,
          idNumber: formattedNumber,
        },
      };
    });

    ToastManager.show({
      message: "Información del beneficiario actualizada",
      variant: "success",
    });

    setIsEditDialogOpen(false);
  };

  /**
   * handle save payment
   */
  const handleSavePayment = () => {
    const bankMap: Record<string, string> = {
      bancolombia: "Bancolombia",
      "banco-bogota": "Banco de Bogotá",
      davivienda: "Davivienda",
      bbva: "BBVA Colombia",
      "banco-popular": "Banco Popular Colombia",
      "av-villas": "Banco AV Villas",
      "caja-social": "Banco Caja Social",
      colpatria: "Scotiabank Colpatria",
      agrario: "Banco Agrario de Colombia",
      occidente: "Banco de Occidente Colombia",
      "gnb-sudameris": "Banco GNB Sudameris Colombia",
      citibank: "Citibank Colombia",
    };

    const accountTypeMap: Record<string, string> = {
      corriente: "Corriente",
      ahorros: "Ahorros",
    };

    setEditedTransaction((prev) => {
      const current = prev ?? transaction;
      if (!current) {
        return current;
      }

      return {
        ...current,
        payment: {
          ...current.payment,
          amount: parseCurrencyToMinor(paymentAmount),
          accountType: accountTypeMap[accountType] || accountType,
          bank: bankMap[bank] || bank,
          accountNumber: accountNumber,
        },
      };
    });

    ToastManager.show({
      message: "Información del pago actualizada",
      variant: "success",
    });

    setIsPaymentDialogOpen(false);
  };

  /**
   * open account selection dialog
   */
  const handleOpenAccountSelection = () => {
    setIsAccountSelectionDialogOpen(true);
  };

  /**
   * open add bank account dialog
   */
  const handleOpenAddBankAccount = () => {
    setIsAccountSelectionDialogOpen(false);
    // Small delay to allow account selection dialog to close before opening add bank account dialog
    setTimeout(() => {
      setIsAddBankAccountDialogOpen(true);
    }, 200);
  };

  /**
   * handle add bank account confirmation
   */
  const handleAddBankAccountConfirm = (data: {
    accountType: string
    bank: string
    accountNumber: string
    isPrimary: boolean
  }) => {
    console.log("New bank account added:", data);

    // Map to display format
    const bankMap: Record<string, string> = {
      bancolombia: "Bancolombia",
      davivienda: "Davivienda",
      bbva: "BBVA",
      cobre: "Cobre",
    };

    const accountTypeMap: Record<string, string> = {
      ahorros: "Ahorros",
      corriente: "Corriente",
    };

    // Generate new account ID
    const newAccountId = `account-${Date.now()}`;

    // Add new account to saved accounts
    setSavedAccounts((prev) => {
      // If new account is primary, remove primary from all others
      const updatedAccounts = data.isPrimary
        ? prev.map((acc) => ({ ...acc, isPrimary: false }))
        : prev;

      return [
        ...updatedAccounts,
        {
          id: newAccountId,
          accountType: data.accountType,
          bank: data.bank,
          accountNumber: data.accountNumber,
          displayBank: bankMap[data.bank] || data.bank.charAt(0).toUpperCase() + data.bank.slice(1),
          displayAccountType: accountTypeMap[data.accountType] || data.accountType.charAt(0).toUpperCase() + data.accountType.slice(1),
          isPrimary: data.isPrimary,
        },
      ];
    });

    // Update form fields (not transaction yet - will save on "Save changes")
    setAccountType(data.accountType);
    setBank(data.bank);
    setAccountNumber(data.accountNumber);

    // Reopen payment dialog to show updated fields
    setTimeout(() => {
      setIsPaymentDialogOpen(true);
    }, 200);
  };

  /**
   * confirm selected account
   */
  const handleConfirmAccountSelection = () => {
    const selectedAccountData = savedAccounts.find((acc) => acc.id === selectedAccount);

    if (selectedAccountData) {
      // Update form fields (not transaction yet - will save on "Save changes")
      setAccountType(selectedAccountData.accountType);
      setBank(selectedAccountData.bank);
      setAccountNumber(selectedAccountData.accountNumber);
    }

    setIsAccountSelectionDialogOpen(false);
  };

  /**
   * handle save reference
   */
  const handleSaveReference = () => {
    setEditedTransaction((prev) => {
      const current = prev ?? transaction;
      if (!current) {
        return current;
      }

      return {
        ...current,
        reference: {
          ...current.reference,
          number: referenceNumber,
          notFound: !referenceNumber,
        },
      };
    });

    ToastManager.show({
      message: "Número de referencia actualizado",
      variant: "success",
    });

    setIsReferenceDialogOpen(false);
  };

  /**
   * handle cancel payment
   */
  const handleCancel = () => {
    navigate("/transactions");
  };

  /**
   * handle confirm payment
   */
  const handleConfirm = () => {
    setIsOtpDialogOpen(true);
  };

  /**
   * handle OTP submit
   */
  const handleOtpSubmit = async() => {
    if (!transaction || !id) {
      return;
    }

    try {
      await correctPayment.mutateAsync(
        CorrectPaymentMapper.toCorrectPayload(id, transaction),
      );

      setIsOtpDialogOpen(false);
      setOtpCode("");
      navigate("/transactions");
    } catch {
      setIsOtpDialogOpen(false);
      setOtpCode("");
    }
  };

  /**
   * handle OTP dialog cancel
   */
  const handleOtpCancel = () => {
    setIsOtpDialogOpen(false);
    setOtpCode("");
  };

  /**
   * format currency amount
   */
  const formatAmount = (amount: number): string => {
    return formatCurrencyDisplay(amount, currencyUpper);
  };

  /**
   * get return/rejection reason
   */
  const getReturnReason = (current: BatchTransactionDetail): string => {
    if (current.status === "returned") {
      return "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum mollis nunc a molestie dictum. Mauris venenatis, felis scelerisque aliquet lacinia, nulla nisi venenatis odio, id blandit mauris.";
    }
    return "El pago ha sido rechazado por cumplimiento debido a que se detectó una coincidencia en listas restrictivas.";
  };

  if (paymentQuery.isLoading || !transaction) {
    return null;
  }

  const beneficiaryData = {
    documentType: "CC",
    documentNumber: transaction.beneficiary.idNumber,
    firstName: transaction.beneficiary.fullName.split(" ")[0],
    lastName: transaction.beneficiary.fullName.split(" ").slice(1).join(" "),
  };

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
                <Link to="/transactions">{t("transactions:transactions.page_title")}</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbItem className="md:hidden">
              <button
                onClick={() => navigate("/transactions")}
                className="flex h-9 w-9 items-center justify-center"
              >
                <BreadcrumbEllipsis />
              </button>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem className="min-w-0">
              <BreadcrumbPage className="truncate">{t("transactions:transactions.correct_payment.page_title")}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>,
        sidebarTopBarPortal,
      )}
      <PageContainer className="bg-neutrals-25">
        {/* main content card */}
        <Card className="flex flex-col gap-6 rounded-3xl p-6">
          {/* payment status header */}
          <div className="flex items-center gap-4">
            <p className="text-sm text-[#41454c]">{t("transactions:transactions.correct_payment.payment_status")}</p>
            <Badge
              variant="destructive-medium"
              className="h-8 px-2 text-sm leading-5"
            >
              {t(`transactions:transactions.status.${transaction.status}`)}
            </Badge>
          </div>
          {/* Alert with return/rejection reason */}
          <Alert
            variant={transaction.status === "returned" ? "warning" : "destructive"}
            className="border-0"
          >
            <Icon symbol="info" weight={200} />
            <AlertTitle>
              {t(`transactions:transactions.correct_payment.${transaction.status === "returned" ? "return_reason_title" : "rejection_reason_title"}`)}
            </AlertTitle>
            <AlertDescription>
              {getReturnReason(transaction)}
            </AlertDescription>
          </Alert>
          {/* 2x2 grid of sections */}
          <div className={`
            grid w-full grid-cols-1 gap-4
            lg:grid-cols-2
          `}
          >
            {/* beneficiary section */}
            <div className="flex flex-col gap-6 rounded-3xl bg-[#f8f8f9] p-6">
              {/* header */}
              <div className="flex h-5 items-center justify-between">
                <p className="text-sm text-[#41454c]">{t("batches:batches.transaction_detail.beneficiary.title")}</p>
                <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" onClick={openBeneficiaryDialog}>
                      <Icon symbol="edit" weight={200} />
                      {t("batches:batches.transaction_detail.beneficiary.edit")}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[640px]">
                    <DialogHeader>
                      <DialogTitle>{t("batches:batches.transaction_detail.edit_dialog.title")}</DialogTitle>
                    </DialogHeader>
                    <DialogBody className="flex flex-col gap-8">
                      <div className="flex flex-wrap gap-4">
                        <div className={`
                          flex min-w-[250px] flex-1 flex-col gap-2
                        `}
                        >
                          <Label
                            htmlFor="firstName"
                            className="text-xs text-[#41454c]"
                          >
                            {t("batches:batches.transaction_detail.edit_dialog.first_name")}
                          </Label>
                          <Input
                            id="firstName"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            className="h-10"
                          />
                        </div>
                        <div className={`
                          flex min-w-[250px] flex-1 flex-col gap-2
                        `}
                        >
                          <Label
                            htmlFor="lastName"
                            className="text-xs text-[#41454c]"
                          >
                            {t("batches:batches.transaction_detail.edit_dialog.last_name")}
                          </Label>
                          <Input
                            id="lastName"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            className="h-10"
                          />
                        </div>
                        <div className={`
                          flex min-w-[250px] flex-1 flex-col gap-2
                        `}
                        >
                          <Label
                            htmlFor="documentType"
                            className="text-xs text-[#41454c]"
                          >
                            {t("batches:batches.transaction_detail.edit_dialog.document_type")}
                          </Label>
                          <Select value={documentType} onValueChange={setDocumentType}>
                            <SelectTrigger className="h-10 w-full">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                            {DOCUMENT_TYPE_CODES.map((code) => (
                              <SelectItem key={code} value={code}>
                                {DOCUMENT_TYPE_LABELS[code]}
                              </SelectItem>
                            ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className={`
                          flex min-w-[250px] flex-1 flex-col gap-2
                        `}
                        >
                          <Label
                            htmlFor="documentNumber"
                            className="text-xs text-[#41454c]"
                          >
                            {t("batches:batches.transaction_detail.edit_dialog.document_number")}
                          </Label>
                          <Input
                            id="documentNumber"
                            value={documentNumber}
                            onChange={(e) => setDocumentNumber(e.target.value)}
                            className="h-10"
                          />
                        </div>
                      </div>
                    </DialogBody>
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button variant="secondary">
                          {t("batches:batches.transaction_detail.edit_dialog.cancel")}
                        </Button>
                      </DialogClose>
                      <Button
                        variant="default"
                        disabled={!hasBeneficiaryChanges()}
                        onClick={handleSaveBeneficiary}
                      >
                        {t("batches:batches.transaction_detail.edit_dialog.save")}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
              {/* content card */}
              <Card className="flex flex-col gap-6 rounded-3xl border-0 p-4">
                <div className="flex flex-col gap-2">
                  <p className="text-xs text-[#41454c]">{t("batches:batches.transaction_detail.beneficiary.full_name")}</p>
                  <div className="flex items-center gap-2 pl-2">
                    <Icon
                      symbol="account_circle"
                      weight={200}
                      className="size-[24px] text-[#161719]"
                    />
                    <p className="text-sm font-semibold text-[#161719]">{transaction.beneficiary.fullName}</p>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <p className="text-xs text-[#41454c]">{t("batches:batches.transaction_detail.beneficiary.id_type")}</p>
                  <div className="flex items-center gap-2 pl-2">
                    <Icon
                      symbol="contacts"
                      weight={200}
                      className="size-[24px] text-[#161719]"
                    />
                    <p className="text-sm font-semibold text-[#161719]">
                      {transaction.beneficiary.idType}: {transaction.beneficiary.idNumber}
                    </p>
                  </div>
                </div>
                {!transaction.beneficiary.hasIssues && (
                  <Badge
                    variant="default-medium"
                    className="h-8 bg-[#e9f9ef] px-2 text-sm leading-5"
                  >
                    {t("batches:batches.transaction_detail.beneficiary.no_issues")}
                  </Badge>
                )}
              </Card>
            </div>
            {/* payment information section */}
            <div className="flex flex-col gap-6 rounded-3xl bg-[#f8f8f9] p-6">
              <div className="flex h-5 items-center justify-between">
                <p className="text-sm text-[#41454c]">{t("batches:batches.transaction_detail.payment_info.title")}</p>
                <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" onClick={openPaymentDialog}>
                      <Icon symbol="edit" weight={200} />
                      {t("batches:batches.transaction_detail.payment_info.edit")}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[640px]">
                    <DialogHeader>
                      <DialogTitle>{t("batches:batches.transaction_detail.payment_edit_dialog.title")}</DialogTitle>
                    </DialogHeader>
                    <DialogBody className="flex flex-col gap-8">
                      {/* payment amount field */}
                      <div className="flex flex-col gap-2">
                        <Label
                          htmlFor="paymentAmount"
                          className="text-xs text-[#41454c]"
                        >
                          {t("batches:batches.transaction_detail.payment_edit_dialog.payment_amount")}
                        </Label>
                        <Input
                          id="paymentAmount"
                          value={paymentAmount}
                          onChange={(e) => setPaymentAmount(e.target.value)}
                          className="h-10"
                        />
                      </div>
                      {/* account information card */}
                      <Card className={`
                        flex flex-col gap-6 rounded-3xl border-0 bg-[#f9fafb]
                        p-4
                      `}
                      >
                        <div className="flex flex-col gap-2">
                          <p className="text-xs text-[#6c737f]">
                            {t("batches:batches.transaction_detail.payment_edit_dialog.account_info")}
                          </p>
                          <div className="flex h-10 items-center gap-2 pl-2">
                            <div className="flex flex-1 items-center gap-2">
                              <Icon
                                symbol="account_balance"
                                weight={200}
                                className="size-[24px] text-[#384250]"
                              />
                              <p className={`
                                text-sm font-semibold text-[#384250]
                              `}
                              >
                                {accountType && bank && accountNumber
                                  ? (() => {
                                    const bankMap: Record<string, string> = {
                                      bancolombia: "Bancolombia",
                                      "banco-bogota": "Banco de Bogotá",
                                      davivienda: "Davivienda",
                                      bbva: "BBVA Colombia",
                                      "banco-popular": "Banco Popular Colombia",
                                      "av-villas": "Banco AV Villas",
                                      "caja-social": "Banco Caja Social",
                                      colpatria: "Scotiabank Colpatria",
                                      agrario: "Banco Agrario de Colombia",
                                      occidente: "Banco de Occidente Colombia",
                                      "gnb-sudameris": "Banco GNB Sudameris Colombia",
                                      citibank: "Citibank Colombia",
                                    };
                                    const displayBank = bankMap[bank] || bank.charAt(0).toUpperCase() + bank.slice(1);
                                    return `${accountType.charAt(0).toUpperCase() + accountType.slice(1)}. ${displayBank} Nº ${accountNumber}`;
                                  })()
                                  : `${transaction.payment.accountType}. ${transaction.payment.bank} Nº ${transaction.payment.accountNumber}`}
                              </p>
                            </div>
                            <Button
                              variant="link"
                              className="h-6 px-0 text-[#0e9384]"
                              onClick={handleOpenAccountSelection}
                            >
                              {t("batches:batches.transaction_detail.payment_edit_dialog.select_saved_account")}
                            </Button>
                          </div>
                        </div>
                      </Card>
                    </DialogBody>
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button variant="secondary">
                          {t("batches:batches.transaction_detail.payment_edit_dialog.cancel")}
                        </Button>
                      </DialogClose>
                      <Button
                        variant="default"
                        disabled={!hasPaymentChanges()}
                        onClick={handleSavePayment}
                      >
                        {t("batches:batches.transaction_detail.payment_edit_dialog.save")}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
              <Card className="flex flex-col gap-6 rounded-3xl border-0 p-4">
                <div className="flex flex-col gap-2">
                  <p className="text-xs text-[#41454c]">{t("batches:batches.transaction_detail.payment_info.amount")}</p>
                  <div className="flex items-center gap-2 pl-2">
                    <Icon
                      symbol="paid"
                      weight={200}
                      className="size-[24px] text-[#161719]"
                    />
                    <p className="text-sm font-semibold text-[#161719]">{formatAmount(transaction.payment.amount)}</p>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <p className="text-xs text-[#41454c]">{t("batches:batches.transaction_detail.payment_info.account_type")}</p>
                  <div className="flex items-center gap-2 pl-2">
                    <Icon
                      symbol="account_balance"
                      weight={200}
                      className="size-[24px] text-[#161719]"
                    />
                    <p className="text-sm font-semibold text-[#161719]">
                      {transaction.payment.accountType}. {transaction.payment.bank} Nº {transaction.payment.accountNumber}
                    </p>
                  </div>
                </div>
                {transaction.payment.accountMismatch && (
                  <Badge
                    variant="default-medium"
                    className="h-8 bg-[#fef5e7] px-2 text-sm leading-5"
                  >
                    {t("batches:batches.transaction_detail.payment_info.account_mismatch")}
                  </Badge>
                )}
              </Card>
            </div>
            {/* payment reference section */}
            <div className="flex flex-col gap-6 rounded-3xl bg-[#f8f8f9] p-6">
              <div className="flex h-5 items-center justify-between">
                <p className="text-sm text-[#41454c]">{t("batches:batches.transaction_detail.payment_reference.title")}</p>
                <Dialog open={isReferenceDialogOpen} onOpenChange={setIsReferenceDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" onClick={openReferenceDialog}>
                      <Icon symbol="edit" weight={200} />
                      {t("batches:batches.transaction_detail.payment_reference.edit")}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[640px]">
                    <DialogHeader>
                      <DialogTitle>{t("batches:batches.transaction_detail.reference_edit_dialog.title")}</DialogTitle>
                    </DialogHeader>
                    <DialogBody className="flex flex-col gap-8">
                      <div className="flex flex-col gap-2">
                        <Label
                          htmlFor="referenceNumber"
                          className="text-xs text-[#41454c]"
                        >
                          {t("batches:batches.transaction_detail.reference_edit_dialog.reference_number")}
                        </Label>
                        <Input
                          id="referenceNumber"
                          value={referenceNumber}
                          onChange={(e) => setReferenceNumber(e.target.value)}
                          className="h-10"
                        />
                      </div>
                    </DialogBody>
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button variant="secondary">
                          {t("batches:batches.transaction_detail.reference_edit_dialog.cancel")}
                        </Button>
                      </DialogClose>
                      <Button
                        variant="default"
                        disabled={!hasReferenceChanges()}
                        onClick={handleSaveReference}
                      >
                        {t("batches:batches.transaction_detail.reference_edit_dialog.save")}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
              <Card className="flex flex-col gap-6 rounded-3xl border-0 p-4">
                <div className="flex flex-col gap-2">
                  <p className="text-xs text-[#41454c]">{t("batches:batches.transaction_detail.payment_reference.reference_number")}</p>
                  <div className="flex items-center gap-2 pl-2">
                    <Icon
                      symbol="confirmation_number"
                      weight={200}
                      className="size-[24px] text-[#161719]"
                    />
                    <p className="text-sm font-semibold text-[#161719]">{transaction.reference.number || "--"}</p>
                  </div>
                </div>
                {transaction.reference.notFound && (
                  <Badge
                    variant="default-medium"
                    className="h-8 bg-[#fef5e7] px-2 text-sm leading-5"
                  >
                    {t("batches:batches.transaction_detail.payment_reference.not_found")}
                  </Badge>
                )}
              </Card>
            </div>
            {/* restrictive list section */}
            {transaction.restrictiveList && (
              <div className="flex flex-col gap-6 rounded-3xl bg-[#e5f3fa] p-6">
                <div className="flex h-5 items-center gap-4">
                  <p className="text-sm text-[#41454c]">{t("batches:batches.transaction_detail.restrictive_list.title")}</p>
                </div>
                <Card className="flex flex-col gap-6 rounded-3xl border-0 p-4">
                  <div className="flex flex-col gap-2">
                    <p className="text-xs text-[#41454c]">{t("batches:batches.transaction_detail.restrictive_list.list_name")}</p>
                    <div className="flex items-center gap-2 pl-2">
                      <Icon
                        symbol="clarify"
                        weight={200}
                        className="size-[24px] text-[#161719]"
                      />
                      <p className="text-sm font-semibold text-[#161719]">{transaction.restrictiveList.listName}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <RiskLevel level={transaction.restrictiveList.riskLevel} />
                    <Button variant="link" className="text-[#0e9384]">
                      {t("batches:batches.transaction_detail.restrictive_list.view_in_risk")}
                      <Icon symbol="open_in_new" weight={200} />
                    </Button>
                  </div>
                </Card>
              </div>
            )}
          </div>
          {/* action buttons - NO "Revisar después" button */}
          <div className="mt-6 flex items-center gap-6">
            <Button variant="secondary" onClick={handleCancel}>
              {t("transactions:transactions.correct_payment.cancel_button")}
            </Button>
            <Button variant="default" onClick={handleConfirm}>
              <Icon symbol="check" weight={200} />
              {t("transactions:transactions.correct_payment.confirm_button")}
            </Button>
          </div>
        </Card>
      </PageContainer>
      {/* OTP Dialog */}
      <Dialog open={isOtpDialogOpen} onOpenChange={setIsOtpDialogOpen}>
        <DialogContent className="max-w-[610px] gap-12">
          <DialogHeader className="gap-2">
            <DialogTitle>{t("transactions:transactions.otp_dialog.title")}</DialogTitle>
            <DialogDescription>{t("transactions:transactions.otp_dialog.description")}</DialogDescription>
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
              {t("transactions:transactions.otp_dialog.cancel")}
            </Button>
            <Button
              variant="default"
              onClick={handleOtpSubmit}
              disabled={otpCode.length !== 6}
            >
              {t("transactions:transactions.otp_dialog.confirm")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Account Selection Dialog */}
      <Dialog open={isAccountSelectionDialogOpen} onOpenChange={setIsAccountSelectionDialogOpen}>
        <DialogContent className="sm:max-w-[640px]">
          <DialogHeader>
            <DialogTitle>{t("batches:batches.transaction_detail.account_selection_dialog.title")}</DialogTitle>
            <p className="mt-2 text-sm text-foreground">
              {t("batches:batches.transaction_detail.account_selection_dialog.description")}
            </p>
          </DialogHeader>
          <DialogBody className="flex flex-col gap-4">
            <SelectableCardGroup
              value={selectedAccount}
              onValueChange={setSelectedAccount}
              className="flex flex-col gap-2"
            >
              {savedAccounts.map((account) => (
                <SelectableCard key={account.id} value={account.id}>
                  <div className="flex flex-col gap-2">
                    <p className="text-xs text-[#6c737f]">
                      {account.displayAccountType === "Ahorros"
                        ? t("batches:batches.transaction_detail.account_selection_dialog.savings_account")
                        : t("batches:batches.transaction_detail.account_selection_dialog.checking_account")}
                    </p>
                    <div className="flex items-center gap-2 pl-2">
                      <Icon
                        symbol="account_balance"
                        weight={200}
                        className="size-[24px] text-[#384250]"
                      />
                      <p className="text-sm font-semibold text-[#384250]">
                        {account.displayBank} Nº {account.accountNumber}
                      </p>
                      {account.isPrimary && (
                        <Badge
                          variant="default-medium"
                          className="h-8 bg-[#f9fafb] px-2 text-sm"
                        >
                          {t("batches:batches.transaction_detail.account_selection_dialog.primary")}
                        </Badge>
                      )}
                    </div>
                  </div>
                </SelectableCard>
              ))}
            </SelectableCardGroup>
            {/* Add new account button */}
            <Button
              variant="link"
              className="h-6 justify-start px-0 text-[#0e9384]"
              onClick={handleOpenAddBankAccount}
            >
              <Icon symbol="add" weight={200} />
              {t("batches:batches.transaction_detail.account_selection_dialog.add_new_account")}
            </Button>
          </DialogBody>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="secondary">
                {t("batches:batches.transaction_detail.account_selection_dialog.cancel")}
              </Button>
            </DialogClose>
            <Button
              variant="default"
              disabled={!selectedAccount}
              onClick={handleConfirmAccountSelection}
            >
              {t("batches:batches.transaction_detail.account_selection_dialog.select_account")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Add Bank Account Dialog */}
      <AddBankAccountDialog
        open={isAddBankAccountDialogOpen}
        onOpenChange={setIsAddBankAccountDialogOpen}
        beneficiaryData={beneficiaryData}
        onConfirm={handleAddBankAccountConfirm}
      />
    </>
  );
};
