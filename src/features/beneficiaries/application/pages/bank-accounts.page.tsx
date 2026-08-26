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
import { Checkbox } from "@adamosuiteservices/ui/checkbox";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@adamosuiteservices/ui/dropdown-menu";
import { Icon } from "@adamosuiteservices/ui/icon";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@adamosuiteservices/ui/input-otp";
import { Label } from "@adamosuiteservices/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@adamosuiteservices/ui/table";
import { ToastManager } from "@adamosuiteservices/ui/toaster";
import { usePortalContainer } from "@adamosuiteservices/ui/use-portal-container";
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import { Link, useParams, useNavigate } from "react-router";
import { AddBankAccountDialog } from "../components/add-bank-account-dialog";
import { DeleteBankAccountDialog } from "../components/delete-bank-account-dialog";
import { EditBankAccountDialog } from "../components/edit-bank-account-dialog";
import { useBankAccounts, useBeneficiaryDetail, useCreateBankAccount, useDeleteBankAccount, useSetPrimaryBankAccount, useUpdateBankAccount } from "../hooks/use-beneficiaries";
import { mapBankNameToSlug } from "../utils/beneficiary-form.utils";
import type { BankAccount } from "../entities/beneficiary.entity";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
} from "@adamosuiteservices/ui/pagination";
import { PageContainer } from "@/features/common/components/layout/page-container";
import { PermissionGate } from "@/features/auth/application/components/permission-gate";
import { PERMISSIONS } from "@/features/auth/domain/permissions";
import { EXPORT_DATA } from "@/features/auth/domain/permission-ui";
import { canonicalizeDocumentType } from "@/lib/document-type";

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
    accountType: string
    bank: string
    accountNumber: string
    isPrimary: boolean
  } | null>(null);
  const [pendingAddData, setPendingAddData] = useState<{
    accountType: string
    bank: string
    accountNumber: string
    isPrimary: boolean
  } | null>(null);
  const [accountToEdit, setAccountToEdit] = useState<{ id: string, bank: string, accountType: string, accountNumber: string, isPrimary: boolean } | null>(null);
  const [accountToDelete, setAccountToDelete] = useState<{ id: string, bank: string, accountNumber: string } | null>(null);

  // export dialog state
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [exportFormatCSV, setExportFormatCSV] = useState(false);
  const [exportFormatPDF, setExportFormatPDF] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15;

  const bankAccountListParams = useMemo(
    () => ({ page: currentPage, limit: pageSize }),
    [currentPage],
  );

  const {
    bankAccounts: fetchedBankAccounts,
    totalCount,
    refetch,
    isLoading,
  } = useBankAccounts(beneficiaryId ?? "", bankAccountListParams);

  const { beneficiary } = useBeneficiaryDetail(beneficiaryId ?? "");

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  const createBankAccount = useCreateBankAccount();
  const updateBankAccount = useUpdateBankAccount();
  const deleteBankAccount = useDeleteBankAccount();
  const setPrimaryBankAccount = useSetPrimaryBankAccount();

  const bankAccounts = fetchedBankAccounts;

  const sidebarTopBarPortal = usePortalContainer("[data-slot='sidebar-top-bar-portal']");

  const beneficiaryData = {
    documentType: canonicalizeDocumentType(beneficiary?.identificationDocument.type) ?? "CC",
    documentNumber: beneficiary?.identificationDocument.number ?? "",
    firstName: beneficiary?.firstName || beneficiary?.fullName.split(" ")[0] || "",
    lastName: beneficiary?.lastName || beneficiary?.fullName.split(" ").slice(1).join(" ") || "",
  };

  const handleEdit = (accountId: string) => {
    const account = bankAccounts.find((acc) => acc.id === accountId);
    if (account) {
      setAccountToEdit({
        id: account.id,
        bank: mapBankNameToSlug(account.bank),
        accountType: account.accountType,
        accountNumber: account.accountNumber,
        isPrimary: account.isPrimary,
      });
      setIsEditDialogOpen(true);
    }
  };

  const confirmEdit = (data: {
    accountType: string
    bank: string
    accountNumber: string
    isPrimary: boolean
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
    accountType: string
    bank: string
    accountNumber: string
    isPrimary: boolean
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
    if (!beneficiaryId) {
      return;
    }

    if (otpAction === "add" && pendingAddData) {
      createBankAccount.mutate({
        beneficiaryId,
        accountType: pendingAddData.accountType,
        bank: pendingAddData.bank,
        accountNumber: pendingAddData.accountNumber,
        isPrimary: pendingAddData.isPrimary,
        totp: otpCode,
      }, {
        onSuccess: () => {
          setPendingAddData(null);
          void refetch();
        },
      });
    } else if (otpAction === "edit" && accountToEdit && pendingEditData) {
      updateBankAccount.mutate({
        beneficiaryId,
        bankAccountId: accountToEdit.id,
        accountType: pendingEditData.accountType,
        bank: pendingEditData.bank,
        accountNumber: pendingEditData.accountNumber,
        isPrimary: pendingEditData.isPrimary,
        totp: otpCode,
      }, {
        onSuccess: () => {
          setAccountToEdit(null);
          setPendingEditData(null);
          void refetch();
        },
      });
    } else if (otpAction === "delete" && accountToDelete) {
      deleteBankAccount.mutate({
        beneficiaryId,
        bankAccountId: accountToDelete.id,
        totp: otpCode,
      }, {
        onSuccess: () => {
          setAccountToDelete(null);
          void refetch();
        },
      });
    }

    setIsOtpDialogOpen(false);
    setOtpCode("");
  };

  const handleSetPrimary = (accountId: string) => {
    if (!beneficiaryId) {
      return;
    }

    setPrimaryBankAccount.mutate({
      beneficiaryId,
      bankAccountId: accountId,
    }, {
      onSuccess: () => {
        void refetch();
      },
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
            <BreadcrumbItem className={`
              hidden
              md:block
            `}
            >
              <BreadcrumbLink asChild>
                <Link to="/beneficiaries">{t("beneficiaries.page_title")}</Link>
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
                <Link to={`/beneficiaries/${beneficiaryId}`}>{t("beneficiaries.detail.page_title")}</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbItem className="md:hidden">
              <button
                onClick={() => navigate(`/beneficiaries/${beneficiaryId}`)}
                className="flex h-9 w-9 items-center justify-center"
              >
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
        <div className={`
          flex flex-col gap-6 rounded-3xl border border-border bg-white p-6
        `}
        >
          {/* Header */}
          <div className="flex flex-wrap items-center gap-6">
            <div className="min-w-[220px] flex-1">
              <p className="text-sm font-semibold text-foreground">
                {t("beneficiaries.bank_accounts.title", { count: totalCount })}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="secondary" size="icon" onClick={() => refetch()}>
                <Icon symbol="refresh" weight={200} />
              </Button>
              <PermissionGate permission={PERMISSIONS.BENEFICIARIES_CREATE}>
              <Button variant="default" size="default" onClick={() => setIsAddDialogOpen(true)}>
                {t("beneficiaries.bank_accounts.add_button")}
              </Button>
              </PermissionGate>
              <PermissionGate permission={[...EXPORT_DATA]} mode="any">
              <Dialog open={isExportDialogOpen} onOpenChange={setIsExportDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="secondary" size="default">
                    {t("beneficiaries.bank_accounts.export_button")}
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[640px]">
                  <DialogHeader>
                    <DialogTitle>{t("beneficiaries.bank_accounts.export_dialog.title")}</DialogTitle>
                    <p className="mt-2 text-sm text-foreground">{t("beneficiaries.bank_accounts.export_dialog.description")}</p>
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
                        <Label
                          htmlFor="csv"
                          className="cursor-pointer text-sm text-foreground"
                        >
                          {t("beneficiaries.bank_accounts.export_dialog.csv_excel")}
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
                          className="cursor-pointer text-sm text-foreground"
                        >
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
              </PermissionGate>
            </div>
          </div>
          {/* Table */}
          <Table className="rounded-2xl">
            <TableHeader>
              <TableRow>
                <TableHead className={`
                  text-xs font-semibold text-foreground uppercase
                `}
                >
                  {t("beneficiaries.bank_accounts.table.bank")}
                </TableHead>
                <TableHead className={`
                  text-xs font-semibold text-foreground uppercase
                `}
                >
                  {t("beneficiaries.bank_accounts.table.account_type")}
                </TableHead>
                <TableHead className={`
                  text-xs font-semibold text-foreground uppercase
                `}
                >
                  {t("beneficiaries.bank_accounts.table.account_number")}
                </TableHead>
                <TableHead className={`
                  text-xs font-semibold text-foreground uppercase
                `}
                >
                  {t("beneficiaries.bank_accounts.table.label")}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && bankAccounts.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center text-sm text-muted-foreground"
                  >
                    {t("beneficiaries.loading", { defaultValue: "Cargando..." })}
                  </TableCell>
                </TableRow>
              ) : bankAccounts.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center text-sm text-muted-foreground"
                  >
                    {t("beneficiaries.bank_accounts.empty", { defaultValue: "No hay cuentas bancarias" })}
                  </TableCell>
                </TableRow>
              ) : bankAccounts.map((account) => (
                <TableRow
                  key={account.id}
                  className={`
                    transition-colors
                    hover:bg-muted
                  `}
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
                        <Badge
                          variant="waiting-medium"
                          className="h-8 bg-muted px-2 text-sm leading-5"
                        >
                          {t("beneficiaries.bank_accounts.primary_label")}
                        </Badge>
                      )}
                      <PermissionGate permission={PERMISSIONS.BENEFICIARIES_CREATE}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button
                            className={`
                              ml-auto border-none bg-transparent p-0
                              hover:bg-transparent
                              focus:outline-none
                              focus-visible:outline-none
                              active:bg-transparent
                            `}
                            style={{ WebkitTapHighlightColor: "transparent" }}
                          >
                            <Icon
                              symbol="more_vert"
                              weight={200}
                              className="text-foreground"
                            />
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
                      </PermissionGate>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {totalPages > 1 && (
            <Pagination className="justify-start">
              <PaginationContent>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, index) => {
                  const page = index + 1;
                  return (
                    <PaginationItem key={page}>
                      <PaginationLink
                        isActive={page === currentPage}
                        onClick={() => setCurrentPage(page)}
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  );
                })}
                {totalPages > 5 && (
                  <PaginationItem>
                    <PaginationEllipsis />
                  </PaginationItem>
                )}
                {totalPages > 5 && (
                  <PaginationItem>
                    <PaginationLink onClick={() => setCurrentPage(totalPages)}>
                      {totalPages}
                    </PaginationLink>
                  </PaginationItem>
                )}
                {currentPage < totalPages && (
                  <PaginationItem>
                    <PaginationNext onClick={() => setCurrentPage(currentPage + 1)}>
                      {t("beneficiaries.pagination.next", { defaultValue: "Siguiente" })}
                    </PaginationNext>
                  </PaginationItem>
                )}
              </PaginationContent>
            </Pagination>
          )}
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
