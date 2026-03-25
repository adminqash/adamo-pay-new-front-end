import { usePortalContainer } from "@adamosuiteservices/ui/use-portal-container";
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
import { Tabs, TabsList, TabsTrigger } from "@adamosuiteservices/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@adamosuiteservices/ui/table";
import { Badge } from "@adamosuiteservices/ui/badge";
import { ToastManager } from "@adamosuiteservices/ui/toaster";
import { createPortal } from "react-dom";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import { PageContainer } from "@/features/common/components/layout/page-container";
import { PageTitle } from "@/features/common/components/layout/page-title";

export function BeneficiariesPage() {
  const { t } = useTranslation("beneficiaries");
  const navigate = useNavigate();
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

  const sidebarTopBarPortal = usePortalContainer("[data-slot='sidebar-top-bar-portal']");

  const handleRowClick = (beneficiaryId: string) => {
    navigate(`/beneficiaries/${beneficiaryId}`);
  };

  // datos de ejemplo - reemplazar con hook real
  const [beneficiaries, setBeneficiaries] = useState([
    { id: "1", name: "Sofía Mariela Mendoza", idNumber: "129.330.220", account: "$22.350.000,00", status: "warning" },
    { id: "2", name: "Diego Torres", idNumber: "138.456.789", account: "$18.750.000,00", status: "success" },
    { id: "3", name: "Camila Rojas", idNumber: "145.678.912", account: "$27.900.000,00", status: "success" },
    { id: "4", name: "Emma Watson", idNumber: "152.789.123", account: "$15.500.000,00", status: "warning" },
    { id: "5", name: "Javier López Gimenez", idNumber: "163.890.234", account: "$20.000.000,00", status: "warning" },
    { id: "6", name: "Valentina Pérez", idNumber: "174.901.345", account: "$23.750.000,00", status: "warning" },
    { id: "7", name: "Martín González", idNumber: "185.012.456", account: "$19.300.000,00", status: "success" },
    { id: "8", name: "Isabella Fernández", idNumber: "196.123.567", account: "$25.500.000,00", status: "warning" },
    { id: "9", name: "Lucas Martínez", idNumber: "207.234.678", account: "$30.000.000,00", status: "success" },
    { id: "10", name: "Sofía Ramírez", idNumber: "218.345.789", account: "$28.150.000,00", status: "success" },
    { id: "11", name: "Mateo Silva", idNumber: "229.456.890", account: "$16.800.000,00", status: "warning" },
    { id: "12", name: "Emma Díaz", idNumber: "230.567.901", account: "$22.900.000,00", status: "success" },
    { id: "13", name: "Santiago Morales", idNumber: "241.678.012", account: "$21.250.000,00", status: "success" },
    { id: "14", name: "Mia Castro", idNumber: "252.789.123", account: "$24.900.000,00", status: "warning" },
    { id: "15", name: "Benjamín Herrera", idNumber: "263.890.234", account: "$29.000.000,00", status: "success" },
  ]);

  /**
   * handle add beneficiary
   */
  const handleAddBeneficiary = () => {
    const newBeneficiary = {
      id: String(beneficiaries.length + 1),
      name: `${formData.firstName} ${formData.lastName}`,
      idNumber: formData.documentNumber,
      account: "$0,00",
      status: "success" as const,
    };

    setBeneficiaries([...beneficiaries, newBeneficiary]);
    
    ToastManager.show({
      message: t("beneficiaries.detail.messages.beneficiary_created"),
      variant: "success",
    });

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
  };

  return (
    <>
      {sidebarTopBarPortal && createPortal(
        <PageTitle>{t("beneficiaries.page_title")}</PageTitle>,
        sidebarTopBarPortal,
      )}
      <PageContainer>
        <Card className="p-6 flex flex-col gap-6">
          {/* header section */}
          <div className="flex flex-col gap-6">
            {/* header with search */}
            <div className="flex flex-wrap gap-6 items-center">
              <div className="flex-1 min-w-[220px] flex items-center gap-4">
                <Button variant="secondary" size="icon">
                  <Icon symbol="refresh" weight={200} />
                </Button>
                <p className="text-sm font-semibold text-foreground">
                  {t("beneficiaries.count")}
                </p>
              </div>
              <div className="flex gap-4 items-center">
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
                        <div className="flex flex-col gap-2 flex-1 min-w-[250px]">
                          <Label>{t("beneficiaries.dialog.document_type")}</Label>
                          <Select
                            value={formData.documentType}
                            onValueChange={(value) => setFormData({ ...formData, documentType: value })}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder={t("beneficiaries.dialog.document_type_placeholder")} />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="dni">{t("beneficiaries.dialog.document_types.dni")}</SelectItem>
                              <SelectItem value="cuit">{t("beneficiaries.dialog.document_types.cuit")}</SelectItem>
                              <SelectItem value="cuil">{t("beneficiaries.dialog.document_types.cuil")}</SelectItem>
                              <SelectItem value="passport">{t("beneficiaries.dialog.document_types.passport")}</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex flex-col gap-2 flex-1 min-w-[250px]">
                          <Label>{t("beneficiaries.dialog.document_number")}</Label>
                          <Input
                            placeholder={t("beneficiaries.dialog.document_number_placeholder")}
                            value={formData.documentNumber}
                            onChange={(e) => setFormData({ ...formData, documentNumber: e.target.value })}
                          />
                        </div>
                        <div className="flex flex-col gap-2 flex-1 min-w-[250px]">
                          <Label>{t("beneficiaries.dialog.first_name")}</Label>
                          <Input
                            placeholder={t("beneficiaries.dialog.first_name_placeholder")}
                            value={formData.firstName}
                            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                          />
                        </div>
                        <div className="flex flex-col gap-2 flex-1 min-w-[250px]">
                          <Label>{t("beneficiaries.dialog.last_name")}</Label>
                          <Input
                            placeholder={t("beneficiaries.dialog.last_name_placeholder")}
                            value={formData.lastName}
                            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                          />
                        </div>
                        <div className="flex flex-col gap-2 flex-1 min-w-[250px]">
                          <Label>{t("beneficiaries.dialog.account_type")}</Label>
                          <Select
                            value={formData.accountType}
                            onValueChange={(value) => setFormData({ ...formData, accountType: value })}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder={t("beneficiaries.dialog.account_type_placeholder")} />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="savings">{t("beneficiaries.dialog.account_types.savings")}</SelectItem>
                              <SelectItem value="checking">{t("beneficiaries.dialog.account_types.checking")}</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex flex-col gap-2 flex-1 min-w-[250px]">
                          <Label>{t("beneficiaries.dialog.bank")}</Label>
                          <Select
                            value={formData.bank}
                            onValueChange={(value) => setFormData({ ...formData, bank: value })}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder={t("beneficiaries.dialog.bank_placeholder")} />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="galicia">Banco Galicia</SelectItem>
                              <SelectItem value="nacion">Banco Nación</SelectItem>
                              <SelectItem value="santander">Banco Santander</SelectItem>
                              <SelectItem value="bbva">BBVA</SelectItem>
                              <SelectItem value="macro">Banco Macro</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex flex-col gap-2 flex-1 min-w-[250px]">
                          <Label>{t("beneficiaries.dialog.account_number")}</Label>
                          <Input
                            placeholder={t("beneficiaries.dialog.account_number_placeholder")}
                            value={formData.accountNumber}
                            onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                          />
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-4">
                        <Checkbox
                          id="main-account"
                          checked={formData.isMainAccount}
                          onCheckedChange={(checked) => setFormData({ ...formData, isMainAccount: checked === true })}
                        />
                        <Label htmlFor="main-account" className="text-sm cursor-pointer">
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
                          !formData.documentType ||
                          !formData.documentNumber ||
                          !formData.firstName ||
                          !formData.lastName ||
                          !formData.accountType ||
                          !formData.bank ||
                          !formData.accountNumber
                        }
                        onClick={handleAddBeneficiary}
                      >
                        {t("beneficiaries.dialog.submit")}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                <Dialog open={isExportDialogOpen} onOpenChange={setIsExportDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="secondary">
                      {t("beneficiaries.export_button")}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[640px]">
                    <DialogHeader>
                      <DialogTitle>{t("beneficiaries.export_dialog.title")}</DialogTitle>
                      <p className="text-sm text-foreground mt-2">{t("beneficiaries.export_dialog.description")}</p>
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
                          <Label htmlFor="beneficiaries-csv" className="text-sm cursor-pointer">
                            {t("beneficiaries.export_dialog.csv_excel")}
                          </Label>
                        </div>
                        <div className="flex items-center gap-3">
                          <Checkbox
                            id="beneficiaries-pdf"
                            checked={exportFormatPDF}
                            onCheckedChange={(checked) => setExportFormatPDF(checked as boolean)}
                          />
                          <Label htmlFor="beneficiaries-pdf" className="text-sm cursor-pointer">
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
                        disabled={!exportFormatCSV && !exportFormatPDF}
                      >
                        {t("beneficiaries.export_dialog.export")}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
              <div className="basis-full lg:basis-0 lg:flex-1 lg:min-w-[500px]">
                <div className="relative">
                  <Icon symbol="search" className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder={t("beneficiaries.search_placeholder")}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            {/* tabs */}
            <Tabs defaultValue="all">
              <TabsList>
                <TabsTrigger value="all">{t("beneficiaries.tabs.all")}</TabsTrigger>
                <TabsTrigger value="with-news">{t("beneficiaries.tabs.with_news")}</TabsTrigger>
                <TabsTrigger value="without-news">{t("beneficiaries.tabs.without_news")}</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* table */}
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
              {beneficiaries.map((beneficiary) => (
                <TableRow 
                  key={beneficiary.id}
                  onClick={() => handleRowClick(beneficiary.id)}
                  className="cursor-pointer hover:bg-subtle"
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
        </Card>
      </PageContainer>
    </>
  );
}
