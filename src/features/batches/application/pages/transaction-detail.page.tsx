import { useTranslation } from "react-i18next";
import { usePortalContainer } from "@adamosuiteservices/ui/use-portal-container";
import { createPortal } from "react-dom";
import { PageContainer } from "@/features/common/components/layout/page-container";
import { useParams, Link, useNavigate } from "react-router";
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
import { Button } from "@adamosuiteservices/ui/button";
import { Icon } from "@adamosuiteservices/ui/icon";
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
import { Input } from "@adamosuiteservices/ui/input";
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
import { useBatchTransactionDetail } from "../hooks/use-transaction-detail";
import { useBatchesRealtime } from "../hooks/use-batches-realtime";
import {
  useUpdateBatchTransaction,
  useUpdateBatchTransactionStatus,
} from "../hooks/use-batch-mutations";
import { ToastManager } from "@adamosuiteservices/ui/toaster";
import { AddBankAccountDialog } from "@/features/beneficiaries/application/components/add-bank-account-dialog";
import { useState, useEffect } from "react";

/**
 * transaction detail page
 * 
 * displays detailed information about a specific transaction within a batch
 */
export const TransactionDetailPage = () => {
  const { t } = useTranslation(["batches", "transactions"]);
  const { batchId, transactionId } = useParams<{ batchId: string, transactionId: string }>();
  const navigate = useNavigate();
  const {
    transaction: originalTransaction,
    isLoading,
  } = useBatchTransactionDetail(batchId, transactionId);
  useBatchesRealtime(batchId);

  const updateBatchTransaction = useUpdateBatchTransaction();
  const updateBatchTransactionStatus = useUpdateBatchTransactionStatus();

  const sidebarTopBarPortal = usePortalContainer("[data-slot='sidebar-top-bar-portal']");

  // local editable transaction state
  const [transaction, setTransaction] = useState(originalTransaction);

  // sync with original transaction on mount or id change
  useEffect(() => {
    if (originalTransaction) {
      setTransaction(originalTransaction);
    }
  }, [originalTransaction]);

  // dialog state
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [documentType, setDocumentType] = useState("");
  const [documentNumber, setDocumentNumber] = useState("");
  // original values for comparison
  const [originalFirstName, setOriginalFirstName] = useState("");
  const [originalLastName, setOriginalLastName] = useState("");
  const [originalDocumentType, setOriginalDocumentType] = useState("");
  const [originalDocumentNumber, setOriginalDocumentNumber] = useState("");

  // payment dialog state
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [accountType, setAccountType] = useState("");
  const [bank, setBank] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  // original values for comparison
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

  // reference dialog state
  const [isReferenceDialogOpen, setIsReferenceDialogOpen] = useState(false);
  const [referenceNumber, setReferenceNumber] = useState("");
  // original value for comparison
  const [originalReferenceNumber, setOriginalReferenceNumber] = useState("");

  // reject dialog state
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);

  /**
   * map document type from display name to code
   */
  const mapDocumentTypeToCode = (displayType: string): string => {
    const normalizedType = displayType.toLowerCase();
    if (normalizedType.includes("ciudadanía") || normalizedType.includes("ciudadania")) {
      return "cc";
    }
    if (normalizedType.includes("extranjería") || normalizedType.includes("extranjeria")) {
      return "ce";
    }
    if (normalizedType.includes("pasaporte") || normalizedType.includes("passport")) {
      return "passport";
    }
    return "";
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

  // load beneficiary data when edit dialog opens
  useEffect(() => {
    if (isEditDialogOpen && transaction) {
      const nameParts = transaction.beneficiary.fullName.split(" ").filter((part) => part.length > 0);
      
      // assume Colombian naming convention: up to 2 first names, rest are last names
      let firstName = "";
      let lastName = "";
      
      if (nameParts.length === 1) {
        firstName = nameParts[0];
      } else if (nameParts.length === 2) {
        firstName = nameParts[0];
        lastName = nameParts[1];
      } else if (nameParts.length === 3) {
        firstName = nameParts.slice(0, 2).join(" ");
        lastName = nameParts[2];
      } else {
        // 4 or more parts: assume 2 first names and 2+ last names
        firstName = nameParts.slice(0, 2).join(" ");
        lastName = nameParts.slice(2).join(" ");
      }
      
      const docType = mapDocumentTypeToCode(transaction.beneficiary.idType);
      const docNumber = transaction.beneficiary.idNumber;
      
      setFirstName(firstName);
      setLastName(lastName);
      setDocumentType(docType);
      setDocumentNumber(docNumber);
      
      // store original values
      setOriginalFirstName(firstName);
      setOriginalLastName(lastName);
      setOriginalDocumentType(docType);
      setOriginalDocumentNumber(docNumber);
    }
  }, [isEditDialogOpen, transaction]);

  // load payment data when payment dialog opens
  useEffect(() => {
    if (isPaymentDialogOpen && transaction) {
      const amount = transaction.payment.amount.toLocaleString("es-CO");
      const accType = transaction.payment.accountType.toLowerCase();
      const bankCode = mapBankToCode(transaction.payment.bank);
      const accNumber = transaction.payment.accountNumber;
      
      setPaymentAmount(amount);
      setAccountType(accType);
      setBank(bankCode);
      setAccountNumber(accNumber);
      
      // store original values
      setOriginalPaymentAmount(amount);
      setOriginalAccountType(accType);
      setOriginalBank(bankCode);
      setOriginalAccountNumber(accNumber);
    }
  }, [isPaymentDialogOpen, transaction]);

  // load reference data when reference dialog opens
  useEffect(() => {
    if (isReferenceDialogOpen && transaction) {
      const refNumber = transaction.reference.number || "";
      setReferenceNumber(refNumber);
      setOriginalReferenceNumber(refNumber);
    }
  }, [isReferenceDialogOpen, transaction]);

  if (isLoading || !transaction) {
    return null;
  }

  const beneficiaryData = {
    documentType: "cc",
    documentNumber: transaction.beneficiary.idNumber,
    firstName: transaction.beneficiary.fullName.split(" ")[0],
    lastName: transaction.beneficiary.fullName.split(" ").slice(1).join(" "),
  };

  /**
   * check if beneficiary data has changed
   */
  const hasBeneficiaryChanges = () => {
    return firstName !== originalFirstName
      || lastName !== originalLastName
      || documentType !== originalDocumentType
      || documentNumber !== originalDocumentNumber;
  };

  /**
   * check if payment data has changed
   */
  const hasPaymentChanges = () => {
    return paymentAmount !== originalPaymentAmount
      || accountType !== originalAccountType
      || bank !== originalBank
      || accountNumber !== originalAccountNumber;
  };

  /**
   * check if reference data has changed
   */
  const hasReferenceChanges = () => {
    return referenceNumber !== originalReferenceNumber;
  };

  /**
   * map document type code back to display name
   */
  const mapDocumentTypeToDisplay = (code: string): string => {
    switch (code) {
      case "cc":
        return "Cédula de ciudadanía";
      case "ce":
        return "Cédula de extranjería";
      case "passport":
        return "Pasaporte";
      default:
        return code;
    }
  };

  /**
   * map bank code back to display name
   */
  const mapBankToDisplay = (code: string): string => {
    switch (code) {
      case "bancolombia":
        return "Bancolombia";
      case "banco-bogota":
        return "Banco de Bogotá";
      case "davivienda":
        return "Davivienda";
      case "bbva":
        return "BBVA Colombia";
      case "banco-popular":
        return "Banco Popular Colombia";
      case "av-villas":
        return "Banco AV Villas";
      case "caja-social":
        return "Banco Caja Social";
      case "colpatria":
        return "Scotiabank Colpatria";
      case "agrario":
        return "Banco Agrario de Colombia";
      case "occidente":
        return "Banco de Occidente Colombia";
      case "gnb-sudameris":
        return "Banco GNB Sudameris Colombia";
      case "citibank":
        return "Citibank Colombia";
      default:
        return code.charAt(0).toUpperCase() + code.slice(1);
    }
  };

  /**
   * save beneficiary changes
   */
  const handleSaveBeneficiary = async() => {
    if (!batchId || !transactionId) {
      return;
    }

    const fullName = `${firstName} ${lastName}`.trim();
    const idType = mapDocumentTypeToDisplay(documentType);

    try {
      const result = await updateBatchTransaction.mutateAsync({
        batchId,
        transactionId,
        rawData: {
          beneficiaryName: fullName,
          idType: documentType,
          idNumber: documentNumber,
        },
      });

      if (result.data) {
        setTransaction(result.data);
      }

      setIsEditDialogOpen(false);
      ToastManager.show({
        message: "Cambios guardados exitosamente",
        variant: "success",
      });
    } catch {
      // error toast handled by mutation meta
    }
  };

  /**
   * save payment changes
   */
  const handleSavePayment = async() => {
    if (!batchId || !transactionId) {
      return;
    }

    const amount = parseInt(paymentAmount.replace(/\./g, ""), 10);
    const accType = accountType.charAt(0).toUpperCase() + accountType.slice(1);
    const bankDisplay = mapBankToDisplay(bank);

    try {
      const result = await updateBatchTransaction.mutateAsync({
        batchId,
        transactionId,
        rawData: {
          amount: isNaN(amount) ? undefined : amount,
          accountType: accType,
          bankName: bankDisplay,
          accountNumber,
        },
      });

      if (result.data) {
        setTransaction(result.data);
      }

      setIsPaymentDialogOpen(false);
      ToastManager.show({
        message: "Cambios guardados exitosamente",
        variant: "success",
      });
    } catch {
      // error toast handled by mutation meta
    }
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
   * save reference changes
   */
  const handleSaveReference = async() => {
    if (!batchId || !transactionId) {
      return;
    }

    try {
      const result = await updateBatchTransaction.mutateAsync({
        batchId,
        transactionId,
        rawData: {
          reference: referenceNumber || undefined,
        },
      });

      if (result.data) {
        setTransaction(result.data);
      }

      setIsReferenceDialogOpen(false);
      ToastManager.show({
        message: "Cambios guardados exitosamente",
        variant: "success",
      });
    } catch {
      // error toast handled by mutation meta
    }
  };

  /**
   * handle reject payment confirmation
   */
  const handleRejectPayment = async() => {
    if (!batchId || !transactionId) {
      return;
    }

    try {
      await updateBatchTransactionStatus.mutateAsync({
        batchId,
        transactionId,
        status: "rejected",
      });

      setIsRejectDialogOpen(false);
      ToastManager.show({
        message: "Pago rechazado exitosamente",
        variant: "success",
      });
      navigate(`/batches/${batchId}`);
    } catch {
      setIsRejectDialogOpen(false);
    }
  };

  const handleApprovePayment = async() => {
    if (!batchId || !transactionId) {
      return;
    }

    try {
      await updateBatchTransactionStatus.mutateAsync({
        batchId,
        transactionId,
        status: "valid",
      });

      ToastManager.show({
        message: "Pago aprobado exitosamente",
        variant: "success",
      });
      navigate(`/batches/${batchId}`);
    } catch {
      // error toast handled by mutation meta
    }
  };

  const handleReviewLater = async() => {
    if (!batchId || !transactionId) {
      return;
    }

    try {
      await updateBatchTransactionStatus.mutateAsync({
        batchId,
        transactionId,
        status: "pending",
      });

      navigate(`/batches/${batchId}`);
    } catch {
      // error toast handled by mutation meta
    }
  };

  /**
   * format amount in COP currency
   */
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  /**
   * get badge variant based on transaction status
   */
  const getStatusVariant = (status: string): "muted" | "success-medium" | "warning-medium" | "destructive-medium" => {
    switch (status) {
      case "paid":
        return "success-medium";
      case "validated":
        return "warning-medium";
      case "returned":
      case "rejected":
        return "destructive-medium";
      case "pending":
      default:
        return "muted";
    }
  };

  /**
   * get status label
   */
  const getStatusLabel = () => {
    return t(`transactions:transactions.status.${transaction.status}`);
  };

  /**
   * risk level component
   */
  const RiskLevel = ({ level }: { level: "low" | "medium" | "high" }) => {
    const segments = [
      level === "low" || level === "medium" || level === "high",
      level === "medium" || level === "high",
      level === "high",
    ];

    return (
      <div className="flex w-[100px] gap-1 rounded-2xl bg-[#f8f8f9] p-1">
        {segments.map((active, index) => (
          <div
            key={index}
            className={`
              h-2 flex-1 rounded-full border border-[#e2e3e5]
              ${
              active
                ? level === "high"
                  ? "bg-[#ef4444]"
                  : level === "medium"
                    ? "bg-[#f59e0b]"
                    : "bg-[#22c55e]"
                : "bg-white"
            }
            `}
          />
        ))}
      </div>
    );
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
                <Link to="/batches">{t("batches.page_title")}</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className={`
              hidden
              md:block
            `}
            />
            <BreadcrumbItem className={`
              hidden
              md:block
            `}
            >
              <BreadcrumbLink asChild>
                <Link to={`/batches/${batchId}`}>{t("batches.detail.title")}</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbItem className="md:hidden">
              <button
                onClick={() => navigate(`/batches/${batchId}`)}
                className="flex h-9 w-9 items-center justify-center"
              >
                <BreadcrumbEllipsis />
              </button>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem className="min-w-0">
              <BreadcrumbPage className="truncate">{t("batches.transaction_detail.page_title")}</BreadcrumbPage>
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
            <p className="text-sm text-[#41454c]">{t("batches.transaction_detail.payment_status")}</p>
            <Badge
              variant={getStatusVariant(transaction.status)}
              className="h-8 px-2 text-sm leading-5"
            >
              {getStatusLabel()}
            </Badge>
          </div>

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
                <p className="text-sm text-[#41454c]">{t("batches.transaction_detail.beneficiary.title")}</p>
                <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline">
                      <Icon symbol="edit" weight={200} />
                      {t("batches.transaction_detail.beneficiary.edit")}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[640px]">
                    <DialogHeader>
                      <DialogTitle>{t("batches.transaction_detail.edit_dialog.title")}</DialogTitle>
                    </DialogHeader>
                    <DialogBody className="flex flex-col gap-8">
                      {/* form fields */}
                      <div className="flex flex-wrap gap-4">
                        {/* first name */}
                        <div className={`
                          flex min-w-[250px] flex-1 flex-col gap-2
                        `}
                        >
                          <Label
                            htmlFor="firstName"
                            className="text-xs text-[#41454c]"
                          >
                            {t("batches.transaction_detail.edit_dialog.first_name")}
                          </Label>
                          <Input
                            id="firstName"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            className="h-10"
                          />
                        </div>

                        {/* last name */}
                        <div className={`
                          flex min-w-[250px] flex-1 flex-col gap-2
                        `}
                        >
                          <Label
                            htmlFor="lastName"
                            className="text-xs text-[#41454c]"
                          >
                            {t("batches.transaction_detail.edit_dialog.last_name")}
                          </Label>
                          <Input
                            id="lastName"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            className="h-10"
                          />
                        </div>

                        {/* document type */}
                        <div className={`
                          flex min-w-[250px] flex-1 flex-col gap-2
                        `}
                        >
                          <Label
                            htmlFor="documentType"
                            className="text-xs text-[#41454c]"
                          >
                            {t("batches.transaction_detail.edit_dialog.document_type")}
                          </Label>
                          <Select value={documentType} onValueChange={setDocumentType}>
                            <SelectTrigger className="h-10 w-full">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="cc">Cédula de ciudadanía</SelectItem>
                              <SelectItem value="ce">Cédula de extranjería</SelectItem>
                              <SelectItem value="passport">Pasaporte</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {/* document number */}
                        <div className={`
                          flex min-w-[250px] flex-1 flex-col gap-2
                        `}
                        >
                          <Label
                            htmlFor="documentNumber"
                            className="text-xs text-[#41454c]"
                          >
                            {t("batches.transaction_detail.edit_dialog.document_number")}
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
                          {t("batches.transaction_detail.edit_dialog.cancel")}
                        </Button>
                      </DialogClose>
                      <Button 
                        variant="default" 
                        disabled={!hasBeneficiaryChanges()}
                        onClick={handleSaveBeneficiary}
                      >
                        {t("batches.transaction_detail.edit_dialog.save")}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>

              {/* content card */}
              <Card className="flex flex-col gap-6 rounded-3xl border-0 p-4">
                {/* full name */}
                <div className="flex flex-col gap-2">
                  <p className="text-xs text-[#41454c]">{t("batches.transaction_detail.beneficiary.full_name")}</p>
                  <div className="flex items-center gap-2 pl-2">
                    <Icon
                      symbol="account_circle"
                      weight={200}
                      className="size-[24px] text-[#161719]"
                    />
                    <p className="text-sm font-semibold text-[#161719]">{transaction.beneficiary.fullName}</p>
                  </div>
                </div>

                {/* id type and number */}
                <div className="flex flex-col gap-2">
                  <p className="text-xs text-[#41454c]">{t("batches.transaction_detail.beneficiary.id_type")}</p>
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

                {/* status badge */}
                {!transaction.beneficiary.hasIssues && (
                  <Badge
                    variant="default-medium"
                    className="h-8 bg-[#e9f9ef] px-2 text-sm leading-5"
                  >
                    {t("batches.transaction_detail.beneficiary.no_issues")}
                  </Badge>
                )}
              </Card>
            </div>

            {/* payment information section */}
            <div className="flex flex-col gap-6 rounded-3xl bg-[#f8f8f9] p-6">
              {/* header */}
              <div className="flex h-5 items-center justify-between">
                <p className="text-sm text-[#41454c]">{t("batches.transaction_detail.payment_info.title")}</p>
                <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline">
                      <Icon symbol="edit" weight={200} />
                      {t("batches.transaction_detail.payment_info.edit")}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[640px]">
                    <DialogHeader>
                      <DialogTitle>{t("batches.transaction_detail.payment_edit_dialog.title")}</DialogTitle>
                    </DialogHeader>
                    <DialogBody className="flex flex-col gap-8">
                      {/* payment amount field */}
                      <div className="flex flex-col gap-2">
                        <Label
                          htmlFor="paymentAmount"
                          className="text-xs text-[#41454c]"
                        >
                          {t("batches.transaction_detail.payment_edit_dialog.payment_amount")}
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
                            {t("batches.transaction_detail.payment_edit_dialog.account_info")}
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
                                  ? `${accountType.charAt(0).toUpperCase() + accountType.slice(1)}. ${mapBankToDisplay(bank)} Nº ${accountNumber}`
                                  : `${transaction.payment.accountType}. ${transaction.payment.bank} Nº ${transaction.payment.accountNumber}`}
                              </p>
                            </div>
                            <Button
                              variant="link"
                              className="h-6 px-0 text-[#0e9384]"
                              onClick={handleOpenAccountSelection}
                            >
                              {t("batches.transaction_detail.payment_edit_dialog.select_saved_account")}
                            </Button>
                          </div>
                        </div>
                      </Card>
                    </DialogBody>
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button variant="secondary">
                          {t("batches.transaction_detail.payment_edit_dialog.cancel")}
                        </Button>
                      </DialogClose>
                      <Button 
                        variant="default" 
                        disabled={!hasPaymentChanges()}
                        onClick={handleSavePayment}
                      >
                        {t("batches.transaction_detail.payment_edit_dialog.save")}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>

              {/* content card */}
              <Card className="flex flex-col gap-6 rounded-3xl border-0 p-4">
                {/* amount */}
                <div className="flex flex-col gap-2">
                  <p className="text-xs text-[#41454c]">{t("batches.transaction_detail.payment_info.amount")}</p>
                  <div className="flex items-center gap-2 pl-2">
                    <Icon
                      symbol="paid"
                      weight={200}
                      className="size-[24px] text-[#161719]"
                    />
                    <p className="text-sm font-semibold text-[#161719]">{formatAmount(transaction.payment.amount)}</p>
                  </div>
                </div>

                {/* account type and number */}
                <div className="flex flex-col gap-2">
                  <p className="text-xs text-[#41454c]">{t("batches.transaction_detail.payment_info.account_type")}</p>
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

                {/* warning badge */}
                {transaction.payment.accountMismatch && (
                  <Badge
                    variant="default-medium"
                    className="h-8 bg-[#fef5e7] px-2 text-sm leading-5"
                  >
                    {t("batches.transaction_detail.payment_info.account_mismatch")}
                  </Badge>
                )}
              </Card>
            </div>

            {/* payment reference section */}
            <div className="flex flex-col gap-6 rounded-3xl bg-[#f8f8f9] p-6">
              {/* header */}
              <div className="flex h-5 items-center justify-between">
                <p className="text-sm text-[#41454c]">{t("batches.transaction_detail.payment_reference.title")}</p>
                <Dialog open={isReferenceDialogOpen} onOpenChange={setIsReferenceDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline">
                      <Icon symbol="edit" weight={200} />
                      {t("batches.transaction_detail.payment_reference.edit")}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[640px]">
                    <DialogHeader>
                      <DialogTitle>{t("batches.transaction_detail.reference_edit_dialog.title")}</DialogTitle>
                    </DialogHeader>
                    <DialogBody className="flex flex-col gap-8">
                      {/* form field */}
                      <div className="flex flex-col gap-2">
                        <Label
                          htmlFor="referenceNumber"
                          className="text-xs text-[#41454c]"
                        >
                          {t("batches.transaction_detail.reference_edit_dialog.reference_number")}
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
                          {t("batches.transaction_detail.reference_edit_dialog.cancel")}
                        </Button>
                      </DialogClose>
                      <Button 
                        variant="default" 
                        disabled={!hasReferenceChanges()}
                        onClick={handleSaveReference}
                      >
                        {t("batches.transaction_detail.reference_edit_dialog.save")}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>

              {/* content card */}
              <Card className="flex flex-col gap-6 rounded-3xl border-0 p-4">
                {/* reference number */}
                <div className="flex flex-col gap-2">
                  <p className="text-xs text-[#41454c]">{t("batches.transaction_detail.payment_reference.reference_number")}</p>
                  <div className="flex items-center gap-2 pl-2">
                    <Icon
                      symbol="confirmation_number"
                      weight={200}
                      className="size-[24px] text-[#161719]"
                    />
                    <p className="text-sm font-semibold text-[#161719]">{transaction.reference.number || "--"}</p>
                  </div>
                </div>

                {/* warning badge */}
                {transaction.reference.notFound && (
                  <Badge
                    variant="default-medium"
                    className="h-8 bg-[#fef5e7] px-2 text-sm leading-5"
                  >
                    {t("batches.transaction_detail.payment_reference.not_found")}
                  </Badge>
                )}
              </Card>
            </div>

            {/* restrictive list section */}
            {transaction.restrictiveList && (
              <div className="flex flex-col gap-6 rounded-3xl bg-[#e5f3fa] p-6">
                {/* header */}
                <div className="flex h-5 items-center gap-4">
                  <p className="text-sm text-[#41454c]">{t("batches.transaction_detail.restrictive_list.title")}</p>
                </div>

                {/* content card */}
                <Card className="flex flex-col gap-6 rounded-3xl border-0 p-4">
                  {/* list name */}
                  <div className="flex flex-col gap-2">
                    <p className="text-xs text-[#41454c]">{t("batches.transaction_detail.restrictive_list.list_name")}</p>
                    <div className="flex items-center gap-2 pl-2">
                      <Icon
                        symbol="clarify"
                        weight={200}
                        className="size-[24px] text-[#161719]"
                      />
                      <p className="text-sm font-semibold text-[#161719]">{transaction.restrictiveList.listName}</p>
                    </div>
                  </div>

                  {/* risk level and link */}
                  <div className="flex items-center justify-between">
                    <RiskLevel level={transaction.restrictiveList.riskLevel} />
                    <Button variant="link" className="text-[#0e9384]">
                      {t("batches.transaction_detail.restrictive_list.view_in_risk")}
                      <Icon symbol="open_in_new" weight={200} />
                    </Button>
                  </div>
                </Card>
              </div>
            )}
          </div>

          {/* action buttons */}
          <div className={`
            mt-6 flex flex-wrap items-center justify-between gap-12
          `}
          >
            <div className="flex items-center gap-6">
              <Button variant="destructive-medium" onClick={() => setIsRejectDialogOpen(true)}>
                {t("batches.transaction_detail.actions.reject")}
              </Button>
              <Button variant="default" onClick={handleApprovePayment}>
                <Icon symbol="check" weight={200} />
                {t("batches.transaction_detail.actions.approve")}
              </Button>
            </div>
            <Button variant="default" onClick={handleReviewLater}>
              <Icon symbol="schedule" weight={200} />
              {t("batches.transaction_detail.actions.review_later")}
            </Button>
          </div>
        </Card>
      </PageContainer>

      {/* Account Selection Dialog */}
      <Dialog open={isAccountSelectionDialogOpen} onOpenChange={setIsAccountSelectionDialogOpen}>
        <DialogContent className="sm:max-w-[640px]">
          <DialogHeader>
            <DialogTitle>{t("batches.transaction_detail.account_selection_dialog.title")}</DialogTitle>
            <p className="mt-2 text-sm text-foreground">
              {t("batches.transaction_detail.account_selection_dialog.description")}
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
                        ? t("batches.transaction_detail.account_selection_dialog.savings_account")
                        : t("batches.transaction_detail.account_selection_dialog.checking_account")}
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
                          {t("batches.transaction_detail.account_selection_dialog.primary")}
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
              {t("batches.transaction_detail.account_selection_dialog.add_new_account")}
            </Button>
          </DialogBody>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="secondary">
                {t("batches.transaction_detail.account_selection_dialog.cancel")}
              </Button>
            </DialogClose>
            <Button 
              variant="default" 
              disabled={!selectedAccount}
              onClick={handleConfirmAccountSelection}
            >
              {t("batches.transaction_detail.account_selection_dialog.select_account")}
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

      {/* Reject Payment Dialog */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent className={`
          gap-12
          sm:max-w-[600px]
        `}
        >
          <DialogHeader>
            <DialogTitle>{t("batches.transaction_detail.reject_dialog.title")}</DialogTitle>
            <DialogDescription>
              {t("batches.transaction_detail.reject_dialog.description")}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="secondary">
                {t("batches.transaction_detail.reject_dialog.cancel")}
              </Button>
            </DialogClose>
            <Button variant="destructive-medium" onClick={handleRejectPayment}>
              {t("batches.transaction_detail.reject_dialog.confirm")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
