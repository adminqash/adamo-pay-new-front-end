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
} from "@adamosuiteservices/ui/breadcrumb";
import { Card } from "@adamosuiteservices/ui/card";
import { Button } from "@adamosuiteservices/ui/button";
import { Input } from "@adamosuiteservices/ui/input";
import { Label } from "@adamosuiteservices/ui/label";
import { Icon } from "@adamosuiteservices/ui/icon";
import { Checkbox } from "@adamosuiteservices/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@adamosuiteservices/ui/select";

/**
 * create payment page
 * 
 * page for creating a new payment
 */
export const CreatePaymentPage = () => {
  const { t } = useTranslation("transactions");
  const navigate = useNavigate();
  const sidebarTopBarPortal = usePortalContainer("[data-slot='sidebar-top-bar-portal']");

  const [showManualForm, setShowManualForm] = useState(false);
  const [documentType, setDocumentType] = useState("");
  const [documentNumber, setDocumentNumber] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [accountType, setAccountType] = useState("");
  const [bank, setBank] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [saveBeneficiary, setSaveBeneficiary] = useState(true);

  // Mock beneficiaries data
  const beneficiaries = [
    { id: 1, name: "Juan Carlos Gutierrez Díaz", docType: "Cédula de ciudadanía", docNumber: "112.393.994" },
    { id: 2, name: "María Fernanda López", docType: "Cédula de ciudadanía", docNumber: "91.234.567" },
    { id: 3, name: "Andrés Felipe Martínez", docType: "Cédula de ciudadanía", docNumber: "53.456.789" },
  ];

  return (
    <>
      {sidebarTopBarPortal && createPortal(
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/transactions">{t("transactions.page_title")}</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{t("transactions.create_payment.breadcrumb_title")}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>,
        sidebarTopBarPortal,
      )}
      <PageContainer className="bg-[#f8f8f9]">
        {/* Stepper */}
        <div className="flex items-center gap-2 w-fit mb-6">
          {/* Step 1 - Active */}
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full border-2 border-[#0e9384] bg-white flex items-center justify-center shadow-[0px_0px_0px_4px_rgba(14,147,132,0.1)]">
              <div className="w-2 h-2 rounded-full bg-[#0e9384]" />
            </div>
            <p className="text-sm text-[#161719]">{t("transactions.create_payment.step_1")}</p>
          </div>

          {/* Separator */}
          <div className="w-6 h-px bg-[#e2e3e5]" />

          {/* Step 2 - Inactive */}
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full border border-[#e2e3e5] bg-white" />
            <p className="text-sm text-[#898f99]">{t("transactions.create_payment.step_2")}</p>
          </div>

          {/* Separator */}
          <div className="w-6 h-px bg-[#e2e3e5]" />

          {/* Step 3 - Inactive */}
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full border border-[#e2e3e5] bg-white" />
            <p className="text-sm text-[#898f99]">{t("transactions.create_payment.step_3")}</p>
          </div>
        </div>

        {/* Main Card */}
        <Card className="p-6 border-[#e2e3e5] flex flex-col gap-12">
          <div className="flex flex-col gap-6">
            {/* Description */}
            <p className="text-sm text-black">{t("transactions.create_payment.description")}</p>

            {/* Search Input */}
            <div className="relative">
              <Icon
                symbol="search"
                className="absolute left-2 top-1/2 -translate-y-1/2 text-[#898f99]"
              />
              <Input
                placeholder={t("transactions.create_payment.search_placeholder")}
                className="h-10 pl-10 border-[#e2e3e5] text-sm"
              />
            </div>

            {/* Beneficiary Cards */}
            <div className="flex flex-wrap gap-4">
              {beneficiaries.map((beneficiary) => (
                <Card
                  key={beneficiary.id}
                  className="flex-1 min-w-[250px] bg-[#f8f8f9] border-[#e2e3e5] p-4 cursor-pointer hover:bg-[#e2e3e5] transition-colors"
                >
                  <div className="flex flex-col gap-2">
                    <p className="text-xs text-[#41454c]">
                      {beneficiary.docType}: {beneficiary.docNumber}
                    </p>
                    <div className="flex items-center gap-2 pl-2">
                      <Icon symbol="account_circle" className="text-[#161719] size-6" />
                      <p className="text-sm font-semibold text-[#161719]">{beneficiary.name}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Toggle Manual Entry */}
            <Button
              variant="link"
              className="text-[#0e9384] h-6 px-0 w-fit"
              onClick={() => setShowManualForm(!showManualForm)}
            >
              {t("transactions.create_payment.toggle_manual")}
              <Icon symbol={showManualForm ? "expand_less" : "expand_more"} className="size-6" />
            </Button>

            {/* Manual Entry Form */}
            {showManualForm && (
              <Card className="p-4 bg-[#f8f8f9] border-0 flex flex-wrap gap-4">
                {/* Document Type */}
                <div className="flex-1 min-w-[400px] flex flex-col gap-2">
                  <Label htmlFor="documentType" className="text-xs text-[#41454c]">
                    {t("transactions.create_payment.document_type")}
                  </Label>
                  <Select value={documentType} onValueChange={setDocumentType}>
                    <SelectTrigger className="h-10 w-full">
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
                <div className="flex-1 min-w-[400px] flex flex-col gap-2">
                  <Label htmlFor="documentNumber" className="text-xs text-[#41454c]">
                    {t("transactions.create_payment.document_number")}
                  </Label>
                  <Input
                    id="documentNumber"
                    value={documentNumber}
                    onChange={(e) => setDocumentNumber(e.target.value)}
                    placeholder={t("transactions.create_payment.input_number_placeholder")}
                    className="h-10"
                  />
                </div>

                {/* First Name */}
                <div className="flex-1 min-w-[400px] flex flex-col gap-2">
                  <Label htmlFor="firstName" className="text-xs text-[#41454c]">
                    {t("transactions.create_payment.first_name")}
                  </Label>
                  <Input
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder={t("transactions.create_payment.input_name_placeholder")}
                    className="h-10"
                  />
                </div>

                {/* Last Name */}
                <div className="flex-1 min-w-[400px] flex flex-col gap-2">
                  <Label htmlFor="lastName" className="text-xs text-[#41454c]">
                    {t("transactions.create_payment.last_name")}
                  </Label>
                  <Input
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder={t("transactions.create_payment.input_lastname_placeholder")}
                    className="h-10"
                  />
                </div>

                {/* Account Type */}
                <div className="flex-1 min-w-[400px] flex flex-col gap-2">
                  <Label htmlFor="accountType" className="text-xs text-[#41454c]">
                    {t("transactions.create_payment.account_type")}
                  </Label>
                  <Select value={accountType} onValueChange={setAccountType}>
                    <SelectTrigger className="h-10 w-full">
                      <SelectValue placeholder={t("transactions.create_payment.select_placeholder")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="corriente">Corriente</SelectItem>
                      <SelectItem value="ahorros">Ahorros</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Bank */}
                <div className="flex-1 min-w-[400px] flex flex-col gap-2">
                  <Label htmlFor="bank" className="text-xs text-[#41454c]">
                    {t("transactions.create_payment.bank")}
                  </Label>
                  <Select value={bank} onValueChange={setBank}>
                    <SelectTrigger className="h-10 w-full">
                      <SelectValue placeholder={t("transactions.create_payment.select_placeholder")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="davivienda">Davivienda</SelectItem>
                      <SelectItem value="bancolombia">Bancolombia</SelectItem>
                      <SelectItem value="bbva">BBVA</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Account Number */}
                <div className="flex-1 min-w-[400px] flex flex-col gap-2">
                  <Label htmlFor="accountNumber" className="text-xs text-[#41454c]">
                    {t("transactions.create_payment.account_number")}
                  </Label>
                  <Input
                    id="accountNumber"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    placeholder={t("transactions.create_payment.input_number_placeholder")}
                    className="h-10"
                  />
                </div>

                {/* Save Beneficiary Checkbox */}
                <div className="flex-1 min-w-[400px] flex items-center gap-3 h-10">
                  <Checkbox
                    id="saveBeneficiary"
                    checked={saveBeneficiary}
                    onCheckedChange={(checked) => setSaveBeneficiary(checked as boolean)}
                  />
                  <Label htmlFor="saveBeneficiary" className="text-sm text-[#41454c] cursor-pointer">
                    {t("transactions.create_payment.save_beneficiary")}
                  </Label>
                </div>
              </Card>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-6">
            <Button variant="secondary" onClick={() => navigate("/transactions")}>
              {t("transactions.create_payment.cancel")}
            </Button>
            <Button variant="default">
              {t("transactions.create_payment.continue")}
            </Button>
          </div>
        </Card>
      </PageContainer>
    </>
  );
};
