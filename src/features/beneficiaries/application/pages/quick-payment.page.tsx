import { useTranslation } from "react-i18next";
import { usePortalContainer } from "@adamosuiteservices/ui/use-portal-container";
import { createPortal } from "react-dom";
import { useNavigate, useParams, useLocation } from "react-router";
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
import {
  SelectableCard,
  SelectableCardGroup,
  SelectableCardTitle,
  SelectableCardDescription,
} from "@adamosuiteservices/ui/selectable-card";
import {
  AmountInputContainer,
  AmountInputFlag,
  AmountInput,
  AmountInputAction,
} from "@adamosuiteservices/ui/amount-input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@adamosuiteservices/ui/input-otp";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { Icon } from "@adamosuiteservices/ui/icon";
import { Badge } from "@adamosuiteservices/ui/badge";
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
import { AddBankAccountDialog } from "../components/add-bank-account-dialog";

/**
 * quick payment page
 * 
 * page for sending a quick payment to a beneficiary
 */
export const QuickPaymentPage = () => {
  const { t } = useTranslation(["transactions", "beneficiaries"]);
  const navigate = useNavigate();
  const { beneficiaryId } = useParams();
  const location = useLocation();
  const sidebarTopBarPortal = usePortalContainer("[data-slot='sidebar-top-bar-portal']");

  // Get beneficiary data from location state or use default
  const beneficiaryData = {
    fullName: location.state?.beneficiary?.fullName || "Juan Carlos Gutierrez Díaz",
    documentType: location.state?.beneficiary?.documentType || "cc",
    documentNumber: location.state?.beneficiary?.documentNumber || "112.393.994",
    firstName: location.state?.beneficiary?.firstName || "Juan Carlos",
    lastName: location.state?.beneficiary?.lastName || "Gutierrez Díaz",
  };

  // Mock bank accounts data - TODO: Replace with actual API data
  const [beneficiaryBankAccounts, setBeneficiaryBankAccounts] = useState([
    {
      id: "1",
      type: "Corriente",
      bank: "Davivienda",
      number: "002-83336-90116",
      isPrimary: true,
    },
    {
      id: "2",
      type: "Ahorros",
      bank: "Bancolombia",
      number: "002-83336-90117",
      isPrimary: false,
    },
    {
      id: "3",
      type: "Nómina",
      bank: "Banco de Bogotá",
      number: "002-83336-90118",
      isPrimary: false,
    },
  ]);

  // Payment states
  const [selectedBankAccountId, setSelectedBankAccountId] = useState<string>(beneficiaryBankAccounts.find(acc => acc.isPrimary)?.id || beneficiaryBankAccounts[0].id);
  const [selectedAccount, setSelectedAccount] = useState<string>("principal");
  const [amount, setAmount] = useState("");

  // Dialog states
  const [showBankAccountDialog, setShowBankAccountDialog] = useState(false);
  const [tempSelectedBankAccountId, setTempSelectedBankAccountId] = useState<string>(selectedBankAccountId);
  const [showAddBankAccountDialog, setShowAddBankAccountDialog] = useState(false);
  const [show2faDialog, setShow2faDialog] = useState(false);
  const [otpCode, setOtpCode] = useState("");

  // TODO: Replace with actual accounts data from API
  const accounts = [
    { id: "principal", name: t("transactions.create_payment.account_principal"), balance: "124.400.321,52 COP" },
    { id: "payroll", name: t("transactions.create_payment.account_payroll"), balance: "45.000.000,00 COP" },
    { id: "savings", name: t("transactions.create_payment.account_savings"), balance: "15.000.000,00 COP" },
  ];

  const handleUseAll = () => {
    if (selectedAccount) {
      const account = accounts.find(acc => acc.id === selectedAccount);
      if (account) {
        // Extract numeric value from balance
        const numericBalance = account.balance.replace(/[^0-9,]/g, '').replace(/\./g, '').replace(',', '.');
        setAmount(numericBalance);
      }
    }
  };

  const selectedBankAccount = beneficiaryBankAccounts.find(acc => acc.id === selectedBankAccountId);

  const isFormValid = selectedAccount && amount && parseFloat(amount.replace(',', '.')) > 0;

  const handleOpenBankAccountDialog = () => {
    setTempSelectedBankAccountId(selectedBankAccountId);
    setShowBankAccountDialog(true);
  };

  const handleConfirmBankAccountChange = () => {
    setSelectedBankAccountId(tempSelectedBankAccountId);
    setShowBankAccountDialog(false);
  };

  const handleAddNewBankAccount = () => {
    setShowBankAccountDialog(false);
    setShowAddBankAccountDialog(true);
  };

  const handleConfirmAddBankAccount = (data: {
    accountType: string;
    bank: string;
    accountNumber: string;
    isPrimary: boolean;
  }) => {
    // If new account is primary, set all others to non-primary
    const updatedAccounts = data.isPrimary
      ? beneficiaryBankAccounts.map(acc => ({ ...acc, isPrimary: false }))
      : beneficiaryBankAccounts;

    // Create new account with unique ID
    const newAccount = {
      id: String(Date.now()),
      type: data.accountType === "ahorros" ? "Ahorros" : "Corriente",
      bank: data.bank.charAt(0).toUpperCase() + data.bank.slice(1),
      number: data.accountNumber,
      isPrimary: data.isPrimary,
    };

    // Add new account
    setBeneficiaryBankAccounts([...updatedAccounts, newAccount]);

    // If primary, select it
    if (data.isPrimary) {
      setSelectedBankAccountId(newAccount.id);
      setTempSelectedBankAccountId(newAccount.id);
    }

    // Show success toast
    ToastManager.show({
      message: t("beneficiaries:beneficiaries.bank_accounts.add_success"),
      variant: "success",
    });

    // Close add dialog and reopen selection dialog
    setShowAddBankAccountDialog(false);
    setShowBankAccountDialog(true);
  };

  const handleConfirmPayment = () => {
    // Close dialog
    setShow2faDialog(false);
    
    // Show success toast
    ToastManager.show({
      message: t("transactions.messages.payment_created"),
      variant: "success",
    });
    
    // Navigate back to beneficiary detail
    navigate(`/beneficiaries/${beneficiaryId}`);
  };

  return (
    <>
      {sidebarTopBarPortal && createPortal(
        <Breadcrumb>
          <BreadcrumbList className="flex-nowrap">
            <BreadcrumbItem className="hidden md:block">
              <BreadcrumbLink asChild>
                <button onClick={() => navigate("/beneficiaries")}>{t("beneficiaries:beneficiaries.page_title")}</button>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbItem className="md:hidden">
              <button onClick={() => navigate("/beneficiaries")} className="flex h-9 w-9 items-center justify-center">
                <BreadcrumbEllipsis />
              </button>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem className="hidden md:block">
              <BreadcrumbLink asChild>
                <button onClick={() => navigate(`/beneficiaries/${beneficiaryId}`)}>{t("beneficiaries:beneficiaries.detail.page_title")}</button>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbItem className="md:hidden">
              <button onClick={() => navigate(`/beneficiaries/${beneficiaryId}`)} className="flex h-9 w-9 items-center justify-center">
                <BreadcrumbEllipsis />
              </button>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem className="min-w-0">
              <BreadcrumbPage className="truncate">{t("transactions.quick_payment.breadcrumb_title")}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>,
        sidebarTopBarPortal,
      )}
      <PageContainer className="bg-subtle">
        <Card className="p-6 border-border flex flex-col gap-6">
          {/* Beneficiary Information Card */}
          <Card className="flex flex-col gap-6 border-0 bg-muted p-6">
            <p className="text-sm text-foreground">
              {t("transactions.quick_payment.beneficiary_info_title")}
            </p>

            <Card className="flex flex-col gap-6 border-0 bg-white p-4">
              {/* Full Name Field */}
              <div className="flex h-16 items-center">
                <div className="flex flex-1 flex-col items-start justify-center gap-0">
                  <div className="flex w-full flex-col items-start gap-2">
                    <p className="text-xs text-muted-foreground">
                      {t("transactions.quick_payment.full_name_label")}
                    </p>
                    <div className="flex h-10 w-full items-center justify-center gap-2 pl-2">
                      <div className="flex h-8 min-w-[230px] flex-1 items-center gap-2">
                        <Icon symbol="account_circle" className="text-2xl text-foreground" />
                        <p className="text-sm font-semibold text-foreground">
                          {beneficiaryData.fullName}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Account Type and Number Field */}
              <div className="flex min-h-16 items-center">
                <div className="flex flex-1 flex-col items-start justify-center gap-0">
                  <div className="flex w-full flex-col items-start gap-2">
                    <p className="text-xs text-muted-foreground">
                      {t("transactions.quick_payment.account_type_label")}
                    </p>
                    <div className="flex w-full flex-wrap items-center gap-2 pl-2">
                      <div className="flex h-8 min-w-[230px] flex-1 items-center gap-2">
                        <Icon symbol="account_balance" className="text-2xl text-foreground" />
                        <p className="text-sm font-semibold text-foreground flex-1">
                          {selectedBankAccount?.type}. {selectedBankAccount?.bank} Nº {selectedBankAccount?.number}
                        </p>
                        <Button variant="link" size="sm" className="h-6 p-0" onClick={handleOpenBankAccountDialog}>
                          {t("transactions.quick_payment.select_another_account")}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </Card>

          {/* Source Account Section */}
          <Card className="p-4 bg-muted border-0 flex flex-col gap-4">
            <p className="text-xs text-foreground">
              {t("transactions.quick_payment.source_account_label")}
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
              {t("transactions.quick_payment.amount_label")}
            </p>
            <div className="flex flex-col gap-2">
              <AmountInputContainer className="gap-2">
                <AmountInputFlag locale="es-CO" currencySymbol="" />
                <AmountInput
                  id="amount"
                  value={amount ? parseFloat(amount.replace(',', '.')) : undefined}
                  onValueChange={(value) => setAmount(value !== undefined ? String(value) : "")}
                  onInput={(e) => {
                    const rawValue = (e.target as HTMLInputElement).value.replace(/[^0-9,]/g, '').replace(',', '.');
                    setAmount(rawValue);
                  }}
                  placeholder={t("transactions.quick_payment.amount_placeholder")}
                  locale="es-CO"
                  minimumFractionDigits={2}
                  maximumFractionDigits={2}
                />
                <AmountInputAction onClick={handleUseAll}>
                  {t("transactions.quick_payment.use_all")}
                </AmountInputAction>
              </AmountInputContainer>
              {selectedAccount && (
                <p className="text-xs text-foreground">
                  {t("transactions.quick_payment.available")}: {accounts.find(acc => acc.id === selectedAccount)?.balance}
                </p>
              )}
            </div>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-6">
            <Button variant="secondary" onClick={() => navigate(`/beneficiaries/${beneficiaryId}`)}>
              {t("transactions.quick_payment.cancel")}
            </Button>
            <Button 
              variant="default" 
              disabled={!isFormValid}
              onClick={() => setShow2faDialog(true)}
            >
              <Icon symbol="check" className="size-6" />
              {t("transactions.quick_payment.confirm")}
            </Button>
          </div>
        </Card>

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
              {beneficiaryBankAccounts.length > 0 ? (
                <SelectableCardGroup value={tempSelectedBankAccountId} onValueChange={setTempSelectedBankAccountId} className="w-full">
                  <div className="flex flex-col gap-2 w-full">
                    {beneficiaryBankAccounts.map((account) => (
                      <SelectableCard
                        key={account.id}
                        value={account.id}
                      >
                        <div className="flex items-center h-16">
                          <div className="flex-1 flex flex-col gap-2">
                            <SelectableCardTitle>
                              {account.type}
                            </SelectableCardTitle>
                            <div className="flex items-center justify-between gap-2 pl-2 h-10">
                              <div className="flex items-center gap-2">
                                <Icon symbol="account_balance" className="text-2xl" />
                                <SelectableCardDescription>
                                  {account.bank} Nº {account.number}
                                </SelectableCardDescription>
                              </div>
                              {account.isPrimary && (
                                <Badge variant="waiting-medium" className="h-8 px-2 text-sm leading-5 bg-muted">
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
              ) : (
                <div className="py-8 text-center">
                  <p className="text-sm text-muted-foreground mb-4">
                    {t("transactions.quick_payment.no_other_accounts")}
                  </p>
                </div>
              )}

              <div className="mt-5">
                <Button variant="link" onClick={handleAddNewBankAccount} className="h-6 p-0">
                  <Icon symbol="add" />
                  {t("transactions.quick_payment.add_bank_account")}
                </Button>
              </div>
            </DialogBody>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="secondary">{t("transactions.select_account_dialog.cancel")}</Button>
              </DialogClose>
              <Button 
                variant="default" 
                onClick={handleConfirmBankAccountChange}
                disabled={beneficiaryBankAccounts.length === 0}
              >
                {t("transactions.select_account_dialog.confirm")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Add Bank Account Dialog */}
        <AddBankAccountDialog
          open={showAddBankAccountDialog}
          onOpenChange={setShowAddBankAccountDialog}
          beneficiaryData={{
            documentType: beneficiaryData.documentType,
            documentNumber: beneficiaryData.documentNumber,
            firstName: beneficiaryData.firstName,
            lastName: beneficiaryData.lastName,
          }}
          onConfirm={handleConfirmAddBankAccount}
        />

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
