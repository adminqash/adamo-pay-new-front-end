import { Alert, AlertTitle, AlertDescription } from "@adamosuiteservices/ui/alert";
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
import { Card } from "@adamosuiteservices/ui/card";
import { Checkbox } from "@adamosuiteservices/ui/checkbox";
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
import { Badge } from "@adamosuiteservices/ui/badge";
import { Icon } from "@adamosuiteservices/ui/icon";
import { Input } from "@adamosuiteservices/ui/input";
import { usePortalContainer } from "@adamosuiteservices/ui/use-portal-container";
import { useTranslation } from "react-i18next";
import { createPortal } from "react-dom";
import { Link, useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { BeneficiariesService } from "@/features/beneficiaries/api/services/beneficiaries.service";
import { useBankAccounts } from "@/features/beneficiaries/application/hooks/use-beneficiaries";
import {
  mapAccountTypeToFormValue,
  mapFormAccountTypeToApi,
} from "@/features/beneficiaries/application/utils/beneficiary-form.utils";
import { PageContainer } from "@/features/common/components/layout/page-container";
import { useAccounts } from "@/features/accounts/application/hooks/use-accounts";
import { useCountry } from "@/features/common/contexts/use-country";
import {
  formatCurrencyDisplay,
  minorToMajor,
  parseCurrencyToMinor,
} from "@/lib/money/money";
import {
  canonicalizeDocumentType,
  DOCUMENT_TYPE_CODES,
  DOCUMENT_TYPE_LABELS,
} from "@/lib/document-type";
import { useCreatePayment } from "@/features/transactions/application/hooks/use-payment-mutations";
import { useAutoSelectDebitAccount } from "@/features/auth/application/hooks/use-auto-select-debit-account";
import { DebitAccountPicker } from "@/features/accounts/application/components/debit-account-picker";
import { usePermissions } from "@/features/auth/application/hooks/use-permissions";
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
  SelectableCardTitle,
  SelectableCardDescription,
} from "@adamosuiteservices/ui/selectable-card";
import {
  Timeline,
  TimelineItem,
  TimelineIndicator,
  TimelineContent,
  TimelineTitle,
} from "@adamosuiteservices/ui/timeline";

/**
 * selected beneficiary for payment flow
 */
type SelectedBeneficiary = {
  id?: string
  name: string
  docType: string
  docNumber: string
  accountType: string
  bank: string
  accountNumber: string
  bankAccountId?: string
};

function formatAccountLabel(accountType: string, bank: string, accountNumber: string) {
  const typeLabel = accountType.charAt(0).toUpperCase() + accountType.slice(1);
  const bankLabel = bank.charAt(0).toUpperCase() + bank.slice(1);
  return `${typeLabel}. ${bankLabel} Nº ${accountNumber}`;
}

/**
 * create payment page
 *
 * page for creating a new payment
 */
