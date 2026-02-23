import { useTranslation } from "react-i18next";
import { usePortalContainer } from "@adamosuiteservices/ui/use-portal-container";
import { createPortal } from "react-dom";
import { PageContainer } from "@/features/common/components/layout/page-container";
import { useParams, Link } from "react-router";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@adamosuiteservices/ui/breadcrumb";
import { Card } from "@adamosuiteservices/ui/card";
import { Badge } from "@adamosuiteservices/ui/badge";
import { Button } from "@adamosuiteservices/ui/button";
import { Icon } from "@adamosuiteservices/ui/icon";
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
import { Input } from "@adamosuiteservices/ui/input";
import { Label } from "@adamosuiteservices/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@adamosuiteservices/ui/select";
import { useTransactionDetail } from "../hooks/use-transaction-detail";
import { useState } from "react";

/**
 * transaction detail page
 * 
 * displays detailed information about a specific transaction within a batch
 */
export const TransactionDetailPage = () => {
  const { t } = useTranslation("batches");
  const { batchId, transactionId } = useParams<{ batchId: string; transactionId: string }>();
  const { transaction } = useTransactionDetail(transactionId || "1");

  const sidebarTopBarPortal = usePortalContainer("[data-slot='sidebar-top-bar-portal']");

  // dialog state
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [documentType, setDocumentType] = useState("");
  const [documentNumber, setDocumentNumber] = useState("");

  // payment dialog state
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [accountType, setAccountType] = useState("");
  const [bank, setBank] = useState("");
  const [accountNumber, setAccountNumber] = useState("");

  // reference dialog state
  const [isReferenceDialogOpen, setIsReferenceDialogOpen] = useState(false);
  const [referenceNumber, setReferenceNumber] = useState("");

  /**
   * format amount in COP currency
   */
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  /**
   * get status label
   */
  const getStatusLabel = () => {
    return t(`batches.transaction_detail.status.${transaction.status}`);
  };

  /**
   * risk level component
   */
  const RiskLevel = ({ level }: { level: "low" | "medium" | "high" }) => {
    const segments = [
      level === "low" || level === "medium" || level === "high",
      level === "medium" || level === "high",
      level === "high",
    ];

    return (
      <div className="flex gap-1 w-[100px] p-1 bg-[#f8f8f9] rounded-2xl">
        {segments.map((active, index) => (
          <div
            key={index}
            className={`flex-1 h-2 rounded-full border border-[#e2e3e5] ${
              active
                ? level === "high"
                  ? "bg-[#ef4444]"
                  : level === "medium"
                    ? "bg-[#f59e0b]"
                    : "bg-[#22c55e]"
                : "bg-white"
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <>
      {sidebarTopBarPortal && createPortal(
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/batches">{t("batches.page_title")}</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to={`/batches/${batchId}`}>{t("batches.detail.title")}</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Pago</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>,
        sidebarTopBarPortal,
      )}
      <PageContainer className="bg-[#f8f8f9]">
        {/* main content card */}
        <Card className="rounded-3xl p-6 flex flex-col gap-6">
          {/* payment status header */}
          <div className="flex items-center gap-4">
            <p className="text-sm text-[#41454c]">{t("batches.transaction_detail.payment_status")}</p>
            <Badge variant="default-medium" className="bg-[#f0f1f2]">
              {getStatusLabel()}
            </Badge>
          </div>

          {/* 2x2 grid of sections */}
          <div className="flex flex-wrap gap-4 w-full">
            {/* beneficiary section */}
            <div className="flex-1 min-w-[400px] bg-[#f8f8f9] rounded-3xl p-6 flex flex-col gap-6">
              {/* header */}
              <div className="flex items-center justify-between h-5">
                <p className="text-sm text-[#41454c]">{t("batches.transaction_detail.beneficiary.title")}</p>
                <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline">
                      <Icon symbol="edit" weight={200} />
                      {t("batches.transaction_detail.beneficiary.edit")}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[640px]">
                    <DialogHeader>
                      <DialogTitle>{t("batches.transaction_detail.edit_dialog.title")}</DialogTitle>
                    </DialogHeader>
                    <DialogBody className="flex flex-col gap-8">
                      {/* form fields */}
                      <div className="flex flex-wrap gap-4">
                        {/* first name */}
                        <div className="flex-1 min-w-[250px] flex flex-col gap-2">
                          <Label htmlFor="firstName" className="text-xs text-[#41454c]">
                            {t("batches.transaction_detail.edit_dialog.first_name")}
                          </Label>
                          <Input
                            id="firstName"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            placeholder="Juan Carlos"
                            className="h-10"
                          />
                        </div>

                        {/* last name */}
                        <div className="flex-1 min-w-[250px] flex flex-col gap-2">
                          <Label htmlFor="lastName" className="text-xs text-[#41454c]">
                            {t("batches.transaction_detail.edit_dialog.last_name")}
                          </Label>
                          <Input
                            id="lastName"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            placeholder="Gutierrez Díaz"
                            className="h-10"
                          />
                        </div>

                        {/* document type */}
                        <div className="flex-1 min-w-[250px] flex flex-col gap-2">
                          <Label htmlFor="documentType" className="text-xs text-[#41454c]">
                            {t("batches.transaction_detail.edit_dialog.document_type")}
                          </Label>
                          <Select value={documentType} onValueChange={setDocumentType}>
                            <SelectTrigger className="h-10 w-full">
                              <SelectValue placeholder="Cédula de ciudadanía" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="cc">Cédula de ciudadanía</SelectItem>
                              <SelectItem value="ce">Cédula de extranjería</SelectItem>
                              <SelectItem value="passport">Pasaporte</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {/* document number */}
                        <div className="flex-1 min-w-[250px] flex flex-col gap-2">
                          <Label htmlFor="documentNumber" className="text-xs text-[#41454c]">
                            {t("batches.transaction_detail.edit_dialog.document_number")}
                          </Label>
                          <Input
                            id="documentNumber"
                            value={documentNumber}
                            onChange={(e) => setDocumentNumber(e.target.value)}
                            placeholder="22.030.116"
                            className="h-10"
                          />
                        </div>
                      </div>
                    </DialogBody>
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button variant="secondary">
                          {t("batches.transaction_detail.edit_dialog.cancel")}
                        </Button>
                      </DialogClose>
                      <Button variant="default" disabled>
                        {t("batches.transaction_detail.edit_dialog.save")}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>

              {/* content card */}
              <Card className="rounded-3xl p-4 flex flex-col gap-6 border-0">
                {/* full name */}
                <div className="flex flex-col gap-2">
                  <p className="text-xs text-[#41454c]">{t("batches.transaction_detail.beneficiary.full_name")}</p>
                  <div className="flex items-center gap-2 pl-2">
                    <Icon symbol="account_circle" weight={200} className="text-[#161719] size-[24px]" />
                    <p className="text-sm font-semibold text-[#161719]">{transaction.beneficiary.fullName}</p>
                  </div>
                </div>

                {/* id type and number */}
                <div className="flex flex-col gap-2">
                  <p className="text-xs text-[#41454c]">{t("batches.transaction_detail.beneficiary.id_type")}</p>
                  <div className="flex items-center gap-2 pl-2">
                    <Icon symbol="contacts" weight={200} className="text-[#161719] size-[24px]" />
                    <p className="text-sm font-semibold text-[#161719]">
                      {transaction.beneficiary.idType}: {transaction.beneficiary.idNumber}
                    </p>
                  </div>
                </div>

                {/* status badge */}
                {!transaction.beneficiary.hasIssues && (
                  <Badge variant="default-medium" className="bg-[#e9f9ef]">
                    {t("batches.transaction_detail.beneficiary.no_issues")}
                  </Badge>
                )}
              </Card>
            </div>

            {/* payment information section */}
            <div className="flex-1 min-w-[400px] bg-[#f8f8f9] rounded-3xl p-6 flex flex-col gap-6">
              {/* header */}
              <div className="flex items-center justify-between h-5">
                <p className="text-sm text-[#41454c]">{t("batches.transaction_detail.payment_info.title")}</p>
                <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline">
                      <Icon symbol="edit" weight={200} />
                      {t("batches.transaction_detail.payment_info.edit")}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[640px]">
                    <DialogHeader>
                      <DialogTitle>{t("batches.transaction_detail.payment_edit_dialog.title")}</DialogTitle>
                    </DialogHeader>
                    <DialogBody className="flex flex-col gap-8">
                      {/* form fields */}
                      <div className="flex flex-wrap gap-4">
                        {/* payment amount */}
                        <div className="flex-1 min-w-[250px] flex flex-col gap-2">
                          <Label htmlFor="paymentAmount" className="text-xs text-[#41454c]">
                            {t("batches.transaction_detail.payment_edit_dialog.payment_amount")}
                          </Label>
                          <Input
                            id="paymentAmount"
                            value={paymentAmount}
                            onChange={(e) => setPaymentAmount(e.target.value)}
                            placeholder="2.331.876,00"
                            className="h-10"
                          />
                        </div>

                        {/* account type */}
                        <div className="flex-1 min-w-[250px] flex flex-col gap-2">
                          <Label htmlFor="accountType" className="text-xs text-[#41454c]">
                            {t("batches.transaction_detail.payment_edit_dialog.account_type")}
                          </Label>
                          <Select value={accountType} onValueChange={setAccountType}>
                            <SelectTrigger className="h-10 w-full">
                              <SelectValue placeholder="Corriente" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="corriente">Corriente</SelectItem>
                              <SelectItem value="ahorros">Ahorros</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {/* bank */}
                        <div className="flex-1 min-w-[250px] flex flex-col gap-2">
                          <Label htmlFor="bank" className="text-xs text-[#41454c]">
                            {t("batches.transaction_detail.payment_edit_dialog.bank")}
                          </Label>
                          <Select value={bank} onValueChange={setBank}>
                            <SelectTrigger className="h-10 w-full">
                              <SelectValue placeholder="Davivienda" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="davivienda">Davivienda</SelectItem>
                              <SelectItem value="bancolombia">Bancolombia</SelectItem>
                              <SelectItem value="bbva">BBVA</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {/* account number */}
                        <div className="flex-1 min-w-[250px] flex flex-col gap-2">
                          <Label htmlFor="accountNumber" className="text-xs text-[#41454c]">
                            {t("batches.transaction_detail.payment_edit_dialog.account_number")}
                          </Label>
                          <Input
                            id="accountNumber"
                            value={accountNumber}
                            onChange={(e) => setAccountNumber(e.target.value)}
                            placeholder="002-83336-90116"
                            className="h-10"
                          />
                        </div>

                        {/* link button */}
                        <Button variant="link" className="text-[#0e9384] h-6 px-0">
                          {t("batches.transaction_detail.payment_edit_dialog.select_saved_account")}
                        </Button>
                      </div>
                    </DialogBody>
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button variant="secondary">
                          {t("batches.transaction_detail.payment_edit_dialog.cancel")}
                        </Button>
                      </DialogClose>
                      <Button variant="default" disabled>
                        {t("batches.transaction_detail.payment_edit_dialog.save")}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>

              {/* content card */}
              <Card className="rounded-3xl p-4 flex flex-col gap-6 border-0">
                {/* amount */}
                <div className="flex flex-col gap-2">
                  <p className="text-xs text-[#41454c]">{t("batches.transaction_detail.payment_info.amount")}</p>
                  <div className="flex items-center gap-2 pl-2">
                    <Icon symbol="paid" weight={200} className="text-[#161719] size-[24px]" />
                    <p className="text-sm font-semibold text-[#161719]">{formatAmount(transaction.payment.amount)}</p>
                  </div>
                </div>

                {/* account type and number */}
                <div className="flex flex-col gap-2">
                  <p className="text-xs text-[#41454c]">{t("batches.transaction_detail.payment_info.account_type")}</p>
                  <div className="flex items-center gap-2 pl-2">
                    <Icon symbol="account_balance" weight={200} className="text-[#161719] size-[24px]" />
                    <p className="text-sm font-semibold text-[#161719]">
                      {transaction.payment.accountType}. {transaction.payment.bank} Nº {transaction.payment.accountNumber}
                    </p>
                  </div>
                </div>

                {/* warning badge */}
                {transaction.payment.accountMismatch && (
                  <Badge variant="default-medium" className="bg-[#fef5e7]">
                    {t("batches.transaction_detail.payment_info.account_mismatch")}
                  </Badge>
                )}
              </Card>
            </div>

            {/* payment reference section */}
            <div className="flex-1 min-w-[400px] bg-[#f8f8f9] rounded-3xl p-6 flex flex-col gap-6">
              {/* header */}
              <div className="flex items-center justify-between h-5">
                <p className="text-sm text-[#41454c]">{t("batches.transaction_detail.payment_reference.title")}</p>
                <Dialog open={isReferenceDialogOpen} onOpenChange={setIsReferenceDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline">
                      <Icon symbol="edit" weight={200} />
                      {t("batches.transaction_detail.payment_reference.edit")}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[640px]">
                    <DialogHeader>
                      <DialogTitle>{t("batches.transaction_detail.reference_edit_dialog.title")}</DialogTitle>
                    </DialogHeader>
                    <DialogBody className="flex flex-col gap-8">
                      {/* form field */}
                      <div className="flex flex-col gap-2">
                        <Label htmlFor="referenceNumber" className="text-xs text-[#41454c]">
                          {t("batches.transaction_detail.reference_edit_dialog.reference_number")}
                        </Label>
                        <Input
                          id="referenceNumber"
                          value={referenceNumber}
                          onChange={(e) => setReferenceNumber(e.target.value)}
                          placeholder={t("batches.transaction_detail.reference_edit_dialog.placeholder")}
                          className="h-10"
                        />
                      </div>
                    </DialogBody>
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button variant="secondary">
                          {t("batches.transaction_detail.reference_edit_dialog.cancel")}
                        </Button>
                      </DialogClose>
                      <Button variant="default" disabled>
                        {t("batches.transaction_detail.reference_edit_dialog.save")}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>

              {/* content card */}
              <Card className="rounded-3xl p-4 flex flex-col gap-6 border-0">
                {/* reference number */}
                <div className="flex flex-col gap-2">
                  <p className="text-xs text-[#41454c]">{t("batches.transaction_detail.payment_reference.reference_number")}</p>
                  <div className="flex items-center gap-2 pl-2">
                    <Icon symbol="confirmation_number" weight={200} className="text-[#161719] size-[24px]" />
                    <p className="text-sm font-semibold text-[#161719]">{transaction.reference.number || "--"}</p>
                  </div>
                </div>

                {/* warning badge */}
                {transaction.reference.notFound && (
                  <Badge variant="default-medium" className="bg-[#fef5e7]">
                    {t("batches.transaction_detail.payment_reference.not_found")}
                  </Badge>
                )}
              </Card>
            </div>

            {/* restrictive list section */}
            {transaction.restrictiveList && (
              <div className="flex-1 min-w-[400px] bg-[#e5f3fa] rounded-3xl p-6 flex flex-col gap-6">
                {/* header */}
                <div className="flex items-center gap-4 h-5">
                  <p className="text-sm text-[#41454c]">{t("batches.transaction_detail.restrictive_list.title")}</p>
                </div>

                {/* content card */}
                <Card className="rounded-3xl p-4 flex flex-col gap-6 border-0">
                  {/* list name */}
                  <div className="flex flex-col gap-2">
                    <p className="text-xs text-[#41454c]">{t("batches.transaction_detail.restrictive_list.list_name")}</p>
                    <div className="flex items-center gap-2 pl-2">
                      <Icon symbol="clarify" weight={200} className="text-[#161719] size-[24px]" />
                      <p className="text-sm font-semibold text-[#161719]">{transaction.restrictiveList.listName}</p>
                    </div>
                  </div>

                  {/* risk level and link */}
                  <div className="flex items-center justify-between">
                    <RiskLevel level={transaction.restrictiveList.riskLevel} />
                    <Button variant="link" className="text-[#0e9384]">
                      {t("batches.transaction_detail.restrictive_list.view_in_risk")}
                      <Icon symbol="open_in_new" weight={200} />
                    </Button>
                  </div>
                </Card>
              </div>
            )}
          </div>

          {/* action buttons */}
          <div className="flex flex-wrap items-center justify-between gap-12 mt-6">
            <div className="flex items-center gap-6">
              <Button variant="destructive-medium">
                {t("batches.transaction_detail.actions.reject")}
              </Button>
              <Button variant="default">
                <Icon symbol="check" weight={200} />
                {t("batches.transaction_detail.actions.approve")}
              </Button>
            </div>
            <Button variant="default">
              <Icon symbol="schedule" weight={200} />
              {t("batches.transaction_detail.actions.review_later")}
            </Button>
          </div>
        </Card>
      </PageContainer>
    </>
  );
};
