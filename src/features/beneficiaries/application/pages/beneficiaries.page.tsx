import { Badge } from "@adamosuiteservices/ui/badge";
import { Button } from "@adamosuiteservices/ui/button";
import { Card } from "@adamosuiteservices/ui/card";
import { Checkbox } from "@adamosuiteservices/ui/checkbox";
import { Combobox } from "@adamosuiteservices/ui/combobox";
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
import { Icon } from "@adamosuiteservices/ui/icon";
import { Input } from "@adamosuiteservices/ui/input";
import { Label } from "@adamosuiteservices/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@adamosuiteservices/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@adamosuiteservices/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@adamosuiteservices/ui/tabs";
import { ToastManager } from "@adamosuiteservices/ui/toaster";
import { usePortalContainer } from "@adamosuiteservices/ui/use-portal-container";
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import { PermissionGate } from "@/features/auth/application/components/permission-gate";
import { PERMISSIONS } from "@/features/auth/domain/permissions";
import { useBeneficiaries, useCreateBeneficiary } from "../hooks/use-beneficiaries";
import { usePaymentsRealtime } from "@/features/transactions/application/hooks/use-payments-realtime";
import { buildBeneficiaryListParams } from "../utils/beneficiary-filters.utils";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
} from "@adamosuiteservices/ui/pagination";
import { PageContainer } from "@/features/common/components/layout/page-container";
import { PageTitle } from "@/features/common/components/layout/page-title";
import { useSourceCatalog } from "@/features/source/application/hooks/use-source-catalog";
import { useCountry } from "@/features/common/contexts/use-country";
import { StickyFilterHeader } from "@/features/common/components/layout/sticky-filter-header";
import { ReportsService } from "@/features/reports/api/services/reports.service";

const BENEFICIARIES_QUERY_KEY = ["beneficiaries"];

