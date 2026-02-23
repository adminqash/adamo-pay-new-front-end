import { usePortalContainer } from "@adamosuiteservices/ui/use-portal-container";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
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
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import { Link, useParams } from "react-router";
import { useState } from "react";
import { PageContainer } from "@/features/common/components/layout/page-container";
import { AddBankAccountDialog } from "../components/add-bank-account-dialog";

export function BankAccountsPage() {
  const { t } = useTranslation("beneficiaries");
  const { beneficiaryId } = useParams();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const sidebarTopBarPortal = usePortalContainer("[data-slot='sidebar-top-bar-portal']");

  // TODO: Fetch bank accounts data using beneficiaryId from API
  console.log("Managing bank accounts for beneficiary:", beneficiaryId);

  // TODO: Replace with actual beneficiary data from API
  const beneficiaryData = {
    documentType: "Cédula de ciudadanía",
    documentNumber: "129.330.220",
    firstName: "Juan Carlos",
    lastName: "Gutierrez Díaz",
  };

  // TODO: Replace with actual data from API
  const bankAccounts = [
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
  ];

  const handleEdit = (accountId: string) => {
    console.log("Edit account:", accountId);
    // TODO: Open edit dialog
  };

  const handleSetPrimary = (accountId: string) => {
    console.log("Set as primary:", accountId);
    // TODO: Update primary account
  };

  const handleDelete = (accountId: string) => {
    console.log("Delete account:", accountId);
    // TODO: Show confirmation dialog and delete
  };

  return (
    <>
      {sidebarTopBarPortal && createPortal(
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/beneficiaries">{t("beneficiaries.page_title")}</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to={`/beneficiaries/${beneficiaryId}`}>{t("beneficiaries.detail.page_title")}</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{t("beneficiaries.bank_accounts.page_title")}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>,
        sidebarTopBarPortal,
      )}
      <PageContainer>
        <div className="bg-white border border-[#e2e3e5] rounded-3xl p-6 flex flex-col gap-6">
          {/* Header */}
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex-1 min-w-[220px]">
              <p className="text-sm font-semibold text-[#41454c]">
                {t("beneficiaries.bank_accounts.title", { count: bankAccounts.length })}
              </p>
            </div>
            <div className="flex gap-4 items-center">
              <Button variant="default" size="default" onClick={() => setIsAddDialogOpen(true)}>
                {t("beneficiaries.bank_accounts.add_button")}
              </Button>
              <Button variant="secondary" size="default">
                {t("beneficiaries.bank_accounts.export_button")}
              </Button>
            </div>
          </div>

          {/* Table */}
          <Table className="rounded-2xl">
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs font-semibold text-[#41454c] uppercase">
                  {t("beneficiaries.bank_accounts.table.bank")}
                </TableHead>
                <TableHead className="text-xs font-semibold text-[#41454c] uppercase">
                  {t("beneficiaries.bank_accounts.table.account_type")}
                </TableHead>
                <TableHead className="text-xs font-semibold text-[#41454c] uppercase">
                  {t("beneficiaries.bank_accounts.table.account_number")}
                </TableHead>
                <TableHead className="text-xs font-semibold text-[#41454c] uppercase">
                  {t("beneficiaries.bank_accounts.table.label")}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bankAccounts.map((account) => (
                <TableRow
                  key={account.id}
                  className="hover:bg-[#f8f8f9] transition-colors"
                >
                  <TableCell className="text-sm text-[#41454c]">
                    {account.bank}
                  </TableCell>
                  <TableCell className="text-sm text-[#41454c]">
                    {account.accountType}
                  </TableCell>
                  <TableCell className="text-sm text-[#41454c]">
                    {account.accountNumber}
                  </TableCell>
                  <TableCell className="text-sm text-[#41454c]">
                    <div className="flex items-center justify-between">
                      {account.isPrimary && (
                        <Badge variant="default-medium">
                          {t("beneficiaries.bank_accounts.primary_label")}
                        </Badge>
                      )}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="ml-auto size-6"
                          >
                            <Icon symbol="more_vert" className="text-xl" />
                          </Button>
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
        />
      </PageContainer>
    </>
  );
}
