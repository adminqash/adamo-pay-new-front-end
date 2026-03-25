import { useTranslation } from "react-i18next";
import { usePortalContainer } from "@adamosuiteservices/ui/use-portal-container";
import { createPortal } from "react-dom";
import { Link, useNavigate } from "react-router";
import { useState } from "react";
import { PageContainer } from "@/features/common/components/layout/page-container";
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
import { Button } from "@adamosuiteservices/ui/button";
import { Input } from "@adamosuiteservices/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@adamosuiteservices/ui/input-group";
import { Label } from "@adamosuiteservices/ui/label";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@adamosuiteservices/ui/input-otp";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { Icon } from "@adamosuiteservices/ui/icon";
import { Checkbox } from "@adamosuiteservices/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@adamosuiteservices/ui/select";
import { Alert, AlertTitle, AlertDescription } from "@adamosuiteservices/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogBody,
  DialogFooter,
  DialogClose,
} from "@adamosuiteservices/ui/dialog";
import { ToastManager } from "@adamosuiteservices/ui/toaster";
import {
  AmountInputContainer,
  AmountInputFlag,
  AmountInput,
  AmountInputAction,
} from "@adamosuiteservices/ui/amount-input";
import {
  SelectableCard,
  SelectableCardGroup,
  SelectableCardTitle,
  SelectableCardDescription,
} from "@adamosuiteservices/ui/selectable-card";

/**
 * create payment page
 * 
 * page for creating a new payment
 */
