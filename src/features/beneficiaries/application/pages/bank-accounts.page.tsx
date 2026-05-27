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
import { Button } from "@adamosuiteservices/ui/button";
import { Badge } from "@adamosuiteservices/ui/badge";
import { Icon } from "@adamosuiteservices/ui/icon";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@adamosuiteservices/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@adamosuiteservices/ui/dropdown-menu";
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
import { Checkbox } from "@adamosuiteservices/ui/checkbox";
import { Label } from "@adamosuiteservices/ui/label";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@adamosuiteservices/ui/input-otp";
import { ToastManager } from "@adamosuiteservices/ui/toaster";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import { Link, useParams, useNavigate } from "react-router";
import { useState } from "react";
import { PageContainer } from "@/features/common/components/layout/page-container";
import { AddBankAccountDialog } from "../components/add-bank-account-dialog";
import { EditBankAccountDialog } from "../components/edit-bank-account-dialog";
import { DeleteBankAccountDialog } from "../components/delete-bank-account-dialog";

export function BankAccountsPage() {
  const { t } = useTranslation("beneficiaries");
  const { beneficiaryId } = useParams();
  const navigate = useNavigate();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isOtpDialogOpen, setIsOtpDialogOpen] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [otpAction, setOtpAction] = useState<"add" | "edit" | "delete">("edit");
  const [pendingEditData, setPendingEditData] = useState<{
    accountType: string;
    bank: string;
    accountNumber: string;
    isPrimary: boolean;
  } | null>(null);
  const [pendingAddData, setPendingAddData] = useState<{
    accountType: string;
    bank: string;
    accountNumber: string;
    isPrimary: boolean;
  } | null>(null);
  const [accountToEdit, setAccountToEdit] = useState<{ id: string; bank: string; accountType: string; accountNumber: string; isPrimary: boolean } | null>(null);
  const [accountToDelete, setAccountToDelete] = useState<{ id: string; bank: string; accountNumber: string } | null>(null);

  // export dialog state
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [exportFormatCSV, setExportFormatCSV] = useState(false);
  const [exportFormatPDF, setExportFormatPDF] = useState(false);

  // bank accounts state - mutable to reflect changes
  const [bankAccounts, setBankAccounts] = useState([
    {
      id: "1",
      bank: "Davivienda",
      accountType: "Corriente",
      accountNumber: "0034-39923-43401",
      isPrimary: false,
    },
    {
      id: "2",
      bank: "Davivienda",
      accountType: "Ahorros",
      accountNumber: "002-83336-90116",
      isPrimary: true,
    },
    {
      id: "3",
      bank: "BBVA",
      accountType: "Ahorros",
      accountNumber: "3949-01329-93211",
      isPrimary: false,
    },
    {
      id: "4",
      bank: "Cobre",
      accountType: "Ahorros",
      accountNumber: "1111-83421-03027",
      isPrimary: false,
    },
  ]);

  const sidebarTopBarPortal = usePortalContainer("[data-slot='sidebar-top-bar-portal']");

  // TODO: Fetch bank accounts data using beneficiaryId from API
  console.log("Managing bank accounts for beneficiary:", beneficiaryId);

  // TODO: Replace with actual beneficiary data from API
  const beneficiaryData = {
    documentType: "cc",
    documentNumber: "129.330.220",
    firstName: "Juan Carlos",
    lastName: "Gutierrez Díaz",
  };

  const handleEdit = (accountId: string) => {
    const account = bankAccounts.find((acc) => acc.id === accountId);
    if (account) {
      setAccountToEdit({
        id: account.id,
        bank: account.bank,
        accountType: account.accountType,
        accountNumber: account.accountNumber,
        isPrimary: account.isPrimary,
      });
      setIsEditDialogOpen(true);
    }
  };

  const confirmEdit = (data: {
    accountType: string;
    bank: string;
    accountNumber: string;
    isPrimary: boolean;
  }) => {
    // Store pending data and open OTP dialog
    setPendingEditData(data);
    setOtpAction("edit");
    setIsEditDialogOpen(false);
    // Small delay to allow edit dialog to close before opening OTP dialog
    setTimeout(() => {
      setIsOtpDialogOpen(true);
    }, 200);
  };

  const confirmAdd = (data: {
    accountType: string;
    bank: string;
    accountNumber: string;
    isPrimary: boolean;
  }) => {
    // Store pending data and open OTP dialog
    setPendingAddData(data);
    setOtpAction("add");
    setIsAddDialogOpen(false);
    // Small delay to allow add dialog to close before opening OTP dialog
    setTimeout(() => {
      setIsOtpDialogOpen(true);
    }, 200);
  };

  const handleOtpSubmit = () => {
    if (otpAction === "add" && pendingAddData) {
      console.log("Add account:", pendingAddData);
      
      // Generate new account ID
      const newId = (bankAccounts.length + 1).toString();
      
      // Create new account
      const newAccount = {
        id: newId,
        accountType: pendingAddData.accountType.charAt(0).toUpperCase() + pendingAddData.accountType.slice(1),
        bank: pendingAddData.bank.charAt(0).toUpperCase() + pendingAddData.bank.slice(1),
        accountNumber: pendingAddData.accountNumber,
        isPrimary: pendingAddData.isPrimary,
      };
      
      // Add to bank accounts state
      setBankAccounts((prevAccounts) => {
        if (pendingAddData.isPrimary) {
          // If new account is primary, remove primary from others
          return [
            ...prevAccounts.map((account) => ({ ...account, isPrimary: false })),
            newAccount,
          ];
        }
        return [...prevAccounts, newAccount];
      });
      
      // Show success toast
      ToastManager.show({
        message: t("beneficiaries.bank_accounts.add_success"),
        variant: "success",
      });
      
      // Reset states
      setPendingAddData(null);
    } else if (otpAction === "edit" && accountToEdit && pendingEditData) {
      console.log("Edit account:", accountToEdit.id, pendingEditData);
      
      // Update bank accounts state
      setBankAccounts((prevAccounts) => {
        return prevAccounts.map((account) => {
          if (account.id === accountToEdit.id) {
            // Update the edited account
            return {
              ...account,
              accountType: pendingEditData.accountType.charAt(0).toUpperCase() + pendingEditData.accountType.slice(1),
              bank: pendingEditData.bank.charAt(0).toUpperCase() + pendingEditData.bank.slice(1),
              accountNumber: pendingEditData.accountNumber,
              isPrimary: pendingEditData.isPrimary,
            };
          } else if (pendingEditData.isPrimary && account.isPrimary) {
            // If the edited account is set as primary, remove primary from others
            return { ...account, isPrimary: false };
          }
          return account;
        });
      });
      
      // Show success toast
      ToastManager.show({
        message: t("beneficiaries.bank_accounts.edit_success"),
        variant: "success",
      });
      
      // Reset states
      setAccountToEdit(null);
      setPendingEditData(null);
    } else if (otpAction === "delete" && accountToDelete) {
      console.log("Delete account:", accountToDelete.id);
      
      // Remove account from state
      setBankAccounts((prevAccounts) => 
        prevAccounts.filter((account) => account.id !== accountToDelete.id)
      );
      
      // Show success toast
      ToastManager.show({
        message: t("beneficiaries.bank_accounts.delete_success"),
        variant: "success",
      });
      
      // Reset states
      setAccountToDelete(null);
    }
    
    // Close OTP dialog and reset
    setIsOtpDialogOpen(false);
    setOtpCode("");
  };

  const handleSetPrimary = (accountId: string) => {
    console.log("Set as primary:", accountId);
    
    // Update bank accounts state
    setBankAccounts((prevAccounts) => {
      return prevAccounts.map((account) => {
        if (account.id === accountId) {
          // Set this account as primary
          return { ...account, isPrimary: true };
        } else if (account.isPrimary) {
          // Remove primary from the previous primary account
          return { ...account, isPrimary: false };
        }
        return account;
      });
    });
    
    // Show success toast
    ToastManager.show({
      message: t("beneficiaries.bank_accounts.set_primary_success"),
      variant: "success",
    });
  };

  const handleDelete = (accountId: string) => {
    const account = bankAccounts.find((acc) => acc.id === accountId);
    if (account) {
      setAccountToDelete({
        id: account.id,
        bank: account.bank,
        accountNumber: account.accountNumber,
      });
      setIsDeleteDialogOpen(true);
    }
  };

  const confirmDelete = () => {
    if (accountToDelete) {
      // Close delete dialog and open OTP dialog
      setOtpAction("delete");
      setIsDeleteDialogOpen(false);
      // Small delay to allow delete dialog to close before opening OTP dialog
      setTimeout(() => {
        setIsOtpDialogOpen(true);
      }, 200);
    }
  };

  return (
    <>
      {sidebarTopBarPortal && createPortal(
        <Breadcrumb>
          <BreadcrumbList className="flex-nowrap">
            <BreadcrumbItem className="hidden md:block">
              <BreadcrumbLink asChild>
                <Link to="/beneficiaries">{t("beneficiaries.page_title")}</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="hidden md:block" />
            <BreadcrumbItem className="hidden md:block">
              <BreadcrumbLink asChild>
                <Link to={`/beneficiaries/${beneficiaryId}`}>{t("beneficiaries.detail.page_title")}</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbItem className="md:hidden">
              <button onClick={() => navigate(`/beneficiaries/${beneficiaryId}`)} className="flex h-9 w-9 items-center justify-center">
                <BreadcrumbEllipsis />
              </button>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem className="min-w-0">
              <BreadcrumbPage className="truncate">{t("beneficiaries.bank_accounts.page_title")}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>,
        sidebarTopBarPortal,
      )}
      <PageContainer>
        <div className="bg-white border border-border rounded-3xl p-6 flex flex-col gap-6">
          {/* Header */}
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex-1 min-w-[220px]">
              <p className="text-sm font-semibold text-foreground">
                {t("beneficiaries.bank_accounts.title", { count: bankAccounts.length })}
              </p>
            </div>
            <div className="flex gap-4 items-center">
              <Button variant="default" size="default" onClick={() => setIsAddDialogOpen(true)}>
                {t("beneficiaries.bank_accounts.add_button")}
              </Button>
              <Dialog open={isExportDialogOpen} onOpenChange={setIsExportDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="secondary" size="default">
                    {t("beneficiaries.bank_accounts.export_button")}
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[640px]">
                  <DialogHeader>
                    <DialogTitle>{t("beneficiaries.bank_accounts.export_dialog.title")}</DialogTitle>
                    <p className="text-sm text-foreground mt-2">{t("beneficiaries.bank_accounts.export_dialog.description")}</p>
                  </DialogHeader>
                  <DialogBody className="flex flex-col gap-8">
                    {/* file type checkboxes */}
                    <div className="flex items-center gap-8">
                      <p className="text-sm text-foreground">{t("beneficiaries.bank_accounts.export_dialog.file_type_label")}</p>
                      <div className="flex items-center gap-3">
                        <Checkbox
                          id="csv"
                          checked={exportFormatCSV}
                          onCheckedChange={(checked) => setExportFormatCSV(checked as boolean)}
                        />
                        <Label htmlFor="csv" className="text-sm text-foreground cursor-pointer">
                          {t("beneficiaries.bank_accounts.export_dialog.csv_excel")}
                        </Label>
                      </div>
                      <div className="flex items-center gap-3">
                        <Checkbox
                          id="pdf"
                          checked={exportFormatPDF}
                          onCheckedChange={(checked) => setExportFormatPDF(checked as boolean)}
                        />
                        <Label htmlFor="pdf" className="text-sm text-foreground cursor-pointer">
                          {t("beneficiaries.bank_accounts.export_dialog.pdf")}
                        </Label>
                      </div>
                    </div>
                  </DialogBody>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant="secondary">
                        {t("beneficiaries.bank_accounts.export_dialog.cancel")}
                      </Button>
                    </DialogClose>
                    <Button 
                      variant="default" 
                      disabled={!exportFormatCSV && !exportFormatPDF}
                    >
                      {t("beneficiaries.bank_accounts.export_dialog.export")}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Table */}
          <Table className="rounded-2xl">
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs font-semibold text-foreground uppercase">
                  {t("beneficiaries.bank_accounts.table.bank")}
                </TableHead>
                <TableHead className="text-xs font-semibold text-foreground uppercase">
                  {t("beneficiaries.bank_accounts.table.account_type")}
                </TableHead>
                <TableHead className="text-xs font-semibold text-foreground uppercase">
                  {t("beneficiaries.bank_accounts.table.account_number")}
                </TableHead>
                <TableHead className="text-xs font-semibold text-foreground uppercase">
                  {t("beneficiaries.bank_accounts.table.label")}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bankAccounts.map((account) => (
                <TableRow
                  key={account.id}
                  className="hover:bg-muted transition-colors"
                >
                  <TableCell className="text-sm text-foreground">
                    {account.bank}
                  </TableCell>
                  <TableCell className="text-sm text-foreground">
                    {account.accountType}
                  </TableCell>
                  <TableCell className="text-sm text-foreground">
                    {account.accountNumber}
                  </TableCell>
                  <TableCell className="text-sm text-foreground">
                    <div className="flex items-center justify-between">
                      {account.isPrimary && (
                        <Badge variant="waiting-medium" className="h-8 px-2 text-sm leading-5 bg-muted">
                          {t("beneficiaries.bank_accounts.primary_label")}
                        </Badge>
                      )}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button 
                            className="ml-auto border-none bg-transparent p-0 hover:bg-transparent focus:outline-none focus-visible:outline-none active:bg-transparent"
                            style={{ WebkitTapHighlightColor: 'transparent' }}
                          >
                            <Icon symbol="more_vert" weight={200} className="text-foreground" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[250px]">
                          <DropdownMenuItem onClick={() => handleEdit(account.id)}>
                            {t("beneficiaries.bank_accounts.menu.edit")}
                          </DropdownMenuItem>
                          {!account.isPrimary && (
                            <DropdownMenuItem onClick={() => handleSetPrimary(account.id)}>
                              {t("beneficiaries.bank_accounts.menu.set_primary")}
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            onClick={() => handleDelete(account.id)}
                            className="text-error-500"
                          >
                            {t("beneficiaries.bank_accounts.menu.delete")}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <AddBankAccountDialog
          open={isAddDialogOpen}
          onOpenChange={setIsAddDialogOpen}
          beneficiaryData={beneficiaryData}
          onConfirm={confirmAdd}
        />

        <EditBankAccountDialog
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          beneficiaryData={beneficiaryData}
          accountData={accountToEdit || undefined}
          onConfirm={confirmEdit}
        />

        <DeleteBankAccountDialog
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
          bankName={accountToDelete?.bank || ""}
          accountNumber={accountToDelete?.accountNumber || ""}
          onConfirm={confirmDelete}
        />

        {/* OTP confirmation dialog */}
        <Dialog open={isOtpDialogOpen} onOpenChange={setIsOtpDialogOpen}>
          <DialogContent className="max-w-[610px] gap-12">
            <DialogHeader className="gap-2">
              <DialogTitle>
                {otpAction === "add"
                  ? t("beneficiaries.bank_accounts.otp_dialog.add_title")
                  : otpAction === "edit" 
                  ? t("beneficiaries.bank_accounts.otp_dialog.edit_title")
                  : t("beneficiaries.bank_accounts.otp_dialog.delete_title")}
              </DialogTitle>
              <p className="text-sm text-foreground">
                {otpAction === "add"
                  ? t("beneficiaries.bank_accounts.otp_dialog.add_description")
                  : otpAction === "edit"
                  ? t("beneficiaries.bank_accounts.otp_dialog.edit_description")
                  : t("beneficiaries.bank_accounts.otp_dialog.delete_description")}
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
                onClick={() => {
                  setIsOtpDialogOpen(false);
                  setOtpCode("");
                  setPendingAddData(null);
                  setPendingEditData(null);
                  setAccountToDelete(null);
                }}
              >
                {t("beneficiaries.bank_accounts.otp_dialog.cancel")}
              </Button>
              <Button 
                variant="default" 
                onClick={handleOtpSubmit}
                disabled={otpCode.length !== 6}
              >
                {t("beneficiaries.bank_accounts.otp_dialog.confirm")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </PageContainer>
    </>
  );
}
