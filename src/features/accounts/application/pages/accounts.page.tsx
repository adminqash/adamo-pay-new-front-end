import { usePortalContainer } from "@adamosuiteservices/ui/use-portal-container";
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
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@adamosuiteservices/ui/dropdown-menu";
import { Icon } from "@adamosuiteservices/ui/icon";
import { Input } from "@adamosuiteservices/ui/input";
import { Label } from "@adamosuiteservices/ui/label";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@adamosuiteservices/ui/input-otp";
import { Combobox } from "@adamosuiteservices/ui/combobox";
import { 
  AmountInputContainer,
  AmountInputFlag,
  AmountInput,
  AmountInputAction,
} from "@adamosuiteservices/ui/amount-input";
import { ToastManager } from "@adamosuiteservices/ui/toaster";
import { createPortal } from "react-dom";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import { PageContainer } from "@/features/common/components/layout/page-container";
import { PageTitle } from "@/features/common/components/layout/page-title";
import { CountryFlag } from "@/features/common/components/flags/country-flag";

export function AccountsPage() {
  const { t } = useTranslation("accounts");
  const [newAccountName, setNewAccountName] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // edit name dialog state
  const [isEditNameDialogOpen, setIsEditNameDialogOpen] = useState(false);
  const [editingAccountId, setEditingAccountId] = useState<string | null>(null);
  const [editedAccountName, setEditedAccountName] = useState("");
  const [isOtpDialogOpen, setIsOtpDialogOpen] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [otpAction, setOtpAction] = useState<"edit" | "delete">("edit");

  // delete account dialog state
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingAccountId, setDeletingAccountId] = useState<string | null>(null);

  // transfer dialog state
  const [isTransferDialogOpen, setIsTransferDialogOpen] = useState(false);
  const [transferFromAccountId, setTransferFromAccountId] = useState<string | null>(null);
  const [transferAmount, setTransferAmount] = useState("");
  const [transferToAccountId, setTransferToAccountId] = useState<string | null>(null);

  const sidebarTopBarPortal = usePortalContainer("[data-slot='sidebar-top-bar-portal']");

  // datos de ejemplo - reemplazar con hook real
  const [accounts, setAccounts] = useState([
    {
      id: "1",
      name: "Cuenta principal",
      balance: "$90.784.510,46",
      currency: "COP",
      countryCode: "CO",
    },
    {
      id: "2",
      name: "Cuenta de nómina",
      balance: "$61.002.031,71",
      currency: "COP",
      countryCode: "CO",
    },
    {
      id: "3",
      name: "Cuenta de ahorros",
      balance: "$39.002.031,71",
      currency: "COP",
      countryCode: "CO",
    },
  ]);

  const totalBalance = "$190.034.500,59";

  /**
   * handle open edit name dialog
   */
  const handleOpenEditNameDialog = (accountId: string, currentName: string) => {
    setEditingAccountId(accountId);
    setEditedAccountName(currentName);
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
  const handleOpenDeleteDialog = (accountId: string) => {
    setDeletingAccountId(accountId);
    setIsDeleteDialogOpen(true);
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
    console.log("OTP submitted:", otpCode);
    
    if (otpAction === "edit") {
      console.log("New account name:", editedAccountName);
      console.log("Account ID:", editingAccountId);

      // Update account name in state
      setAccounts(accounts.map(account => 
        account.id === editingAccountId 
          ? { ...account, name: editedAccountName }
          : account
      ));

      setEditingAccountId(null);

      ToastManager.show({
        message: t("accounts.messages.name_updated"),
        variant: "success",
      });
    } else if (otpAction === "delete") {
      console.log("Deleting account:", deletingAccountId);

      // Remove account from state
      setAccounts(accounts.filter(account => account.id !== deletingAccountId));

      setDeletingAccountId(null);

      ToastManager.show({
        message: t("accounts.messages.account_deleted"),
        variant: "success",
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

  /**
   * handle open transfer dialog
   */
  const handleOpenTransferDialog = (accountId: string) => {
    setTransferFromAccountId(accountId);
    setIsTransferDialogOpen(true);
  };

  /**
   * handle transfer confirm
   */
  const handleTransferConfirm = () => {
    console.log("Transfer from:", transferFromAccountId);
    console.log("Transfer to:", transferToAccountId);
    console.log("Amount:", transferAmount);

    setIsTransferDialogOpen(false);
    
    ToastManager.show({
      message: t("accounts.messages.transfer_success"),
      variant: "success",
    });

    // reset transfer form
    setTransferFromAccountId(null);
    setTransferToAccountId(null);
    setTransferAmount("");
  };

  /**
   * handle create account
   */
  const handleCreateAccount = () => {
    const newAccount = {
      id: String(accounts.length + 1),
      name: newAccountName,
      balance: "$0,00",
      currency: "COP",
      countryCode: "CO",
    };

    setAccounts([...accounts, newAccount]);
    
    ToastManager.show({
      message: t("accounts.messages.account_created"),
      variant: "success",
    });

    setIsDialogOpen(false);
    setNewAccountName("");
  };

  return (
    <>
      {sidebarTopBarPortal && createPortal(
        <PageTitle>{t("accounts.page_title")}</PageTitle>,
        sidebarTopBarPortal,
      )}
      <PageContainer>
        <Card className="p-6 flex flex-col gap-6">
          {/* wallet card with gradient */}
          <Card className="bg-gradient-to-r from-[#e5f3fa] to-background border-0 p-6">
            <div className="flex flex-col gap-4">
              <div className="text-sm text-foreground font-bold leading-5">
                {t("accounts.total_balance")}
              </div>
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="inline-flex items-center gap-3 bg-white rounded-full px-4 py-4 h-14">
                  <CountryFlag countryCode="CO" />
                  <span className="text-sm font-bold text-foreground">
                    {totalBalance}
                  </span>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="link" className="h-6 p-0 text-primary">
                      <Icon symbol="add" />
                      {t("accounts.create_account_button")}
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{t("accounts.create_account_dialog.title")}</DialogTitle>
                      <DialogDescription>
                        {t("accounts.create_account_dialog.description")}
                      </DialogDescription>
                    </DialogHeader>
                    <DialogBody>
                      <Input
                        placeholder={t("accounts.create_account_dialog.input_placeholder")}
                        value={newAccountName}
                        onChange={(e) => setNewAccountName(e.target.value)}
                      />
                    </DialogBody>
                    <DialogFooter>
                      <Button
                        variant="secondary"
                        onClick={() => {
                          setIsDialogOpen(false);
                          setNewAccountName("");
                        }}
                      >
                        {t("accounts.create_account_dialog.cancel")}
                      </Button>
                      <Button
                        disabled={!newAccountName.trim()}
                        onClick={handleCreateAccount}
                      >
                        {t("accounts.create_account_dialog.create")}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </Card>

          {/* accounts grid */}
          <div className="flex flex-wrap gap-6">
            {accounts.map((account) => (
              <Card key={account.id} className="w-full sm:flex-1 sm:min-w-[400px] bg-primary-50 border-transparent p-6 relative">
                {/* menu button */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button 
                      className="absolute right-4 top-4 border-none bg-transparent p-0 hover:bg-transparent focus:outline-none focus-visible:outline-none active:bg-transparent"
                      style={{ WebkitTapHighlightColor: 'transparent' }}
                    >
                      <Icon symbol="more_vert" weight={200} className="text-foreground" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      {t("accounts.dropdown_menu.add_balance")}
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => handleOpenTransferDialog(account.id)}>
                      {t("accounts.dropdown_menu.transfer")}
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to={`/accounts/${account.id}/movements`}>
                        {t("accounts.dropdown_menu.view_movements")}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => handleOpenEditNameDialog(account.id, account.name)}>
                      {t("accounts.dropdown_menu.edit_name")}
                    </DropdownMenuItem>
                    <DropdownMenuItem variant="destructive" onSelect={() => handleOpenDeleteDialog(account.id)}>
                      {t("accounts.dropdown_menu.delete")}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <div className="flex flex-col gap-8">
                  <div className="flex flex-col gap-4">
                    <h3 className="text-sm font-bold text-foreground leading-5">
                      {account.name}
                    </h3>
                    <div className="inline-flex items-center gap-3 bg-white rounded-full px-4 py-4 h-14 w-fit">
                      <span className="text-sm font-bold text-foreground">
                        {account.balance}
                      </span>
                      <span className="text-sm text-foreground">
                        {account.currency}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-8">
                    <Button variant="default" className="w-fit" asChild>
                      <Link to={`/accounts/${account.id}/movements`}>
                        {t("accounts.card.view_movements")}
                      </Link>
                    </Button>
                    <Button 
                      variant="link" 
                      className="h-6 p-0 text-primary"
                      onClick={() => handleOpenTransferDialog(account.id)}
                    >
                      <Icon symbol="swap_horiz" />
                      {t("accounts.card.transfer")}
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
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
                value={editedAccountName}
                onChange={(e) => setEditedAccountName(e.target.value)}
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
              disabled={!editedAccountName.trim() || editedAccountName === accounts.find(a => a.id === editingAccountId)?.name}
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

      {/* Transfer Dialog */}
      <Dialog open={isTransferDialogOpen} onOpenChange={setIsTransferDialogOpen}>
        <DialogContent className="sm:max-w-[640px]">
          <DialogHeader>
            <DialogTitle>
              {t("accounts.transfer_dialog.title", { 
                accountName: accounts.find(a => a.id === transferFromAccountId)?.name || "" 
              })}
            </DialogTitle>
            <DialogDescription>
              {t("accounts.transfer_dialog.description")}
            </DialogDescription>
          </DialogHeader>
          <DialogBody className="flex flex-col gap-6">
            {/* amount */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="transfer-amount" className="text-xs text-foreground">
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
                    const fromAccount = accounts.find(a => a.id === transferFromAccountId);
                    if (fromAccount) {
                      // Extract numeric value from balance (e.g., "$90.784.510,46" -> "90784510.46")
                      const numericBalance = fromAccount.balance.replace(/[^0-9,]/g, '').replace('.', '').replace(',', '.');
                      setTransferAmount(numericBalance);
                    }
                  }}
                >
                  {t("accounts.transfer_dialog.use_all")}
                </AmountInputAction>
              </AmountInputContainer>
              {transferFromAccountId && (
                <p className="text-xs text-foreground">
                  {t("accounts.transfer_dialog.available_balance")}: {accounts.find(a => a.id === transferFromAccountId)?.balance}
                </p>
              )}
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
              options={accounts
                .filter(a => a.id !== transferFromAccountId)
                .map(account => ({
                  value: account.id,
                  label: account.name,
                  supportiveText: `${account.balance} ${account.currency}`,
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

      {/* Delete Account Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[640px] gap-12">
          <DialogHeader>
            <DialogTitle>{t("accounts.delete_dialog.title")}</DialogTitle>
            <DialogDescription>
              {t("accounts.delete_dialog.warning_message")}
            </DialogDescription>
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
    </>
  );
}