export const CreatePaymentPage = () => {
  const { t } = useTranslation("transactions");
  const navigate = useNavigate();
  const sidebarTopBarPortal = usePortalContainer("[data-slot='sidebar-top-bar-portal']");

  // Step state
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedBeneficiary, setSelectedBeneficiary] = useState<typeof beneficiaries[0] | null>(null);

  // Step 1 states
  const [showManualForm, setShowManualForm] = useState(false);
  const [documentType, setDocumentType] = useState("");
  const [documentNumber, setDocumentNumber] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [accountType, setAccountType] = useState("");
  const [bank, setBank] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [saveBeneficiary, setSaveBeneficiary] = useState(true);

  // Step 2 states
  const [selectedAccount, setSelectedAccount] = useState<string>();
  const [amount, setAmount] = useState("");

  // 2FA Dialog state
  const [show2faDialog, setShow2faDialog] = useState(false);
  const [otpCode, setOtpCode] = useState("");

  // TODO: Replace with actual accounts data from API
  const accounts = [
    { id: "principal", name: t("transactions.create_payment.account_principal"), balance: "124.400.321,52 COP" },
    { id: "payroll", name: t("transactions.create_payment.account_payroll"), balance: "45.000.000,00 COP" },
    { id: "savings", name: t("transactions.create_payment.account_savings"), balance: "15.000.000,00 COP" },
  ];

  // TODO: Replace with actual recent beneficiaries data from API
  const beneficiaries = [
    { id: 1, name: "Juan Carlos Gutierrez Díaz", docType: "Cédula de ciudadanía", docNumber: "112.393.994" },
    { id: 2, name: "María Fernanda López", docType: "Cédula de ciudadanía", docNumber: "91.234.567" },
    { id: 3, name: "Andrés Felipe Martínez", docType: "Cédula de ciudadanía", docNumber: "53.456.789" },
  ];

  const handleBeneficiarySelect = (beneficiary: typeof beneficiaries[0]) => {
    setSelectedBeneficiary(beneficiary);
    setCurrentStep(2);
  };

  const handleContinueStep1 = () => {
    // Create beneficiary from manual form
    const manualBeneficiary = {
      id: 0,
      name: `${firstName} ${lastName}`,
      docType: documentType,
      docNumber: documentNumber,
    };
    setSelectedBeneficiary(manualBeneficiary);
    setCurrentStep(2);
  };

  const handleEditBeneficiary = () => {
    setCurrentStep(1);
  };

  const handleUseAll = () => {
    if (selectedAccount) {
      const account = accounts.find(acc => acc.id === selectedAccount);
      if (account) {
        // Extract numeric value from balance
        const numericBalance = account.balance.replace(/[^0-9,]/g, '').replace(',', '.');
        setAmount(numericBalance);
      }
    }
  };

  const isStep1Valid = showManualForm 
    ? documentType && documentNumber && firstName && lastName && accountType && bank && accountNumber
    : false;
  
  const isStep2Valid = selectedAccount && amount && parseFloat(amount.replace(',', '.')) > 0;

  const handleConfirmPayment = () => {
    // Close dialog
    setShow2faDialog(false);
    
    // Show success toast
    ToastManager.show({
      message: t("transactions.messages.payment_created"),
      variant: "success",
    });
    
    // Navigate to home
    navigate("/");
  };

  return (
    <>
      {sidebarTopBarPortal && createPortal(
        <Breadcrumb>
          <BreadcrumbList className="flex-nowrap">
            <BreadcrumbItem className="hidden md:block">
              <BreadcrumbLink asChild>
                <Link to="/transactions">{t("transactions.page_title")}</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbItem className="md:hidden">
              <button onClick={() => navigate("/transactions")} className="flex h-9 w-9 items-center justify-center">
                <BreadcrumbEllipsis />
              </button>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem className="min-w-0">
              <BreadcrumbPage className="truncate">{t("transactions.create_payment.breadcrumb_title")}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>,
        sidebarTopBarPortal,
      )}
      <PageContainer className="bg-subtle">
        {/* Stepper */}
        <div className="flex items-center gap-2 w-fit mb-6">
          {/* Step 1 */}
          <div className="flex items-center gap-2">
            {currentStep > 1 ? (
              <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                <Icon symbol="check" className="text-white text-[12px]" />
              </div>
            ) : (
              <div className="w-5 h-5 rounded-full border-2 border-primary bg-background flex items-center justify-center shadow-[0px_0px_0px_4px_rgba(var(--primary-rgb),0.1)]">
                <div className="w-2 h-2 rounded-full bg-primary" />
              </div>
            )}
            <p className={`text-sm ${currentStep >= 1 ? 'text-foreground' : 'text-muted-foreground'}`}>
              {t("transactions.create_payment.step_1")}
            </p>
          </div>

          {/* Separator */}
          <div className="w-6 h-px bg-border" />

          {/* Step 2 */}
          <div className="flex items-center gap-2">
            {currentStep > 2 ? (
              <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                <Icon symbol="check" className="text-white text-[12px]" />
              </div>
            ) : currentStep === 2 ? (
              <div className="w-5 h-5 rounded-full border-2 border-primary bg-background flex items-center justify-center shadow-[0px_0px_0px_4px_rgba(var(--primary-rgb),0.1)]">
                <div className="w-2 h-2 rounded-full bg-primary" />
              </div>
            ) : (
              <div className="w-5 h-5 rounded-full border border-border bg-background" />
            )}
            <p className={`text-sm ${currentStep >= 2 ? 'text-foreground' : 'text-muted-foreground'}`}>
              {t("transactions.create_payment.step_2")}
            </p>
          </div>

          {/* Separator */}
          <div className="w-6 h-px bg-border" />

          {/* Step 3 */}
          <div className="flex items-center gap-2">
            {currentStep === 3 ? (
              <div className="w-5 h-5 rounded-full border-2 border-primary bg-background flex items-center justify-center shadow-[0px_0px_0px_4px_rgba(var(--primary-rgb),0.1)]">
                <div className="w-2 h-2 rounded-full bg-primary" />
              </div>
            ) : (
              <div className="w-5 h-5 rounded-full border border-border bg-background" />
            )}
            <p className={`text-sm ${currentStep >= 3 ? 'text-foreground' : 'text-muted-foreground'}`}>
              {t("transactions.create_payment.step_3")}
            </p>
          </div>
        </div>

        {/* Main Card */}
        <div className="flex flex-col gap-6">
        <Card className="p-6 border-border flex flex-col gap-12">
          {currentStep === 1 && (
            <>
              <div className="flex flex-col gap-6">
                {/* Description */}
                <p className="text-sm text-black">{t("transactions.create_payment.description")}</p>

            {/* Search Input */}
            <InputGroup>
              <InputGroupAddon>
                <Icon symbol="search" className="text-lg" />
              </InputGroupAddon>
              <InputGroupInput
                placeholder={t("transactions.create_payment.search_placeholder")}
              />
            </InputGroup>

            {/* Recent Beneficiaries */}
            <Card className="p-6 bg-muted border-0 flex flex-col gap-6">
              <p className="text-sm text-foreground">
                {t("transactions.create_payment.recent_beneficiaries")}
              </p>
              <div className="flex flex-wrap gap-4">
                {beneficiaries.map((beneficiary) => (
                  <Card
                    key={beneficiary.id}
                    className="flex-1 min-w-[250px] bg-background border-0 p-4 cursor-pointer hover:bg-muted transition-colors"
                    onClick={() => handleBeneficiarySelect(beneficiary)}
                  >
                    <div className="flex flex-col gap-2 h-16">
                      <p className="text-xs text-foreground-secondary">
                        {beneficiary.docType}: {beneficiary.docNumber}
                      </p>
                      <div className="flex items-center gap-2 pl-2 h-10">
                        <Icon symbol="account_circle" weight={200} className="text-foreground text-2xl" />
                        <p className="text-sm font-semibold text-foreground">{beneficiary.name}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </Card>

            {/* Toggle Manual Entry */}
            <Button
              variant="link"
              className="h-6 px-0 w-fit"
              onClick={() => setShowManualForm(!showManualForm)}
            >
              {t("transactions.create_payment.toggle_manual")}
              <Icon symbol={showManualForm ? "expand_less" : "expand_more"} className="size-6" />
            </Button>

            {/* Manual Entry Form */}
            {showManualForm && (
              <Card className="p-4 bg-muted border-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Document Type */}
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="documentType" className="text-xs text-foreground">
                      {t("transactions.create_payment.document_type")}
                    </Label>
                    <Select value={documentType} onValueChange={setDocumentType}>
                      <SelectTrigger className="h-10 w-full bg-background">
                        <SelectValue placeholder={t("transactions.create_payment.select_placeholder")} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cc">Cédula de ciudadanía</SelectItem>
                        <SelectItem value="ce">Cédula de extranjería</SelectItem>
                        <SelectItem value="passport">Pasaporte</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Document Number */}
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="documentNumber" className="text-xs text-foreground">
                      {t("transactions.create_payment.document_number")}
                    </Label>
                    <Input
                      id="documentNumber"
                      value={documentNumber}
                      onChange={(e) => setDocumentNumber(e.target.value)}
                      placeholder={t("transactions.create_payment.input_number_placeholder")}
                      className="h-10 bg-background"
                    />
                  </div>

                  {/* First Name */}
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="firstName" className="text-xs text-foreground">
                      {t("transactions.create_payment.first_name")}
                    </Label>
                    <Input
                      id="firstName"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder={t("transactions.create_payment.input_name_placeholder")}
                      className="h-10 bg-background"
                    />
                  </div>

                  {/* Last Name */}
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="lastName" className="text-xs text-foreground">
                      {t("transactions.create_payment.last_name")}
                    </Label>
                    <Input
                      id="lastName"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder={t("transactions.create_payment.input_lastname_placeholder")}
                      className="h-10 bg-background"
                    />
                  </div>

                  {/* Account Type */}
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="accountType" className="text-xs text-foreground">
                      {t("transactions.create_payment.account_type")}
                    </Label>
                    <Select value={accountType} onValueChange={setAccountType}>
                      <SelectTrigger className="h-10 w-full bg-background">
                        <SelectValue placeholder={t("transactions.create_payment.select_placeholder")} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="corriente">Corriente</SelectItem>
                        <SelectItem value="ahorros">Ahorros</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Bank */}
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="bank" className="text-xs text-foreground">
                      {t("transactions.create_payment.bank")}
                    </Label>
                    <Select value={bank} onValueChange={setBank}>
                      <SelectTrigger className="h-10 w-full bg-background">
                        <SelectValue placeholder={t("transactions.create_payment.select_placeholder")} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="davivienda">Davivienda</SelectItem>
                        <SelectItem value="bancolombia">Bancolombia</SelectItem>
                        <SelectItem value="bbva">BBVA</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Account Number - Full Width */}
                  <div className="col-span-full flex flex-col gap-2">
                    <Label htmlFor="accountNumber" className="text-xs text-foreground">
                      {t("transactions.create_payment.account_number")}
                    </Label>
                    <Input
                      id="accountNumber"
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      placeholder={t("transactions.create_payment.input_number_placeholder")}
                      className="h-10 bg-background"
                    />
                  </div>

                  {/* Save Beneficiary Checkbox - Full Width */}
                  <div className="col-span-full flex items-center gap-3">
                    <Checkbox
                      id="saveBeneficiary"
                      checked={saveBeneficiary}
                      onCheckedChange={(checked) => setSaveBeneficiary(checked as boolean)}
                    />
                    <Label htmlFor="saveBeneficiary" className="text-sm text-foreground cursor-pointer">
                      {t("transactions.create_payment.save_beneficiary")}
                    </Label>
                  </div>
                </div>
              </Card>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-6">
            <Button variant="secondary" onClick={() => navigate("/transactions")}>
              {t("transactions.create_payment.cancel")}
            </Button>
            <Button 
              variant="default" 
              disabled={!isStep1Valid}
              onClick={handleContinueStep1}
            >
              {t("transactions.create_payment.continue")}
            </Button>
          </div>
        </>
      )}

      {currentStep === 2 && selectedBeneficiary && (
        <>
          <div className="flex flex-col gap-4">
            {/* Beneficiary Section */}
            <Card className="p-4 bg-muted border-0">
              <div className="flex items-center h-16">
                <div className="flex-1 flex flex-col gap-2">
                  <p className="text-xs text-foreground-secondary">
                    {t("transactions.create_payment.beneficiary_label")}
                  </p>
                  <div className="flex items-center gap-2 pl-2 h-10">
                    <Icon symbol="account_circle" className="text-foreground text-2xl" />
                    <p className="text-sm font-semibold text-foreground">{selectedBeneficiary.name}</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={handleEditBeneficiary}>
                  <Icon symbol="edit" className="size-6" />
                  {t("transactions.create_payment.edit")}
                </Button>
              </div>
            </Card>

            {/* Source Account Section */}
            <Card className="p-4 bg-muted border-0 flex flex-col gap-4">
              <p className="text-xs text-foreground">
                {t("transactions.create_payment.source_account_label")}
              </p>
              <SelectableCardGroup value={selectedAccount} onValueChange={setSelectedAccount} className="w-full">
                <div className="flex flex-wrap gap-4 w-full">
                  {accounts.map((account) => (
                    <SelectableCard
                      key={account.id}
                      value={account.id}
                      className="flex-1 min-w-[250px]"
                    >
                      <div className="flex items-center h-16">
                        <div className="flex-1 flex flex-col gap-2">
                          <SelectableCardTitle>{account.name}</SelectableCardTitle>
                          <div className="flex items-center gap-2 pl-2 h-10">
                            <Icon symbol="paid" className="text-2xl" />
                            <SelectableCardDescription>{account.balance}</SelectableCardDescription>
                          </div>
                        </div>
                      </div>
                    </SelectableCard>
                  ))}
                </div>
              </SelectableCardGroup>
            </Card>

            {/* Amount Section */}
            <Card className="p-4 bg-muted border-0 flex flex-col gap-4">
              <p className="text-xs text-foreground">
                {t("transactions.create_payment.amount_label")}
              </p>
              <div className="flex flex-col gap-2">
                <AmountInputContainer className="gap-2">
                  <AmountInputFlag locale="es-CO" currencySymbol="" />
                  <AmountInput
                    value={amount ? parseFloat(amount.replace(',', '.')) : undefined}
                    onValueChange={(value) => setAmount(value !== undefined ? String(value) : "")}
                    onInput={(e) => {
                      const rawValue = (e.target as HTMLInputElement).value.replace(/[^0-9,]/g, '').replace(',', '.');
                      setAmount(rawValue);
                    }}
                    placeholder={t("transactions.create_payment.amount_placeholder")}
                    locale="es-CO"
                    minimumFractionDigits={2}
                    maximumFractionDigits={2}
                  />
                  <AmountInputAction onClick={handleUseAll}>
                    {t("transactions.create_payment.use_all")}
                  </AmountInputAction>
                </AmountInputContainer>
                {selectedAccount && (
                  <p className="text-xs text-foreground">
                    {t("transactions.create_payment.available")}: {accounts.find(acc => acc.id === selectedAccount)?.balance}
                  </p>
                )}
              </div>
            </Card>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-6">
            <Button variant="secondary" onClick={() => navigate("/transactions")}>
              {t("transactions.create_payment.cancel")}
            </Button>
            <Button 
              variant="default" 
              disabled={!isStep2Valid}
              onClick={() => setCurrentStep(3)}
            >
              {t("transactions.create_payment.continue")}
            </Button>
          </div>
        </>
      )}

      {currentStep === 3 && selectedBeneficiary && selectedAccount && amount && (
        <div className="flex flex-col gap-12">
          {/* Two Column Layout */}
          <div className="flex gap-4 w-full">
              {/* Beneficiary Column */}
              <Card className="flex-1 min-w-[250px] bg-muted border-0 p-6 flex flex-col gap-6">
                <div className="flex items-center justify-between h-5">
                  <p className="text-sm text-foreground">
                    {t("transactions.create_payment.beneficiary_title")}
                  </p>
                  <Button variant="outline" size="sm" onClick={handleEditBeneficiary}>
                    <Icon symbol="edit" className="size-6" />
                    {t("transactions.create_payment.edit")}
                  </Button>
                </div>
                <Card className="bg-background border-0 p-4 flex flex-col gap-6">
                  {/* Full Name */}
                  <div className="flex items-center h-16">
                    <div className="flex-1 flex flex-col gap-2">
                      <p className="text-xs text-foreground-secondary">
                        {t("transactions.create_payment.full_name")}
                      </p>
                      <div className="flex items-center gap-2 pl-2 h-10">
                        <Icon symbol="account_circle" className="text-foreground text-2xl" />
                        <p className="text-sm font-semibold text-foreground">{selectedBeneficiary.name}</p>
                      </div>
                    </div>
                  </div>

                  {/* ID Type and Number */}
                  <div className="flex items-center h-16">
                    <div className="flex-1 flex flex-col gap-2">
                      <p className="text-xs text-foreground-secondary">
                        {t("transactions.create_payment.id_type_number")}
                      </p>
                      <div className="flex items-center gap-2 pl-2 h-10">
                        <Icon symbol="contacts" className="text-foreground text-2xl" />
                        <p className="text-sm font-semibold text-foreground">
                          {selectedBeneficiary.docType}: {selectedBeneficiary.docNumber}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Account Type and Number */}
                  <div className="flex items-center h-16">
                    <div className="flex-1 flex flex-col gap-2">
                      <p className="text-xs text-foreground-secondary">
                        {t("transactions.create_payment.account_type_number")}
                      </p>
                      <div className="flex items-center gap-2 pl-2 h-10">
                        <Icon symbol="account_balance" className="text-foreground text-2xl" />
                        <p className="text-sm font-semibold text-foreground flex-1">
                          {t("transactions.create_payment.checking_account")}
                        </p>
                        <Button variant="link" className="text-primary h-6 p-0">
                          {t("transactions.create_payment.select_another")}
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              </Card>

              {/* Amount and Source Account Column */}
              <Card className="flex-1 min-w-[250px] bg-muted border-0 p-6 flex flex-col gap-6">
                <div className="flex items-center justify-between h-5">
                  <p className="text-sm text-foreground">
                    {t("transactions.create_payment.amount_source_title")}
                  </p>
                  <Button variant="outline" size="sm" onClick={() => setCurrentStep(2)}>
                    <Icon symbol="edit" className="size-6" />
                    {t("transactions.create_payment.edit")}
                  </Button>
                </div>
                <div className="flex flex-col gap-4">
                  {/* Amount Card */}
                  <Card className="bg-gradient-to-r from-[#e5f3fa] to-white border-0 p-4">
                    <div className="flex items-center h-16">
                      <div className="flex-1 flex flex-col gap-2">
                        <p className="text-xs text-foreground-secondary">
                          {t("transactions.create_payment.amount")}
                        </p>
                        <div className="flex items-center gap-2 pl-2 h-10">
                          <Icon symbol="paid" className="text-foreground text-2xl" />
                          <p className="text-sm font-semibold text-foreground">
                            {new Intl.NumberFormat('es-CO', {
                              style: 'decimal',
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            }).format(parseFloat(amount.replace(',', '.')))}
                          </p>
                        </div>
                      </div>
                    </div>
                  </Card>

                  {/* Source Account Card */}
                  <Card className="bg-background border-0 p-4">
                    <div className="flex items-center h-16">
                      <div className="flex-1 flex flex-col gap-2">
                        <p className="text-xs text-foreground-secondary">
                          {t("transactions.create_payment.source_account")}
                        </p>
                        <div className="flex items-center gap-2 pl-2 h-10">
                          <Icon symbol="account_balance_wallet" className="text-foreground text-2xl" />
                          <p className="text-sm font-semibold text-foreground">
                            {accounts.find(acc => acc.id === selectedAccount)?.name}
                          </p>
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>
              </Card>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-6">
              <Button variant="secondary" onClick={() => navigate("/transactions")}>
                {t("transactions.create_payment.cancel_payment")}
              </Button>
              <Button variant="default" onClick={() => setShow2faDialog(true)}>
                <Icon symbol="check" className="size-6" />
                {t("transactions.create_payment.confirm_payment")}
              </Button>
            </div>
          </div>
      )}
    </Card>

        {/* Warning Alert for Step 3 */}
        {currentStep === 3 && selectedBeneficiary && selectedAccount && amount && (
          <Alert variant="warning" className="bg-warning-50 border-0">
            <Icon symbol="info" />
            <AlertTitle>{t("transactions.create_payment.verify_data")}</AlertTitle>
            <AlertDescription>
              {t("transactions.create_payment.operation_warning")}
            </AlertDescription>
          </Alert>
        )}
        </div>

        {/* 2FA Dialog */}
        <Dialog open={show2faDialog} onOpenChange={setShow2faDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("transactions.otp_dialog.title")}</DialogTitle>
              <DialogDescription>
                {t("transactions.otp_dialog.description")}
              </DialogDescription>
            </DialogHeader>
            <DialogBody>
              <InputOTP
                id="otpCode"
                maxLength={6}
                value={otpCode}
                onChange={setOtpCode}
                pattern={REGEXP_ONLY_DIGITS}
                containerClassName="w-full"
              >
                <InputOTPGroup className="w-full">
                  <InputOTPSlot index={0} className="flex-1" />
                  <InputOTPSlot index={1} className="flex-1" />
                  <InputOTPSlot index={2} className="flex-1" />
                  <InputOTPSlot index={3} className="flex-1" />
                  <InputOTPSlot index={4} className="flex-1" />
                  <InputOTPSlot index={5} className="flex-1" />
                </InputOTPGroup>
              </InputOTP>
            </DialogBody>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="secondary">{t("transactions.otp_dialog.cancel")}</Button>
              </DialogClose>
              <Button 
                variant="default" 
                onClick={handleConfirmPayment}
                disabled={otpCode.length !== 6}
              >
                {t("transactions.otp_dialog.confirm")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </PageContainer>
    </>
  );
};
