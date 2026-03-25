import { useTranslation } from "react-i18next";
import { usePortalContainer } from "@adamosuiteservices/ui/use-portal-container";
import { createPortal } from "react-dom";
import { useParams, useNavigate, Link } from "react-router";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
} from "@adamosuiteservices/ui/breadcrumb";
import { PageContainer } from "@/features/common/components/layout/page-container";
import { Button } from "@adamosuiteservices/ui/button";
import { Card } from "@adamosuiteservices/ui/card";
import { Icon } from "@adamosuiteservices/ui/icon";
import { Badge } from "@adamosuiteservices/ui/badge";
import { Alert, AlertTitle, AlertDescription } from "@adamosuiteservices/ui/alert";
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
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@adamosuiteservices/ui/input-otp";
import { ToastManager } from "@adamosuiteservices/ui/toaster";
import { useState, useEffect } from "react";

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

  // Mock transaction data - in real implementation, fetch by id
  const originalTransaction = {
    id: id || "1",
    status: "returned" as "returned" | "rejected",
    beneficiary: {
      fullName: "Juan Carlos Gutierrez Diaz",
      idType: "Cédula de ciudadanía",
      idNumber: "129.330.220",
      hasIssues: false,
    },
    payment: {
      amount: 2331876,
      accountType: "Corriente",
      bank: "Davivienda",
      accountNumber: "002-83336-90116",
      accountMismatch: false,
    },
    reference: {
      number: "JKL-5678",
      notFound: false,
    },
    restrictiveList: null as {
      listName: string;
      riskLevel: "low" | "medium" | "high";
    } | null,
  };

  // local editable transaction state
  const [transaction, setTransaction] = useState(originalTransaction);

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

  // Load beneficiary data when edit dialog opens
  useEffect(() => {
    if (isEditDialogOpen && transaction) {
      const nameParts = transaction.beneficiary.fullName.split(" ").filter(part => part.length > 0);
      
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
        firstName = nameParts.slice(0, 2).join(" ");
        lastName = nameParts.slice(2).join(" ");
      }
      
      const documentType = mapDocumentTypeToCode(transaction.beneficiary.idType);
      
      setFirstName(firstName);
      setLastName(lastName);
      setDocumentType(documentType);
      setDocumentNumber(transaction.beneficiary.idNumber.replace(/\./g, ""));
      
      setOriginalFirstName(firstName);
      setOriginalLastName(lastName);
      setOriginalDocumentType(documentType);
      setOriginalDocumentNumber(transaction.beneficiary.idNumber.replace(/\./g, ""));
    }
  }, [isEditDialogOpen, transaction]);

  // Load payment data when payment dialog opens
  useEffect(() => {
    if (isPaymentDialogOpen && transaction) {
      const accountTypeCode = transaction.payment.accountType.toLowerCase() === "corriente" ? "corriente" : "ahorros";
      const bankCode = mapBankToCode(transaction.payment.bank);
      
      setPaymentAmount(transaction.payment.amount.toString());
      setAccountType(accountTypeCode);
      setBank(bankCode);
      setAccountNumber(transaction.payment.accountNumber);
      
      setOriginalPaymentAmount(transaction.payment.amount.toString());
      setOriginalAccountType(accountTypeCode);
      setOriginalBank(bankCode);
      setOriginalAccountNumber(transaction.payment.accountNumber);
    }
  }, [isPaymentDialogOpen, transaction]);

  // Load reference data when reference dialog opens
  useEffect(() => {
    if (isReferenceDialogOpen && transaction) {
      const refNumber = transaction.reference.number || "";
      setReferenceNumber(refNumber);
      setOriginalReferenceNumber(refNumber);
    }
  }, [isReferenceDialogOpen, transaction]);

  /**
   * check if beneficiary has changes
   */
  const hasBeneficiaryChanges = (): boolean => {
    return (
      firstName !== originalFirstName ||
      lastName !== originalLastName ||
      documentType !== originalDocumentType ||
      documentNumber !== originalDocumentNumber
    );
  };

  /**
   * check if payment has changes
   */
  const hasPaymentChanges = (): boolean => {
    return (
      paymentAmount !== originalPaymentAmount ||
      accountType !== originalAccountType ||
      bank !== originalBank ||
      accountNumber !== originalAccountNumber
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
    const documentTypeMap: Record<string, string> = {
      cc: "Cédula de ciudadanía",
      ce: "Cédula de extranjería",
      passport: "Pasaporte",
    };

    const formattedNumber = documentNumber.replace(/\B(?=(\d{3})+(?!\d))/g, ".");

    setTransaction({
      ...transaction,
      beneficiary: {
        ...transaction.beneficiary,
        fullName: `${firstName} ${lastName}`,
        idType: documentTypeMap[documentType] || documentType,
        idNumber: formattedNumber,
      },
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

    setTransaction({
      ...transaction,
      payment: {
        ...transaction.payment,
        amount: parseFloat(paymentAmount),
        accountType: accountTypeMap[accountType] || accountType,
        bank: bankMap[bank] || bank,
        accountNumber: accountNumber,
      },
    });

    ToastManager.show({
      message: "Información del pago actualizada",
      variant: "success",
    });

    setIsPaymentDialogOpen(false);
  };

  /**
   * handle save reference
   */
  const handleSaveReference = () => {
    setTransaction({
      ...transaction,
      reference: {
        ...transaction.reference,
        number: referenceNumber,
        notFound: !referenceNumber,
      },
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
  const handleOtpSubmit = () => {
    console.log("OTP submitted:", otpCode);

    setIsOtpDialogOpen(false);
    setOtpCode("");

    ToastManager.show({
      message: t("transactions:transactions.messages.payment_corrected"),
      variant: "success",
    });

    navigate("/transactions");
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
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  /**
   * get badge variant based on transaction status
   */
  const getStatusVariant = (status: "returned" | "rejected"): "warning-medium" | "destructive-medium" => {
    return status === "returned" ? "warning-medium" : "destructive-medium";
  };

  /**
   * get return/rejection reason
   */
  const getReturnReason = (): string => {
    if (transaction.status === "returned") {
      return "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum mollis nunc a molestie dictum. Mauris venenatis, felis scelerisque aliquet lacinia, nulla nisi venenatis odio, id blandit mauris.";
    }
    return "El pago ha sido rechazado por cumplimiento debido a que se detectó una coincidencia en listas restrictivas.";
  };

  /**
   * risk level component
   */
  const RiskLevel = ({ level }: { level: "low" | "medium" | "high" }) => {
    const config = {
      low: { label: "Riesgo bajo", className: "bg-success-100 text-success-700" },
      medium: { label: "Riesgo medio", className: "bg-warning-100 text-warning-700" },
      high: { label: "Riesgo alto", className: "bg-error-100 text-error-700" },
    };

    const { label, className } = config[level];

    return (
      <div className={`inline-flex items-center gap-2 rounded-full px-3 py-1 ${className}`}>
        <div className="size-2 rounded-full bg-current" />
        <span className="text-sm font-semibold">{label}</span>
      </div>
    );
  };

  return (
    <>
      {sidebarTopBarPortal && createPortal(
        <Breadcrumb>
          <BreadcrumbList className="flex-nowrap">
            <BreadcrumbItem className="hidden md:block">
              <BreadcrumbLink asChild>
                <Link to="/transactions">{t("transactions:transactions.page_title")}</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbItem className="md:hidden">
              <button onClick={() => navigate("/transactions")} className="flex h-9 w-9 items-center justify-center">
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
        <Card className="rounded-3xl p-6 flex flex-col gap-6">
          {/* payment status header */}
          <div className="flex items-center gap-4">
            <p className="text-sm text-[#41454c]">{t("transactions:transactions.correct_payment.payment_status")}</p>
            <Badge 
              variant={getStatusVariant(transaction.status)} 
              className="h-8 px-2 text-sm leading-5"
            >
              {t(`transactions:transactions.status.${transaction.status}`)}
            </Badge>
          </div>

          {/* Alert with return/rejection reason */}
          <Alert variant={transaction.status === "returned" ? "warning" : "destructive"} className="border-0">
            <Icon symbol="info" weight={200} />
            <AlertTitle>
              {t(`transactions:transactions.correct_payment.${transaction.status === "returned" ? "return_reason_title" : "rejection_reason_title"}`)}
            </AlertTitle>
            <AlertDescription>
              {getReturnReason()}
            </AlertDescription>
          </Alert>

          {/* 2x2 grid of sections */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 w-full">
            {/* beneficiary section */}
            <div className="bg-[#f8f8f9] rounded-3xl p-6 flex flex-col gap-6">
              {/* header */}
              <div className="flex items-center justify-between h-5">
                <p className="text-sm text-[#41454c]">{t("batches:batches.transaction_detail.beneficiary.title")}</p>
                <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline">
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
                        <div className="flex-1 min-w-[250px] flex flex-col gap-2">
                          <Label htmlFor="firstName" className="text-xs text-[#41454c]">
                            {t("batches:batches.transaction_detail.edit_dialog.first_name")}
                          </Label>
                          <Input
                            id="firstName"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            className="h-10"
                          />
                        </div>
                        <div className="flex-1 min-w-[250px] flex flex-col gap-2">
                          <Label htmlFor="lastName" className="text-xs text-[#41454c]">
                            {t("batches:batches.transaction_detail.edit_dialog.last_name")}
                          </Label>
                          <Input
                            id="lastName"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            className="h-10"
                          />
                        </div>
                        <div className="flex-1 min-w-[250px] flex flex-col gap-2">
                          <Label htmlFor="documentType" className="text-xs text-[#41454c]">
                            {t("batches:batches.transaction_detail.edit_dialog.document_type")}
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
                        <div className="flex-1 min-w-[250px] flex flex-col gap-2">
                          <Label htmlFor="documentNumber" className="text-xs text-[#41454c]">
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
              <Card className="rounded-3xl p-4 flex flex-col gap-6 border-0">
                <div className="flex flex-col gap-2">
                  <p className="text-xs text-[#41454c]">{t("batches:batches.transaction_detail.beneficiary.full_name")}</p>
                  <div className="flex items-center gap-2 pl-2">
                    <Icon symbol="account_circle" weight={200} className="text-[#161719] size-[24px]" />
                    <p className="text-sm font-semibold text-[#161719]">{transaction.beneficiary.fullName}</p>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <p className="text-xs text-[#41454c]">{t("batches:batches.transaction_detail.beneficiary.id_type")}</p>
                  <div className="flex items-center gap-2 pl-2">
                    <Icon symbol="contacts" weight={200} className="text-[#161719] size-[24px]" />
                    <p className="text-sm font-semibold text-[#161719]">
                      {transaction.beneficiary.idType}: {transaction.beneficiary.idNumber}
                    </p>
                  </div>
                </div>
                {!transaction.beneficiary.hasIssues && (
                  <Badge variant="default-medium" className="h-8 px-2 bg-[#e9f9ef] text-sm leading-5">
                    {t("batches:batches.transaction_detail.beneficiary.no_issues")}
                  </Badge>
                )}
              </Card>
            </div>

            {/* payment information section */}
            <div className="bg-[#f8f8f9] rounded-3xl p-6 flex flex-col gap-6">
              <div className="flex items-center justify-between h-5">
                <p className="text-sm text-[#41454c]">{t("batches:batches.transaction_detail.payment_info.title")}</p>
                <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline">
                      <Icon symbol="edit" weight={200} />
                      {t("batches:batches.transaction_detail.payment_info.edit")}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[640px]">
                    <DialogHeader>
                      <DialogTitle>{t("batches:batches.transaction_detail.payment_edit_dialog.title")}</DialogTitle>
                    </DialogHeader>
                    <DialogBody className="flex flex-col gap-8">
                      <div className="flex flex-wrap gap-4">
                        <div className="flex-1 min-w-[250px] flex flex-col gap-2">
                          <Label htmlFor="paymentAmount" className="text-xs text-[#41454c]">
                            {t("batches:batches.transaction_detail.payment_edit_dialog.payment_amount")}
                          </Label>
                          <Input
                            id="paymentAmount"
                            value={paymentAmount}
                            onChange={(e) => setPaymentAmount(e.target.value)}
                            className="h-10"
                          />
                        </div>
                        <div className="flex-1 min-w-[250px] flex flex-col gap-2">
                          <Label htmlFor="accountType" className="text-xs text-[#41454c]">
                            {t("batches:batches.transaction_detail.payment_edit_dialog.account_type")}
                          </Label>
                          <Select value={accountType} onValueChange={setAccountType}>
                            <SelectTrigger className="h-10 w-full">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="corriente">Corriente</SelectItem>
                              <SelectItem value="ahorros">Ahorros</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex-1 min-w-[250px] flex flex-col gap-2">
                          <Label htmlFor="bank" className="text-xs text-[#41454c]">
                            {t("batches:batches.transaction_detail.payment_edit_dialog.bank")}
                          </Label>
                          <Select value={bank} onValueChange={setBank}>
                            <SelectTrigger className="h-10 w-full">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="bancolombia">Bancolombia</SelectItem>
                              <SelectItem value="banco-bogota">Banco de Bogotá</SelectItem>
                              <SelectItem value="davivienda">Davivienda</SelectItem>
                              <SelectItem value="bbva">BBVA Colombia</SelectItem>
                              <SelectItem value="banco-popular">Banco Popular Colombia</SelectItem>
                              <SelectItem value="av-villas">Banco AV Villas</SelectItem>
                              <SelectItem value="caja-social">Banco Caja Social</SelectItem>
                              <SelectItem value="colpatria">Scotiabank Colpatria</SelectItem>
                              <SelectItem value="agrario">Banco Agrario de Colombia</SelectItem>
                              <SelectItem value="occidente">Banco de Occidente Colombia</SelectItem>
                              <SelectItem value="gnb-sudameris">Banco GNB Sudameris Colombia</SelectItem>
                              <SelectItem value="citibank">Citibank Colombia</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex-1 min-w-[250px] flex flex-col gap-2">
                          <Label htmlFor="accountNumber" className="text-xs text-[#41454c]">
                            {t("batches:batches.transaction_detail.payment_edit_dialog.account_number")}
                          </Label>
                          <Input
                            id="accountNumber"
                            value={accountNumber}
                            onChange={(e) => setAccountNumber(e.target.value)}
                            className="h-10"
                          />
                        </div>
                        <Button variant="link" className="text-[#0e9384] h-6 px-0">
                          {t("batches:batches.transaction_detail.payment_edit_dialog.select_saved_account")}
                        </Button>
                      </div>
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

              <Card className="rounded-3xl p-4 flex flex-col gap-6 border-0">
                <div className="flex flex-col gap-2">
                  <p className="text-xs text-[#41454c]">{t("batches:batches.transaction_detail.payment_info.amount")}</p>
                  <div className="flex items-center gap-2 pl-2">
                    <Icon symbol="paid" weight={200} className="text-[#161719] size-[24px]" />
                    <p className="text-sm font-semibold text-[#161719]">{formatAmount(transaction.payment.amount)}</p>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <p className="text-xs text-[#41454c]">{t("batches:batches.transaction_detail.payment_info.account_type")}</p>
                  <div className="flex items-center gap-2 pl-2">
                    <Icon symbol="account_balance" weight={200} className="text-[#161719] size-[24px]" />
                    <p className="text-sm font-semibold text-[#161719]">
                      {transaction.payment.accountType}. {transaction.payment.bank} Nº {transaction.payment.accountNumber}
                    </p>
                  </div>
                </div>
                {transaction.payment.accountMismatch && (
                  <Badge variant="default-medium" className="h-8 px-2 bg-[#fef5e7] text-sm leading-5">
                    {t("batches:batches.transaction_detail.payment_info.account_mismatch")}
                  </Badge>
                )}
              </Card>
            </div>

            {/* payment reference section */}
            <div className="bg-[#f8f8f9] rounded-3xl p-6 flex flex-col gap-6">
              <div className="flex items-center justify-between h-5">
                <p className="text-sm text-[#41454c]">{t("batches:batches.transaction_detail.payment_reference.title")}</p>
                <Dialog open={isReferenceDialogOpen} onOpenChange={setIsReferenceDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline">
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
                        <Label htmlFor="referenceNumber" className="text-xs text-[#41454c]">
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

              <Card className="rounded-3xl p-4 flex flex-col gap-6 border-0">
                <div className="flex flex-col gap-2">
                  <p className="text-xs text-[#41454c]">{t("batches:batches.transaction_detail.payment_reference.reference_number")}</p>
                  <div className="flex items-center gap-2 pl-2">
                    <Icon symbol="confirmation_number" weight={200} className="text-[#161719] size-[24px]" />
                    <p className="text-sm font-semibold text-[#161719]">{transaction.reference.number || "--"}</p>
                  </div>
                </div>
                {transaction.reference.notFound && (
                  <Badge variant="default-medium" className="h-8 px-2 bg-[#fef5e7] text-sm leading-5">
                    {t("batches:batches.transaction_detail.payment_reference.not_found")}
                  </Badge>
                )}
              </Card>
            </div>

            {/* restrictive list section */}
            {transaction.restrictiveList && (
              <div className="bg-[#e5f3fa] rounded-3xl p-6 flex flex-col gap-6">
                <div className="flex items-center gap-4 h-5">
                  <p className="text-sm text-[#41454c]">{t("batches:batches.transaction_detail.restrictive_list.title")}</p>
                </div>

                <Card className="rounded-3xl p-4 flex flex-col gap-6 border-0">
                  <div className="flex flex-col gap-2">
                    <p className="text-xs text-[#41454c]">{t("batches:batches.transaction_detail.restrictive_list.list_name")}</p>
                    <div className="flex items-center gap-2 pl-2">
                      <Icon symbol="clarify" weight={200} className="text-[#161719] size-[24px]" />
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
          <div className="flex items-center gap-6 mt-6">
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
              <InputOTPSlot index={0} className="flex-1 h-10" />
              <InputOTPSlot index={1} className="flex-1 h-10" />
              <InputOTPSlot index={2} className="flex-1 h-10" />
              <InputOTPSlot index={3} className="flex-1 h-10" />
              <InputOTPSlot index={4} className="flex-1 h-10" />
              <InputOTPSlot index={5} className="flex-1 h-10" />
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
    </>
  );
};
