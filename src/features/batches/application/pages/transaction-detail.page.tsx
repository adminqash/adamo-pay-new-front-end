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
import { useTransactionDetail } from "../hooks/use-transaction-detail";
import { ToastManager } from "@adamosuiteservices/ui/toaster";
import { useState, useEffect } from "react";

/**
 * transaction detail page
 * 
 * displays detailed information about a specific transaction within a batch
 */
export const TransactionDetailPage = () => {
  const { t } = useTranslation(["batches", "transactions"]);
  const { batchId, transactionId } = useParams<{ batchId: string; transactionId: string }>();
  const navigate = useNavigate();
  const { transaction: originalTransaction } = useTransactionDetail(transactionId || "1");

  const sidebarTopBarPortal = usePortalContainer("[data-slot='sidebar-top-bar-portal']");

  // local editable transaction state
  const [transaction, setTransaction] = useState(originalTransaction);

  // sync with original transaction on mount or id change
  useEffect(() => {
    setTransaction(originalTransaction);
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

  // reference dialog state
  const [isReferenceDialogOpen, setIsReferenceDialogOpen] = useState(false);
  const [referenceNumber, setReferenceNumber] = useState("");
  // original value for comparison
  const [originalReferenceNumber, setOriginalReferenceNumber] = useState("");

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
      const nameParts = transaction.beneficiary.fullName.split(" ").filter(part => part.length > 0);
      
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

  /**
   * check if beneficiary data has changed
   */
  const hasBeneficiaryChanges = () => {
    return firstName !== originalFirstName ||
      lastName !== originalLastName ||
      documentType !== originalDocumentType ||
      documentNumber !== originalDocumentNumber;
  };

  /**
   * check if payment data has changed
   */
  const hasPaymentChanges = () => {
    return paymentAmount !== originalPaymentAmount ||
      accountType !== originalAccountType ||
      bank !== originalBank ||
      accountNumber !== originalAccountNumber;
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
  const handleSaveBeneficiary = () => {
    const fullName = `${firstName} ${lastName}`.trim();
    const idType = mapDocumentTypeToDisplay(documentType);
    
    setTransaction(prev => ({
      ...prev,
      beneficiary: {
        ...prev.beneficiary,
        fullName,
        idType,
        idNumber: documentNumber,
      },
    }));
    
    setIsEditDialogOpen(false);
    ToastManager.show({
      message: "Cambios guardados exitosamente",
      variant: "success",
    });
  };

  /**
   * save payment changes
   */
  const handleSavePayment = () => {
    // parse amount (remove dots and convert to number)
    const amount = parseInt(paymentAmount.replace(/\./g, ""), 10);
    const accType = accountType.charAt(0).toUpperCase() + accountType.slice(1);
    const bankDisplay = mapBankToDisplay(bank);
    
    setTransaction(prev => ({
      ...prev,
      payment: {
        ...prev.payment,
        amount: isNaN(amount) ? prev.payment.amount : amount,
        accountType: accType,
        bank: bankDisplay,
        accountNumber,
      },
    }));
    
    setIsPaymentDialogOpen(false);
    ToastManager.show({
      message: "Cambios guardados exitosamente",
      variant: "success",
    });
  };

  /**
   * save reference changes
   */
  const handleSaveReference = () => {
    setTransaction(prev => ({
      ...prev,
      reference: {
        ...prev.reference,
        number: referenceNumber || null,
        notFound: !referenceNumber,
      },
    }));
    
    setIsReferenceDialogOpen(false);
    ToastManager.show({
      message: "Cambios guardados exitosamente",
      variant: "success",
    });
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
  const getStatusVariant = (status: string): "default-medium" | "success-medium" | "warning-medium" | "destructive-medium" | "waiting-medium" => {
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
      <div className="flex gap-1 w-[100px] p-1 bg-[#f8f8f9] rounded-2xl">
        {segments.map((active, index) => (
          <div
            key={index}
            className={`flex-1 h-2 rounded-full border border-[#e2e3e5] ${
              active
                ? level === "high"
                  ? "bg-[#ef4444]"
                  : level === "medium"
                    ? "bg-[#f59e0b]"
                    : "bg-[#22c55e]"
                : "bg-white"
            }`}
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
            <BreadcrumbItem className="hidden md:block">
              <BreadcrumbLink asChild>
                <Link to="/batches">{t("batches.page_title")}</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="hidden md:block" />
            <BreadcrumbItem className="hidden md:block">
              <BreadcrumbLink asChild>
                <Link to={`/batches/${batchId}`}>{t("batches.detail.title")}</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbItem className="md:hidden">
              <button onClick={() => navigate(`/batches/${batchId}`)} className="flex h-9 w-9 items-center justify-center">
                <BreadcrumbEllipsis />
              </button>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem className="min-w-0">
              <BreadcrumbPage className="truncate">Pago</BreadcrumbPage>
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
            <p className="text-sm text-[#41454c]">{t("batches.transaction_detail.payment_status")}</p>
            <Badge 
              variant={getStatusVariant(transaction.status)} 
              className={`h-8 px-2 text-sm leading-5 ${
                transaction.status === 'pending' ? 'bg-neutrals-50' : 
                transaction.status === 'validated' ? 'bg-[#E5F3FA] text-neutrals-700' : 
                ''
              }`}
            >
              {getStatusLabel()}
            </Badge>
          </div>

          {/* 2x2 grid of sections */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 w-full">
            {/* beneficiary section */}
            <div className="bg-[#f8f8f9] rounded-3xl p-6 flex flex-col gap-6">
              {/* header */}
              <div className="flex items-center justify-between h-5">
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
                        <div className="flex-1 min-w-[250px] flex flex-col gap-2">
                          <Label htmlFor="firstName" className="text-xs text-[#41454c]">
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
                        <div className="flex-1 min-w-[250px] flex flex-col gap-2">
                          <Label htmlFor="lastName" className="text-xs text-[#41454c]">
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
                        <div className="flex-1 min-w-[250px] flex flex-col gap-2">
                          <Label htmlFor="documentType" className="text-xs text-[#41454c]">
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
                        <div className="flex-1 min-w-[250px] flex flex-col gap-2">
                          <Label htmlFor="documentNumber" className="text-xs text-[#41454c]">
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
              <Card className="rounded-3xl p-4 flex flex-col gap-6 border-0">
                {/* full name */}
                <div className="flex flex-col gap-2">
                  <p className="text-xs text-[#41454c]">{t("batches.transaction_detail.beneficiary.full_name")}</p>
                  <div className="flex items-center gap-2 pl-2">
                    <Icon symbol="account_circle" weight={200} className="text-[#161719] size-[24px]" />
                    <p className="text-sm font-semibold text-[#161719]">{transaction.beneficiary.fullName}</p>
                  </div>
                </div>

                {/* id type and number */}
                <div className="flex flex-col gap-2">
                  <p className="text-xs text-[#41454c]">{t("batches.transaction_detail.beneficiary.id_type")}</p>
                  <div className="flex items-center gap-2 pl-2">
                    <Icon symbol="contacts" weight={200} className="text-[#161719] size-[24px]" />
                    <p className="text-sm font-semibold text-[#161719]">
                      {transaction.beneficiary.idType}: {transaction.beneficiary.idNumber}
                    </p>
                  </div>
                </div>

                {/* status badge */}
                {!transaction.beneficiary.hasIssues && (
                  <Badge variant="default-medium" className="h-8 px-2 bg-[#e9f9ef] text-sm leading-5">
                    {t("batches.transaction_detail.beneficiary.no_issues")}
                  </Badge>
                )}
              </Card>
            </div>

            {/* payment information section */}
            <div className="bg-[#f8f8f9] rounded-3xl p-6 flex flex-col gap-6">
              {/* header */}
              <div className="flex items-center justify-between h-5">
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
                      {/* form fields */}
                      <div className="flex flex-wrap gap-4">
                        {/* payment amount */}
                        <div className="flex-1 min-w-[250px] flex flex-col gap-2">
                          <Label htmlFor="paymentAmount" className="text-xs text-[#41454c]">
                            {t("batches.transaction_detail.payment_edit_dialog.payment_amount")}
                          </Label>
                          <Input
                            id="paymentAmount"
                            value={paymentAmount}
                            onChange={(e) => setPaymentAmount(e.target.value)}
                            className="h-10"
                          />
                        </div>

                        {/* account type */}
                        <div className="flex-1 min-w-[250px] flex flex-col gap-2">
                          <Label htmlFor="accountType" className="text-xs text-[#41454c]">
                            {t("batches.transaction_detail.payment_edit_dialog.account_type")}
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

                        {/* bank */}
                        <div className="flex-1 min-w-[250px] flex flex-col gap-2">
                          <Label htmlFor="bank" className="text-xs text-[#41454c]">
                            {t("batches.transaction_detail.payment_edit_dialog.bank")}
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

                        {/* account number */}
                        <div className="flex-1 min-w-[250px] flex flex-col gap-2">
                          <Label htmlFor="accountNumber" className="text-xs text-[#41454c]">
                            {t("batches.transaction_detail.payment_edit_dialog.account_number")}
                          </Label>
                          <Input
                            id="accountNumber"
                            value={accountNumber}
                            onChange={(e) => setAccountNumber(e.target.value)}
                            className="h-10"
                          />
                        </div>

                        {/* link button */}
                        <Button variant="link" className="text-[#0e9384] h-6 px-0">
                          {t("batches.transaction_detail.payment_edit_dialog.select_saved_account")}
                        </Button>
                      </div>
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
              <Card className="rounded-3xl p-4 flex flex-col gap-6 border-0">
                {/* amount */}
                <div className="flex flex-col gap-2">
                  <p className="text-xs text-[#41454c]">{t("batches.transaction_detail.payment_info.amount")}</p>
                  <div className="flex items-center gap-2 pl-2">
                    <Icon symbol="paid" weight={200} className="text-[#161719] size-[24px]" />
                    <p className="text-sm font-semibold text-[#161719]">{formatAmount(transaction.payment.amount)}</p>
                  </div>
                </div>

                {/* account type and number */}
                <div className="flex flex-col gap-2">
                  <p className="text-xs text-[#41454c]">{t("batches.transaction_detail.payment_info.account_type")}</p>
                  <div className="flex items-center gap-2 pl-2">
                    <Icon symbol="account_balance" weight={200} className="text-[#161719] size-[24px]" />
                    <p className="text-sm font-semibold text-[#161719]">
                      {transaction.payment.accountType}. {transaction.payment.bank} Nº {transaction.payment.accountNumber}
                    </p>
                  </div>
                </div>

                {/* warning badge */}
                {transaction.payment.accountMismatch && (
                  <Badge variant="default-medium" className="h-8 px-2 bg-[#fef5e7] text-sm leading-5">
                    {t("batches.transaction_detail.payment_info.account_mismatch")}
                  </Badge>
                )}
              </Card>
            </div>

            {/* payment reference section */}
            <div className="bg-[#f8f8f9] rounded-3xl p-6 flex flex-col gap-6">
              {/* header */}
              <div className="flex items-center justify-between h-5">
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
                        <Label htmlFor="referenceNumber" className="text-xs text-[#41454c]">
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
              <Card className="rounded-3xl p-4 flex flex-col gap-6 border-0">
                {/* reference number */}
                <div className="flex flex-col gap-2">
                  <p className="text-xs text-[#41454c]">{t("batches.transaction_detail.payment_reference.reference_number")}</p>
                  <div className="flex items-center gap-2 pl-2">
                    <Icon symbol="confirmation_number" weight={200} className="text-[#161719] size-[24px]" />
                    <p className="text-sm font-semibold text-[#161719]">{transaction.reference.number || "--"}</p>
                  </div>
                </div>

                {/* warning badge */}
                {transaction.reference.notFound && (
                  <Badge variant="default-medium" className="h-8 px-2 bg-[#fef5e7] text-sm leading-5">
                    {t("batches.transaction_detail.payment_reference.not_found")}
                  </Badge>
                )}
              </Card>
            </div>

            {/* restrictive list section */}
            {transaction.restrictiveList && (
              <div className="bg-[#e5f3fa] rounded-3xl p-6 flex flex-col gap-6">
                {/* header */}
                <div className="flex items-center gap-4 h-5">
                  <p className="text-sm text-[#41454c]">{t("batches.transaction_detail.restrictive_list.title")}</p>
                </div>

                {/* content card */}
                <Card className="rounded-3xl p-4 flex flex-col gap-6 border-0">
                  {/* list name */}
                  <div className="flex flex-col gap-2">
                    <p className="text-xs text-[#41454c]">{t("batches.transaction_detail.restrictive_list.list_name")}</p>
                    <div className="flex items-center gap-2 pl-2">
                      <Icon symbol="clarify" weight={200} className="text-[#161719] size-[24px]" />
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
          <div className="flex flex-wrap items-center justify-between gap-12 mt-6">
            <div className="flex items-center gap-6">
              <Button variant="destructive-medium">
                {t("batches.transaction_detail.actions.reject")}
              </Button>
              <Button variant="default">
                <Icon symbol="check" weight={200} />
                {t("batches.transaction_detail.actions.approve")}
              </Button>
            </div>
            <Button variant="default">
              <Icon symbol="schedule" weight={200} />
              {t("batches.transaction_detail.actions.review_later")}
            </Button>
          </div>
        </Card>
      </PageContainer>
    </>
  );
};