export function BeneficiariesPage() {
  const { t } = useTranslation("beneficiaries");
  const navigate = useNavigate();
  const { countryCode, currency } = useCountry();
  const { documentTypes, accountTypes, banks } = useSourceCatalog("beneficiaries");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    documentType: "",
    documentNumber: "",
    firstName: "",
    lastName: "",
    accountType: "",
    bank: "",
    accountNumber: "",
    isMainAccount: false,
  });

  // export dialog state
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [exportStatusFilter, setExportStatusFilter] = useState<string[]>(["all"]);
  const [exportFormatCSV, setExportFormatCSV] = useState(false);
  const [exportFormatPDF, setExportFormatPDF] = useState(false);

  const handleExportBeneficiaries = async() => {
    try {
      const statuses = exportStatusFilter.filter((status) => status !== "all");

      await ReportsService.create({
        name: "Beneficiarios",
        type: "beneficiaries",
        format: "csv",
        filters: {
          status: statuses.length > 0 ? statuses.join(",") : undefined,
        },
      });

      ToastManager.show({
        message: t("beneficiaries.export_dialog.success"),
        variant: "success",
      });
      setIsExportDialogOpen(false);
      setExportFormatCSV(false);
      setExportFormatPDF(false);
    } catch {
      ToastManager.show({
        message: t("beneficiaries.export_dialog.error"),
        variant: "destructive",
      });
    }
  };

  const sidebarTopBarPortal = usePortalContainer("[data-slot='sidebar-top-bar-portal']");

  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15;

  const listParams = useMemo(
    () => buildBeneficiaryListParams({
      tab: activeTab,
      search: searchQuery,
      page: currentPage,
      limit: pageSize,
    }),
    [activeTab, searchQuery, currentPage],
  );

  const {
    beneficiaries,
    totalCount,
    refetch,
    isLoading,
  } = useBeneficiaries(listParams);
  usePaymentsRealtime({ extraInvalidateKeys: [BENEFICIARIES_QUERY_KEY] });

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  const createBeneficiary = useCreateBeneficiary();

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchQuery]);

  const displayedBeneficiaries = beneficiaries;

  const handleRowClick = (beneficiaryId: string) => {
    navigate(`/beneficiaries/${beneficiaryId}`);
  };

  /**
   * handle add beneficiary
   */
  const handleAddBeneficiary = () => {
    createBeneficiary.mutate({
      documentType: formData.documentType,
      documentNumber: formData.documentNumber,
      firstName: formData.firstName,
      lastName: formData.lastName,
      accountType: formData.accountType,
      bank: formData.bank,
      accountNumber: formData.accountNumber,
      isMainAccount: formData.isMainAccount,
      countryCode,
      currency,
    }, {
      onSuccess: (result) => {
        setIsDialogOpen(false);
        setFormData({
          documentType: "",
          documentNumber: "",
          firstName: "",
          lastName: "",
          accountType: "",
          bank: "",
          accountNumber: "",
          isMainAccount: false,
        });
        if (result.data?.id) {
          navigate(`/beneficiaries/${result.data.id}`);
        } else {
          void refetch();
        }
      },
    });
  };

  return (
    <>
      {sidebarTopBarPortal && createPortal(
        <PageTitle>{t("beneficiaries.page_title")}</PageTitle>,
        sidebarTopBarPortal,
      )}
      <PageContainer>
        <Card className="flex flex-col gap-0 overflow-visible border p-6">
          <StickyFilterHeader className="flex flex-col gap-0">
            {/* header with search */}
            <div className="flex flex-wrap items-center gap-6">
              <div className="flex min-w-[220px] flex-1 items-center gap-4">
                <Button variant="secondary" size="icon" onClick={() => refetch()}>
                  <Icon symbol="refresh" weight={200} />
                </Button>
                <p className="text-sm font-semibold text-foreground">
                  {t("beneficiaries.count", { count: totalCount })}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <PermissionGate permission={PERMISSIONS.BENEFICIARIES_CREATE}>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="default">
                      {t("beneficiaries.add_button")}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[640px]">
                    <DialogHeader>
                      <DialogTitle>{t("beneficiaries.dialog.title")}</DialogTitle>
                      <DialogDescription>{t("beneficiaries.dialog.description")}</DialogDescription>
                    </DialogHeader>
                    <DialogBody>
                      <div className="flex flex-wrap gap-4">
                        <div className={`
                          flex min-w-[250px] flex-1 flex-col gap-2
                        `}
                        >
                          <Label>{t("beneficiaries.dialog.document_type")}</Label>
                          <Select
                            value={formData.documentType}
                            onValueChange={(value) => setFormData({ ...formData, documentType: value })}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder={t("beneficiaries.dialog.document_type_placeholder")} />
                            </SelectTrigger>
                            <SelectContent>
                            {documentTypes.map((item) => (
                              <SelectItem key={item.code} value={item.code}>
                                {item.name}
                              </SelectItem>
                            ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className={`
                          flex min-w-[250px] flex-1 flex-col gap-2
                        `}
                        >
                          <Label>{t("beneficiaries.dialog.document_number")}</Label>
                          <Input
                            placeholder={t("beneficiaries.dialog.document_number_placeholder")}
                            value={formData.documentNumber}
                            onChange={(e) => setFormData({ ...formData, documentNumber: e.target.value })}
                          />
                        </div>
                        <div className={`
                          flex min-w-[250px] flex-1 flex-col gap-2
                        `}
                        >
                          <Label>{t("beneficiaries.dialog.first_name")}</Label>
                          <Input
                            placeholder={t("beneficiaries.dialog.first_name_placeholder")}
                            value={formData.firstName}
                            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                          />
                        </div>
                        <div className={`
                          flex min-w-[250px] flex-1 flex-col gap-2
                        `}
                        >
                          <Label>{t("beneficiaries.dialog.last_name")}</Label>
                          <Input
                            placeholder={t("beneficiaries.dialog.last_name_placeholder")}
                            value={formData.lastName}
                            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                          />
                        </div>
                        <div className={`
                          flex min-w-[250px] flex-1 flex-col gap-2
                        `}
                        >
                          <Label>{t("beneficiaries.dialog.account_type")}</Label>
                          <Select
                            value={formData.accountType}
                            onValueChange={(value) => setFormData({ ...formData, accountType: value })}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder={t("beneficiaries.dialog.account_type_placeholder")} />
                            </SelectTrigger>
                            <SelectContent>
                            {accountTypes.map((item) => (
                              <SelectItem key={item.code} value={item.code}>
                                {item.name}
                              </SelectItem>
                            ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className={`
                          flex min-w-[250px] flex-1 flex-col gap-2
                        `}
                        >
                          <Label>{t("beneficiaries.dialog.bank")}</Label>
                          <Select
                            value={formData.bank}
                            onValueChange={(value) => setFormData({ ...formData, bank: value })}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder={t("beneficiaries.dialog.bank_placeholder")} />
                            </SelectTrigger>
                            <SelectContent>
                            {banks.map((bank) => (
                              <SelectItem key={bank.achCode} value={bank.achCode}>
                                {bank.name}
                              </SelectItem>
                            ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className={`
                          flex min-w-[250px] flex-1 flex-col gap-2
                        `}
                        >
                          <Label>{t("beneficiaries.dialog.account_number")}</Label>
                          <Input
                            placeholder={t("beneficiaries.dialog.account_number_placeholder")}
                            value={formData.accountNumber}
                            onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                          />
                        </div>
                      </div>
                      <div className="mt-4 flex items-center gap-2">
                        <Checkbox
                          id="main-account"
                          checked={formData.isMainAccount}
                          onCheckedChange={(checked) => setFormData({ ...formData, isMainAccount: checked === true })}
                        />
                        <Label
                          htmlFor="main-account"
                          className="cursor-pointer text-sm"
                        >
                          {t("beneficiaries.dialog.main_account")}
                        </Label>
                      </div>
                    </DialogBody>
                    <DialogFooter>
                      <Button
                        variant="secondary"
                        onClick={() => {
                          setIsDialogOpen(false);
                          setFormData({
                            documentType: "",
                            documentNumber: "",
                            firstName: "",
                            lastName: "",
                            accountType: "",
                            bank: "",
                            accountNumber: "",
                            isMainAccount: false,
                          });
                        }}
                      >
                        {t("beneficiaries.dialog.cancel")}
                      </Button>
                      <Button
                        variant="default"
                        disabled={
                          !formData.documentType
                          || !formData.documentNumber
                          || !formData.firstName
                          || !formData.lastName
                          || !formData.accountType
                          || !formData.bank
                          || !formData.accountNumber
                        }
                        onClick={handleAddBeneficiary}
                      >
                        {t("beneficiaries.dialog.submit")}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                </PermissionGate>
                <PermissionGate permission={PERMISSIONS.REPORTS_OWN}>
                <Dialog open={isExportDialogOpen} onOpenChange={setIsExportDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="secondary">
                      {t("beneficiaries.export_button")}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[640px]">
                    <DialogHeader>
                      <DialogTitle>{t("beneficiaries.export_dialog.title")}</DialogTitle>
                      <p className="mt-2 text-sm text-foreground">{t("beneficiaries.export_dialog.description")}</p>
                    </DialogHeader>
                    <DialogBody className="flex flex-col gap-8">
                      {/* filters */}
                      <div className="flex flex-col gap-4">
                        {/* status filter */}
                        <div className="w-full">
                          <Combobox
                            multiple
                            exclusiveOption="all"
                            alwaysShowPlaceholder
                            valuePosition="right"
                            icon="search_activity"
                            options={[
                              { value: "all", label: t("beneficiaries.tabs.all") },
                              { value: "with_news", label: t("beneficiaries.status.with_news") },
                              { value: "without_news", label: t("beneficiaries.status.without_news") },
                            ]}
                            value={exportStatusFilter}
                            onValueChange={(value) => setExportStatusFilter(value as string[])}
                            labels={{
                              placeholder: t("beneficiaries.export_dialog.status_filter"),
                            }}
                            classNames={{
                              trigger: "h-10 w-full",
                            }}
                          />
                        </div>
                      </div>
                      {/* file type checkboxes */}
                      <div className="flex items-center gap-8">
                        <p className="text-sm text-foreground">{t("beneficiaries.export_dialog.file_type_label")}</p>
                        <div className="flex items-center gap-3">
                          <Checkbox
                            id="beneficiaries-csv"
                            checked={exportFormatCSV}
                            onCheckedChange={(checked) => setExportFormatCSV(checked as boolean)}
                          />
                          <Label
                            htmlFor="beneficiaries-csv"
                            className="cursor-pointer text-sm"
                          >
                            {t("beneficiaries.export_dialog.csv_excel")}
                          </Label>
                        </div>
                        <div className="flex items-center gap-3">
                          <Checkbox
                            id="beneficiaries-pdf"
                            checked={exportFormatPDF}
                            onCheckedChange={(checked) => setExportFormatPDF(checked as boolean)}
                          />
                          <Label
                            htmlFor="beneficiaries-pdf"
                            className="cursor-pointer text-sm"
                          >
                            {t("beneficiaries.export_dialog.pdf")}
                          </Label>
                        </div>
                      </div>
                    </DialogBody>
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button variant="secondary">
                          {t("beneficiaries.export_dialog.cancel")}
                        </Button>
                      </DialogClose>
                      <Button
                        variant="default"
                        disabled={!exportFormatCSV}
                        onClick={() => void handleExportBeneficiaries()}
                      >
                        {t("beneficiaries.export_dialog.export")}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                </PermissionGate>
              </div>
              <div className={`
                basis-full
                lg:min-w-[500px] lg:flex-1 lg:basis-0
              `}
              >
                <div className="relative">
                  <Icon
                    symbol="search"
                    className={`
                      absolute top-1/2 left-2 -translate-y-1/2
                      text-muted-foreground
                    `}
                  />
                  <Input
                    placeholder={t("beneficiaries.search_placeholder")}
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </div>
            {/* tabs */}
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="mt-6"
            >
              <TabsList>
                <TabsTrigger value="all">{t("beneficiaries.tabs.all")}</TabsTrigger>
                <TabsTrigger value="with-news">{t("beneficiaries.tabs.with_news")}</TabsTrigger>
                <TabsTrigger value="without-news">{t("beneficiaries.tabs.without_news")}</TabsTrigger>
              </TabsList>
            </Tabs>
          </StickyFilterHeader>
          {/* table */}
          <div className="mt-6">
            <Table className="rounded-2xl">
              <TableHeader>
                <TableRow className="bg-muted">
                  <TableHead className="text-xs font-semibold text-foreground">{t("beneficiaries.table.beneficiary")}</TableHead>
                  <TableHead className="text-xs font-semibold text-foreground">{t("beneficiaries.table.id_number")}</TableHead>
                  <TableHead className="text-xs font-semibold text-foreground">{t("beneficiaries.table.main_account")}</TableHead>
                  <TableHead className="text-xs font-semibold text-foreground">{t("beneficiaries.table.status")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading && displayedBeneficiaries.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-center text-sm text-muted-foreground"
                    >
                      {t("beneficiaries.loading", { defaultValue: "Cargando..." })}
                    </TableCell>
                  </TableRow>
                ) : displayedBeneficiaries.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-center text-sm text-muted-foreground"
                    >
                      {t("beneficiaries.empty", { defaultValue: "No se encontraron beneficiarios" })}
                    </TableCell>
                  </TableRow>
                ) : displayedBeneficiaries.map((beneficiary) => (
                  <TableRow
                    key={beneficiary.id}
                    onClick={() => handleRowClick(beneficiary.id)}
                    className={`
                      cursor-pointer
                      hover:bg-subtle
                    `}
                  >
                    <TableCell className="text-sm text-foreground">{beneficiary.name}</TableCell>
                    <TableCell className="text-sm text-foreground">{beneficiary.idNumber}</TableCell>
                    <TableCell className="text-sm text-foreground">{beneficiary.account}</TableCell>
                    <TableCell className="text-sm text-foreground">
                      <Badge
                        variant={beneficiary.status === "warning" ? "warning-medium" : "success-medium"}
                        className="h-8 px-2 text-sm leading-5"
                      >
                        {beneficiary.status === "warning" ? t("beneficiaries.status.with_news") : t("beneficiaries.status.without_news")}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {totalPages > 1 && (
              <Pagination className="mt-6 justify-start">
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
        </Card>
      </PageContainer>
    </>
  );
}
