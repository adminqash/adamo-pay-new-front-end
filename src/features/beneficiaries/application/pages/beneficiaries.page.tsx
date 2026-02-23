import { usePortalContainer } from "@adamosuiteservices/ui/use-portal-container";
import { Button } from "@adamosuiteservices/ui/button";
import { Card } from "@adamosuiteservices/ui/card";
import { Checkbox } from "@adamosuiteservices/ui/checkbox";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogBody,
  DialogFooter,
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

  const sidebarTopBarPortal = usePortalContainer("[data-slot='sidebar-top-bar-portal']");

  const handleRowClick = (beneficiaryId: string) => {
    navigate(`/beneficiaries/${beneficiaryId}`);
  };

  // datos de ejemplo - reemplazar con hook real
  const beneficiaries = [
    { id: "1", name: "Sofía Mariela Mendoza", idNumber: "Débito", account: "$22.350.000,00", status: "warning" },
    { id: "2", name: "Diego Torres", idNumber: "Débito", account: "$18.750.000,00", status: "success" },
    { id: "3", name: "Camila Rojas", idNumber: "Débito", account: "$27.900.000,00", status: "success" },
    { id: "4", name: "Emma Watson", idNumber: "Crédito", account: "$15.500.000,00", status: "warning" },
    { id: "5", name: "Javier López Gimenez", idNumber: "Crédito", account: "$20.000.000,00", status: "warning" },
    { id: "6", name: "Valentina Pérez", idNumber: "Crédito", account: "$23.750.000,00", status: "warning" },
    { id: "7", name: "Martín González", idNumber: "Débito", account: "$19.300.000,00", status: "success" },
    { id: "8", name: "Isabella Fernández", idNumber: "Débito", account: "$25.500.000,00", status: "warning" },
    { id: "9", name: "Lucas Martínez", idNumber: "Crédito", account: "$30.000.000,00", status: "success" },
    { id: "10", name: "Sofía Ramírez", idNumber: "Débito", account: "$28.150.000,00", status: "success" },
    { id: "11", name: "Mateo Silva", idNumber: "Débito", account: "$16.800.000,00", status: "warning" },
    { id: "12", name: "Emma Díaz", idNumber: "Débito", account: "$22.900.000,00", status: "success" },
    { id: "13", name: "Santiago Morales", idNumber: "Débito", account: "$21.250.000,00", status: "success" },
    { id: "14", name: "Mia Castro", idNumber: "Crédito", account: "$24.900.000,00", status: "warning" },
    { id: "15", name: "Benjamín Herrera", idNumber: "Débito", account: "$29.000.000,00", status: "success" },
  ];

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
                <p className="text-sm font-semibold text-neutrals-700">
                  {t("beneficiaries.count")}
                </p>
              </div>
              <div className="flex gap-4 items-center">
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-pay-500 hover:bg-pay-600 text-neutrals-50">
                      {t("beneficiaries.add_button")}
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{t("beneficiaries.dialog.title")}</DialogTitle>
                      <DialogDescription>{t("beneficiaries.dialog.description")}</DialogDescription>
                    </DialogHeader>
                    <DialogBody>
                      <div className="flex flex-wrap gap-4">
                        <div className="flex flex-col gap-2 flex-1 min-w-[250px]">
                          <Label className="text-xs text-neutrals-600">{t("beneficiaries.dialog.document_type")}</Label>
                          <Select
                            value={formData.documentType}
                            onValueChange={(value) => setFormData({ ...formData, documentType: value })}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder={t("beneficiaries.dialog.document_type_placeholder")} />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="dni">DNI</SelectItem>
                              <SelectItem value="cuit">CUIT</SelectItem>
                              <SelectItem value="cuil">CUIL</SelectItem>
                              <SelectItem value="passport">Pasaporte</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex flex-col gap-2 flex-1 min-w-[250px]">
                          <Label className="text-xs text-neutrals-600">{t("beneficiaries.dialog.document_number")}</Label>
                          <Input
                            placeholder={t("beneficiaries.dialog.document_number_placeholder")}
                            value={formData.documentNumber}
                            onChange={(e) => setFormData({ ...formData, documentNumber: e.target.value })}
                          />
                        </div>
                        <div className="flex flex-col gap-2 flex-1 min-w-[250px]">
                          <Label className="text-xs text-neutrals-600">{t("beneficiaries.dialog.first_name")}</Label>
                          <Input
                            placeholder={t("beneficiaries.dialog.first_name_placeholder")}
                            value={formData.firstName}
                            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                          />
                        </div>
                        <div className="flex flex-col gap-2 flex-1 min-w-[250px]">
                          <Label className="text-xs text-neutrals-600">{t("beneficiaries.dialog.last_name")}</Label>
                          <Input
                            placeholder={t("beneficiaries.dialog.last_name_placeholder")}
                            value={formData.lastName}
                            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                          />
                        </div>
                        <div className="flex flex-col gap-2 flex-1 min-w-[250px]">
                          <Label className="text-xs text-neutrals-600">{t("beneficiaries.dialog.account_type")}</Label>
                          <Select
                            value={formData.accountType}
                            onValueChange={(value) => setFormData({ ...formData, accountType: value })}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder={t("beneficiaries.dialog.account_type_placeholder")} />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="savings">Caja de ahorro</SelectItem>
                              <SelectItem value="checking">Cuenta corriente</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex flex-col gap-2 flex-1 min-w-[250px]">
                          <Label className="text-xs text-neutrals-600">{t("beneficiaries.dialog.bank")}</Label>
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
                          <Label className="text-xs text-neutrals-600">{t("beneficiaries.dialog.account_number")}</Label>
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
                        className="bg-pay-500 hover:bg-pay-600 text-neutrals-50"
                        disabled={
                          !formData.documentType ||
                          !formData.documentNumber ||
                          !formData.firstName ||
                          !formData.lastName ||
                          !formData.accountType ||
                          !formData.bank ||
                          !formData.accountNumber
                        }
                        onClick={() => {
                          // TODO: Handle form submission
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
                        {t("beneficiaries.dialog.submit")}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                <Button variant="secondary">
                  {t("beneficiaries.export_button")}
                </Button>
              </div>
              <div className="basis-full lg:basis-0 lg:flex-1 lg:min-w-[500px]">
                <div className="relative">
                  <Icon symbol="search" className="absolute left-2 top-1/2 -translate-y-1/2 text-neutrals-400" />
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
              <TableRow className="bg-neutrals-25">
                <TableHead className="text-xs font-semibold text-neutrals-700">{t("beneficiaries.table.beneficiary")}</TableHead>
                <TableHead className="text-xs font-semibold text-neutrals-700">{t("beneficiaries.table.id_number")}</TableHead>
                <TableHead className="text-xs font-semibold text-neutrals-700">{t("beneficiaries.table.main_account")}</TableHead>
                <TableHead className="text-xs font-semibold text-neutrals-700">{t("beneficiaries.table.status")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {beneficiaries.map((beneficiary) => (
                <TableRow 
                  key={beneficiary.id}
                  onClick={() => handleRowClick(beneficiary.id)}
                  className="cursor-pointer hover:bg-neutrals-25"
                >
                  <TableCell className="text-sm text-neutrals-700">{beneficiary.name}</TableCell>
                  <TableCell className="text-sm text-neutrals-700">{beneficiary.idNumber}</TableCell>
                  <TableCell className="text-sm text-neutrals-700">{beneficiary.account}</TableCell>
                  <TableCell className="text-sm text-neutrals-700">
                    <Badge variant={beneficiary.status === "warning" ? "warning-medium" : "success-medium"}>
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