export const CreatePaymentPage = () => {
  const { t } = useTranslation(["transactions", "beneficiaries"]);
  const { countryCode, currency, currencyUpper, locale } = useCountry();
  const navigate = useNavigate();
  const sidebarTopBarPortal = usePortalContainer("[data-slot='sidebar-top-bar-portal']");

  // Step state
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedBeneficiary, setSelectedBeneficiary] = useState<SelectedBeneficiary | null>(null);
  const createPayment = useCreatePayment();
  const { accounts, isLoading: isAccountsLoading } = useAccounts({ limit: 20 });
  const { capabilities } = usePermissions();
  const { bankAccounts } = useBankAccounts(selectedBeneficiary?.id ?? "");

  const [searchQuery, setSearchQuery] = useState("");

  const beneficiariesQuery = useQuery({
    queryKey: ["beneficiaries", "recent", searchQuery],
    queryFn: () => BeneficiariesService.list({
      limit: 5,
      search: searchQuery.trim() || undefined,
    }),
  });

  const beneficiaries = beneficiariesQuery.data?.data ?? [];

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
  useEffect(() => {
    if (!capabilities.canCreateBeneficiary) {
      setSaveBeneficiary(false);
    }
  }, [capabilities.canCreateBeneficiary]);

  // Step 2 states
  const [selectedAccount, setSelectedAccount] = useState<string>();
  const [amount, setAmount] = useState("");
  useAutoSelectDebitAccount(accounts, selectedAccount, setSelectedAccount);

  // Beneficiary bank account selection
  const [selectedBankAccountId, setSelectedBankAccountId] = useState<string>();
  const [showBankAccountDialog, setShowBankAccountDialog] = useState(false);
  const [tempSelectedBankAccountId, setTempSelectedBankAccountId] = useState<string>();

  // 2FA Dialog state
  const [show2faDialog, setShow2faDialog] = useState(false);
  const [otpCode, setOtpCode] = useState("");

  useEffect(() => {
    if (!selectedBeneficiary?.id || bankAccounts.length === 0) {
      return;
    }

    const currentIsValid = selectedBankAccountId
      && bankAccounts.some((account) => account.id === selectedBankAccountId);

    if (currentIsValid) {
      return;
    }

    const primaryAccount = bankAccounts.find((account) => account.isPrimary) ?? bankAccounts[0];
    setSelectedBankAccountId(primaryAccount.id);
    setSelectedBeneficiary((previous) => {
      if (!previous || previous.id !== selectedBeneficiary.id) {
        return previous;
      }

      return {
        ...previous,
        accountType: primaryAccount.accountType,
        bank: primaryAccount.bank,
        accountNumber: primaryAccount.accountNumber,
        bankAccountId: primaryAccount.id,
      };
    });
  }, [bankAccounts, selectedBeneficiary?.id, selectedBankAccountId]);

  const selectedBankAccount = bankAccounts.find((account) => account.id === selectedBankAccountId);
  const canSelectAnotherAccount = Boolean(selectedBeneficiary?.id) && bankAccounts.length > 1;
  const beneficiaryAccountLabel = selectedBeneficiary
    ? formatAccountLabel(
      selectedBankAccount?.accountType ?? selectedBeneficiary.accountType,
      selectedBankAccount?.bank ?? selectedBeneficiary.bank,
      selectedBankAccount?.accountNumber ?? selectedBeneficiary.accountNumber,
    )
    : "";

  const handleBeneficiarySelect = async(beneficiary: typeof beneficiaries[number]) => {
    const detailResult = await BeneficiariesService.getById(beneficiary.id);
    const detail = detailResult.data;

    setSelectedBankAccountId(undefined);
    setSelectedBeneficiary({
      id: beneficiary.id,
      name: detail?.fullName ?? beneficiary.name,
      docType: canonicalizeDocumentType(detail?.identificationDocument.type) ?? "CC",
      docNumber: detail?.identificationDocument.number ?? beneficiary.idNumber,
      accountType: detail?.bankAccount.type ?? "corriente",
      bank: detail?.bankAccount.bank ?? "",
      accountNumber: detail?.bankAccount.number ?? "",
    });
    setCurrentStep(2);
  };

  const handleContinueStep1 = () => {
    const manualBeneficiary: SelectedBeneficiary = {
      name: `${firstName} ${lastName}`.trim(),
      docType: documentType,
      docNumber: documentNumber,
      accountType,
      bank,
      accountNumber,
    };
    setSelectedBankAccountId(undefined);
    setSelectedBeneficiary(manualBeneficiary);
    setCurrentStep(2);
  };

  const handleEditBeneficiary = () => {
    setCurrentStep(1);
  };

  const handleOpenBankAccountDialog = () => {
    setTempSelectedBankAccountId(selectedBankAccountId);
    setShowBankAccountDialog(true);
  };

  const handleConfirmBankAccountChange = () => {
    const account = bankAccounts.find((item) => item.id === tempSelectedBankAccountId);
    if (!account || !selectedBeneficiary) {
      return;
    }

    setSelectedBankAccountId(account.id);
    setSelectedBeneficiary({
      ...selectedBeneficiary,
      accountType: account.accountType,
      bank: account.bank,
      accountNumber: account.accountNumber,
      bankAccountId: account.id,
    });
    setShowBankAccountDialog(false);
  };

  const handleUseAll = () => {
    if (selectedAccount) {
      const account = accounts.find((acc) => acc.id === selectedAccount);
      if (account) {
        // AmountInput works in major units; API receives minor via parseCurrencyToMinor
        setAmount(minorToMajor(account.availableMinor));
      }
    }
  };

  const isStep1Valid = showManualForm
    ? documentType && documentNumber && firstName && lastName && accountType && bank && accountNumber
    : false;

  const amountMinor = (() => {
    try {
      return amount ? parseCurrencyToMinor(amount) : 0;
    } catch {
      return 0;
    }
  })();

  const isStep2Valid = Boolean(selectedAccount && amountMinor > 0);

  const handleConfirmPayment = async() => {
    if (!selectedBeneficiary || !selectedAccount) {
      return;
    }

    try {
      const parsedAmount = parseCurrencyToMinor(amount);

      await createPayment.mutateAsync({
        beneficiaryId: selectedBeneficiary.id,
        beneficiarySnapshot: {
          fullName: selectedBeneficiary.name,
          idType: selectedBeneficiary.docType,
          idNumber: selectedBeneficiary.docNumber.replace(/\./g, ""),
        },
        sourceAccountId: selectedAccount,
        destinationBankAccountId: selectedBankAccountId ?? selectedBeneficiary.bankAccountId,
        destinationSnapshot: {
          accountType: mapFormAccountTypeToApi(
            mapAccountTypeToFormValue(selectedBeneficiary.accountType),
          ),
          bank: selectedBeneficiary.bank,
          accountNumber: selectedBeneficiary.accountNumber,
        },
        amount: parsedAmount,
        currency,
        countryCode,
        metadata: {
          saveBeneficiary: Boolean(saveBeneficiary && !selectedBeneficiary.id),
          channel: "web",
        },
        totp: otpCode,
      });

      setShow2faDialog(false);
      navigate("/transactions");
    } catch {
      setShow2faDialog(false);
    }
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
                <Link to="/transactions">{t("transactions.page_title")}</Link>
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
              <BreadcrumbPage className="truncate">{t("transactions.create_payment.breadcrumb_title")}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>,
        sidebarTopBarPortal,
      )}
      <PageContainer className="bg-subtle">
        {/* Timeline Stepper */}
        <Timeline orientation="horizontal" className="mb-6 w-fit">
          <TimelineItem status={currentStep > 1 ? "complete" : "active"}>
            <TimelineIndicator />
            <TimelineContent>
              <TimelineTitle>{t("transactions.create_payment.step_1")}</TimelineTitle>
            </TimelineContent>
          </TimelineItem>
          <TimelineItem status={currentStep > 2 ? "complete" : currentStep === 2 ? "active" : "pending"}>
            <TimelineIndicator />
            <TimelineContent>
              <TimelineTitle>{t("transactions.create_payment.step_2")}</TimelineTitle>
            </TimelineContent>
          </TimelineItem>
          <TimelineItem status={currentStep === 3 ? "active" : "pending"}>
            <TimelineIndicator />
            <TimelineContent>
              <TimelineTitle>{t("transactions.create_payment.step_3")}</TimelineTitle>
            </TimelineContent>
          </TimelineItem>
        </Timeline>
        {/* Main Card */}
        <div className="flex flex-col gap-6">
          <Card className="flex flex-col gap-12 border-border p-6">
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
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </InputGroup>
                  {/* Recent Beneficiaries */}
                  <Card className="flex flex-col gap-6 border-0 bg-muted p-6">
                    <p className="text-sm text-foreground">
                      {t("transactions.create_payment.recent_beneficiaries")}
                    </p>
                    <div className="flex flex-wrap gap-4">
                      {beneficiaries.map((beneficiary) => (
                        <Card
                          key={beneficiary.id}
                          className={`
                            min-w-[250px] flex-1 cursor-pointer border-0
                            bg-background p-4 transition-colors
                            hover:bg-muted
                          `}
                          onClick={() => handleBeneficiarySelect(beneficiary)}
                        >
                          <div className="flex h-16 flex-col gap-2">
                            <p className="text-xs text-foreground-secondary">
                              {beneficiary.idNumber}
                            </p>
                            <div className="flex h-10 items-center gap-2 pl-2">
                              <Icon
                                symbol="account_circle"
                                weight={200}
                                className="text-2xl text-foreground"
                              />
                              <p className={`
                                text-sm font-semibold text-foreground
                              `}
                              >{beneficiary.name}
                              </p>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </Card>
                  {/* Toggle Manual Entry */}
                  <Button
                    variant="link"
                    className="h-6 w-fit px-0"
                    onClick={() => setShowManualForm(!showManualForm)}
                  >
                    {t("transactions.create_payment.toggle_manual")}
                    <Icon
                      symbol={showManualForm ? "expand_less" : "expand_more"}
                      className="size-6"
                    />
                  </Button>
                  {/* Manual Entry Form */}
                  {showManualForm && (
                    <Card className="border-0 bg-muted p-4">
                      <div className={`
                        grid grid-cols-1 gap-4
                        md:grid-cols-2
                      `}
                      >
                        {/* Document Type */}
                        <div className="flex flex-col gap-2">
                          <Label
                            htmlFor="documentType"
                            className="text-xs text-foreground"
                          >
                            {t("transactions.create_payment.document_type")}
                          </Label>
                          <Select value={documentType} onValueChange={setDocumentType}>
                            <SelectTrigger className="h-10 w-full bg-background">
                              <SelectValue placeholder={t("transactions.create_payment.select_placeholder")} />
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
                        {/* Document Number */}
                        <div className="flex flex-col gap-2">
                          <Label
                            htmlFor="documentNumber"
                            className="text-xs text-foreground"
                          >
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
                          <Label
                            htmlFor="firstName"
                            className="text-xs text-foreground"
                          >
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
                          <Label
                            htmlFor="lastName"
                            className="text-xs text-foreground"
                          >
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
                          <Label
                            htmlFor="accountType"
                            className="text-xs text-foreground"
                          >
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
                          <Label
                            htmlFor="bank"
                            className="text-xs text-foreground"
                          >
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
                          <Label
                            htmlFor="accountNumber"
                            className="text-xs text-foreground"
                          >
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
                        {capabilities.canCreateBeneficiary && (
                        <div className="col-span-full flex items-center gap-3">
                          <Checkbox
                            id="saveBeneficiary"
                            checked={saveBeneficiary}
                            onCheckedChange={(checked) => setSaveBeneficiary(checked as boolean)}
                          />
                          <Label
                            htmlFor="saveBeneficiary"
                            className="cursor-pointer text-sm text-foreground"
                          >
                            {t("transactions.create_payment.save_beneficiary")}
                          </Label>
                        </div>
                        )}
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
                  <Card className="border-0 bg-muted p-4">
                    <div className="flex h-16 items-center">
                      <div className="flex flex-1 flex-col gap-2">
                        <p className="text-xs text-foreground-secondary">
                          {t("transactions.create_payment.beneficiary_label")}
                        </p>
                        <div className="flex h-10 items-center gap-2 pl-2">
                          <Icon
                            symbol="account_circle"
                            className="text-2xl text-foreground"
                          />
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
                  <Card className="flex flex-col gap-4 border-0 bg-muted p-4">
                    <p className="text-xs text-foreground">
                      {t("transactions.create_payment.source_account_label")}
                    </p>
                    <DebitAccountPicker
                      accounts={accounts}
                      value={selectedAccount}
                      onValueChange={setSelectedAccount}
                      isLoading={isAccountsLoading}
                    />
                  </Card>
                  {/* Amount Section */}
                  <Card className="flex flex-col gap-4 border-0 bg-muted p-4">
                    <p className="text-xs text-foreground">
                      {t("transactions.create_payment.amount_label")}
                    </p>
                    <div className="flex flex-col gap-2">
                      <AmountInputContainer className="gap-2">
                        <AmountInputFlag locale={locale} currencySymbol="" />
                        <AmountInput
                          value={amountMinor > 0 ? Number(minorToMajor(amountMinor)) : undefined}
                          onValueChange={(value) => {
                            if (value === undefined) {
                              setAmount("");
                              return;
                            }
                            // AmountInput gives major units; persist as major string for majorToMinor
                            setAmount(value.toFixed(2));
                          }}
                          onInput={(e) => {
                            const rawValue = (e.target as HTMLInputElement).value
                              .replace(/[^0-9,.]/g, "");
                            setAmount(rawValue);
                          }}
                          placeholder={t("transactions.create_payment.amount_placeholder")}
                          locale={locale}
                          minimumFractionDigits={2}
                          maximumFractionDigits={2}
                        />
                        {capabilities.canViewBalance && (
                          <AmountInputAction onClick={handleUseAll}>
                            {t("transactions.create_payment.use_all")}
                          </AmountInputAction>
                        )}
                      </AmountInputContainer>
                      {selectedAccount && capabilities.canViewBalance && (
                        <p className="text-xs text-foreground">
                          {t("transactions.create_payment.available")}: {accounts.find((acc) => acc.id === selectedAccount)?.balance}
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
                <div className="flex w-full gap-4">
                  {/* Beneficiary Column */}
                  <Card className={`
                    flex min-w-[250px] flex-1 flex-col gap-6 border-0 bg-muted
                    p-6
                  `}
                  >
                    <div className="flex h-5 items-center justify-between">
                      <p className="text-sm text-foreground">
                        {t("transactions.create_payment.beneficiary_title")}
                      </p>
                      <Button variant="outline" size="sm" onClick={handleEditBeneficiary}>
                        <Icon symbol="edit" className="size-6" />
                        {t("transactions.create_payment.edit")}
                      </Button>
                    </div>
                    <Card className={`
                      flex flex-col gap-6 border-0 bg-background p-4
                    `}
                    >
                      {/* Full Name */}
                      <div className="flex h-16 items-center">
                        <div className="flex flex-1 flex-col gap-2">
                          <p className="text-xs text-foreground-secondary">
                            {t("transactions.create_payment.full_name")}
                          </p>
                          <div className="flex h-10 items-center gap-2 pl-2">
                            <Icon
                              symbol="account_circle"
                              className="text-2xl text-foreground"
                            />
                            <p className="text-sm font-semibold text-foreground">{selectedBeneficiary.name}</p>
                          </div>
                        </div>
                      </div>
                      {/* ID Type and Number */}
                      <div className="flex h-16 items-center">
                        <div className="flex flex-1 flex-col gap-2">
                          <p className="text-xs text-foreground-secondary">
                            {t("transactions.create_payment.id_type_number")}
                          </p>
                          <div className="flex h-10 items-center gap-2 pl-2">
                            <Icon
                              symbol="contacts"
                              className="text-2xl text-foreground"
                            />
                            <p className="text-sm font-semibold text-foreground">
                              {selectedBeneficiary.docType}: {selectedBeneficiary.docNumber}
                            </p>
                          </div>
                        </div>
                      </div>
                      {/* Account Type and Number */}
                      <div className="flex h-16 items-center">
                        <div className="flex flex-1 flex-col gap-2">
                          <p className="text-xs text-foreground-secondary">
                            {t("transactions.create_payment.account_type_number")}
                          </p>
                          <div className="flex h-10 items-center gap-2 pl-2">
                            <Icon
                              symbol="account_balance"
                              className="text-2xl text-foreground"
                            />
                            <p className={`
                              flex-1 text-sm font-semibold text-foreground
                            `}
                            >
                              {beneficiaryAccountLabel}
                            </p>
                            {canSelectAnotherAccount && (
                              <Button
                                variant="link"
                                className="h-6 p-0 text-primary"
                                onClick={handleOpenBankAccountDialog}
                              >
                                {t("transactions.create_payment.select_another")}
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </Card>
                  </Card>
                  {/* Amount and Source Account Column */}
                  <Card className={`
                    flex min-w-[250px] flex-1 flex-col gap-6 border-0 bg-muted
                    p-6
                  `}
                  >
                    <div className="flex h-5 items-center justify-between">
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
                      <Card className={`
                        border-0 bg-gradient-to-r from-[#e5f3fa] to-white p-4
                      `}
                      >
                        <div className="flex h-16 items-center">
                          <div className="flex flex-1 flex-col gap-2">
                            <p className="text-xs text-foreground-secondary">
                              {t("transactions.create_payment.amount")}
                            </p>
                            <div className="flex h-10 items-center gap-2 pl-2">
                              <Icon
                                symbol="paid"
                                className="text-2xl text-foreground"
                              />
                              <p className={`
                                text-sm font-semibold text-foreground
                              `}
                              >
                                {formatCurrencyDisplay(amountMinor, currencyUpper)}
                              </p>
                            </div>
                          </div>
                        </div>
                      </Card>
                      {/* Source Account Card */}
                      <Card className="border-0 bg-background p-4">
                        <div className="flex h-16 items-center">
                          <div className="flex flex-1 flex-col gap-2">
                            <p className="text-xs text-foreground-secondary">
                              {t("transactions.create_payment.source_account")}
                            </p>
                            <div className="flex h-10 items-center gap-2 pl-2">
                              <Icon
                                symbol="account_balance_wallet"
                                className="text-2xl text-foreground"
                              />
                              <p className={`
                                text-sm font-semibold text-foreground
                              `}
                              >
                                {accounts.find((acc) => acc.id === selectedAccount)?.name}
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
            <Alert variant="warning" className="border-0 bg-warning-50">
              <Icon symbol="info" />
              <AlertTitle>{t("transactions.create_payment.verify_data")}</AlertTitle>
              <AlertDescription>
                {t("transactions.create_payment.operation_warning")}
              </AlertDescription>
            </Alert>
          )}
        </div>
        {/* Select Bank Account Dialog */}
        <Dialog open={showBankAccountDialog} onOpenChange={setShowBankAccountDialog}>
          <DialogContent className="sm:max-w-[640px]">
            <DialogHeader>
              <DialogTitle>{t("transactions.select_account_dialog.title")}</DialogTitle>
              <DialogDescription>
                {t("transactions.select_account_dialog.description")}
              </DialogDescription>
            </DialogHeader>
            <DialogBody>
              <SelectableCardGroup
                value={tempSelectedBankAccountId}
                onValueChange={setTempSelectedBankAccountId}
                className="w-full"
              >
                <div className="flex w-full flex-col gap-2">
                  {bankAccounts.map((account) => (
                    <SelectableCard key={account.id} value={account.id}>
                      <div className="flex h-16 items-center">
                        <div className="flex flex-1 flex-col gap-2">
                          <SelectableCardTitle>
                            {account.accountType}
                          </SelectableCardTitle>
                          <div className={`
                            flex h-10 items-center justify-between gap-2 pl-2
                          `}
                          >
                            <div className="flex items-center gap-2">
                              <Icon
                                symbol="account_balance"
                                className="text-2xl"
                              />
                              <SelectableCardDescription>
                                {account.bank} Nº {account.accountNumber}
                              </SelectableCardDescription>
                            </div>
                            {account.isPrimary && (
                              <Badge
                                variant="waiting-medium"
                                className="h-8 bg-muted px-2 text-sm leading-5"
                              >
                                {t("beneficiaries:beneficiaries.bank_accounts.primary_label")}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </SelectableCard>
                  ))}
                </div>
              </SelectableCardGroup>
            </DialogBody>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="secondary">
                  {t("transactions.select_account_dialog.cancel")}
                </Button>
              </DialogClose>
              <Button
                variant="default"
                onClick={handleConfirmBankAccountChange}
                disabled={!tempSelectedBankAccountId}
              >
                {t("transactions.select_account_dialog.confirm")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
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
