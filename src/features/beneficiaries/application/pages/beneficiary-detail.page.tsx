import { usePortalContainer } from "@adamosuiteservices/ui/use-portal-container";
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
import { Alert, AlertTitle, AlertDescription } from "@adamosuiteservices/ui/alert";
import { Icon } from "@adamosuiteservices/ui/icon";
import { Button } from "@adamosuiteservices/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@adamosuiteservices/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@adamosuiteservices/ui/table";
import { Input } from "@adamosuiteservices/ui/input";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
} from "@adamosuiteservices/ui/pagination";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import { Link, useParams } from "react-router";
import { PageContainer } from "@/features/common/components/layout/page-container";
import { CountryFlag } from "@/features/common/components/flags/country-flag";
import { CreditCard, type CreditCardData } from "../components/credit-card";
import { useState, useRef, useEffect } from "react";

export function BeneficiaryDetailPage() {
  const { t } = useTranslation("beneficiaries");
  const { beneficiaryId } = useParams();
  const [activeTab, setActiveTab] = useState("physical");
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftButton, setShowLeftButton] = useState(false);
  const [showRightButton, setShowRightButton] = useState(false);

  const sidebarTopBarPortal = usePortalContainer("[data-slot='sidebar-top-bar-portal']");

  // Handle scroll to check button visibility
  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setShowLeftButton(scrollLeft > 10);
      setShowRightButton(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  // Scroll left
  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: -334, // Card width (318px) + gap (16px)
        behavior: "smooth",
      });
    }
  };

  // Scroll right
  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: 334, // Card width (318px) + gap (16px)
        behavior: "smooth",
      });
    }
  };

  // TODO: Fetch beneficiary data using beneficiaryId from API
  console.log("Viewing beneficiary:", beneficiaryId);

  // Get badge variant based on transaction status
  const getTransactionStatusVariant = (status: string): "success-medium" | "waiting-medium" | "destructive-medium" => {
    switch (status) {
      case "completed":
        return "success-medium";
      case "pending":
        return "waiting-medium";
      case "failed":
      default:
        return "destructive-medium";
    }
  };

  // TODO: Replace with actual data from API
  const beneficiary = {
    fullName: "Mariana Lucía Fernandez",
    hasUpdates: true,
    hasPendingPayments: true,
    identificationDocument: {
      type: "Cédula de ciudadanía",
      number: "129.330.220",
    },
    bankAccount: {
      type: "Corriente",
      bank: "Davivienda",
      number: "002-83336-90116",
    },
    totalPaid: {
      amount: 12020000,
      currency: "COP",
      countryCode: "CO",
    },
  };

  // TODO: Replace with actual credit cards data from API
  const creditCards: CreditCardData[] = [
    {
      id: "1",
      name: "Nombre de la tarjeta",
      type: "physical",
      balance: 0,
      currency: "COP",
      cardNumber: "1234567890120121",
      status: "reported",
      gradient: "linear-gradient(147.63deg, rgb(14, 147, 132) 0%, rgb(159, 212, 206) 100%)",
    },
    {
      id: "2",
      name: "Tarjeta corporativa",
      type: "physical",
      balance: 1500000,
      currency: "COP",
      cardNumber: "9876543210984567",
      status: "active",
      gradient: "linear-gradient(147.63deg, rgb(14, 147, 132) 0%, rgb(159, 212, 206) 100%)",
    },
    {
      id: "3",
      name: "Tarjeta expirada",
      type: "physical",
      balance: 500000,
      currency: "COP",
      cardNumber: "5555444433332222",
      status: "expired",
      gradient: "linear-gradient(147.63deg, rgb(14, 147, 132) 0%, rgb(159, 212, 206) 100%)",
    },
    {
      id: "4",
      name: "Tarjeta temporal",
      type: "physical",
      balance: 250000,
      currency: "COP",
      cardNumber: "4444333322221111",
      status: "frozen",
      gradient: "linear-gradient(147.63deg, #0086C9 0%, #66B6DF 100%)",
    },
  ];

  // TODO: Replace with actual transactions data from API
  const transactions = [
    { id: "1", date: "10/12/2025", amount: 22350000, currency: "COP", reference: "JKL-5678", status: "pending" },
    { id: "2", date: "11/15/2025", amount: 18750000, currency: "COP", reference: "MNO-9012", status: "completed" },
    { id: "3", date: "12/20/2025", amount: 27900000, currency: "COP", reference: "PQR-3456", status: "pending" },
    { id: "4", date: "01/05/2026", amount: 15500000, currency: "COP", reference: "STU-7890", status: "failed" },
    { id: "5", date: "01/10/2026", amount: 20000000, currency: "COP", reference: "VWX-1234", status: "completed" },
    { id: "6", date: "01/15/2026", amount: 19500000, currency: "COP", reference: "YZA-5678", status: "completed" },
    { id: "7", date: "01/20/2026", amount: 23000000, currency: "COP", reference: "BCD-9012", status: "pending" },
    { id: "8", date: "01/25/2026", amount: 17800000, currency: "COP", reference: "EFG-3456", status: "completed" },
    { id: "9", date: "02/01/2026", amount: 21200000, currency: "COP", reference: "HIJ-7890", status: "failed" },
    { id: "10", date: "02/05/2026", amount: 25600000, currency: "COP", reference: "KLM-1234", status: "completed" },
    { id: "11", date: "02/10/2026", amount: 18900000, currency: "COP", reference: "NOP-5678", status: "pending" },
    { id: "12", date: "02/15/2026", amount: 22100000, currency: "COP", reference: "QRS-9012", status: "completed" },
    { id: "13", date: "02/18/2026", amount: 16700000, currency: "COP", reference: "TUV-3456", status: "pending" },
    { id: "14", date: "02/20/2026", amount: 24300000, currency: "COP", reference: "WXY-7890", status: "completed" },
    { id: "15", date: "02/23/2026", amount: 19800000, currency: "COP", reference: "ZAB-1234", status: "failed" },
  ];

  const filteredCards = creditCards.filter((card) => {
    if (activeTab === "physical") return card.type === "physical";
    if (activeTab === "virtual") return card.type === "virtual";
    return true;
  });

  // Check scroll buttons visibility on mount and when cards change
  useEffect(() => {
    const checkScrollButtons = () => {
      if (scrollContainerRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
        setShowLeftButton(scrollLeft > 10);
        setShowRightButton(scrollLeft < scrollWidth - clientWidth - 10);
      }
    };

    // Small delay to ensure layout is rendered
    const timer = setTimeout(checkScrollButtons, 100);
    return () => clearTimeout(timer);
  }, [filteredCards]);

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
              <BreadcrumbPage>{t("beneficiaries.detail.page_title")}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>,
        sidebarTopBarPortal,
      )}
      <PageContainer>
        <Card className="flex flex-col gap-6 border-neutral-200 p-6">
          {/* Header: Name + Badge */}
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex shrink-0 items-center gap-3">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-neutral-100">
                <Icon symbol="account_circle" weight={200} className="text-2xl" />
              </div>
              <p className="text-sm font-bold text-neutral-700">
                {beneficiary.fullName}
              </p>
            </div>
            {beneficiary.hasUpdates && (
              <Badge variant="warning-medium">
                {t("beneficiaries.detail.badge_with_news")}
              </Badge>
            )}
          </div>

          {/* Alert: Pending payments */}
          {beneficiary.hasPendingPayments && (
            <Alert variant="warning">
              <Icon symbol="error" />
              <AlertTitle>{t("beneficiaries.detail.alert_title")}</AlertTitle>
              <AlertDescription>
                {t("beneficiaries.detail.alert_description")}
              </AlertDescription>
            </Alert>
          )}

          {/* Beneficiary Information Card */}
          <Card className="flex flex-col gap-6 border-0 bg-neutral-50 p-6">
            {/* Title + Edit Button */}
            <div className="flex h-5 items-center justify-between">
              <p className="text-sm text-neutral-700">
                {t("beneficiaries.detail.info_title")}
              </p>
              <Button variant="outline" size="default">
                <Icon symbol="edit" />
                {t("beneficiaries.detail.edit_button")}
              </Button>
            </div>

            {/* Info Fields */}
            <Card className="flex flex-col gap-6 border-0 bg-white p-4">
              {/* Full Name Field */}
              <div className="flex h-16 items-center">
                <div className="flex flex-1 flex-col items-start justify-center gap-0">
                  <div className="flex w-full flex-col items-start gap-2">
                    <p className="text-xs text-neutral-500">
                      {t("beneficiaries.detail.full_name_label")}
                    </p>
                    <div className="flex h-10 w-full items-center justify-center gap-2 pl-2">
                      <div className="flex h-8 min-w-[230px] flex-1 items-center gap-2">
                        <Icon symbol="account_circle" weight={200} className="text-2xl text-neutral-700" />
                        <p className="text-sm font-semibold text-neutral-700">
                          Juan Carlos Gutierrez Díaz
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ID Type and Number Field */}
              <div className="flex h-16 items-center">
                <div className="flex flex-1 flex-col items-start justify-center gap-0">
                  <div className="flex w-full flex-col items-start gap-2">
                    <p className="text-xs text-neutral-500">
                      {t("beneficiaries.detail.id_type_label")}
                    </p>
                    <div className="flex h-10 w-full items-center justify-center gap-2 pl-2">
                      <div className="flex h-8 min-w-[230px] flex-1 items-center gap-2">
                        <Icon symbol="contacts" weight={200} className="text-2xl text-neutral-700" />
                        <p className="text-sm font-semibold text-neutral-700">
                          {beneficiary.identificationDocument.type}: {beneficiary.identificationDocument.number}
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
                    <p className="text-xs text-neutral-500">
                      {t("beneficiaries.detail.account_type_label")}
                    </p>
                    <div className="flex w-full flex-wrap items-center gap-2 pl-2">
                      <div className="flex h-8 min-w-[230px] flex-1 items-center gap-2">
                        <Icon symbol="account_balance" weight={200} className="text-2xl text-neutral-700" />
                        <p className="text-sm font-semibold text-neutral-700">
                          {beneficiary.bankAccount.type}. {beneficiary.bankAccount.bank} Nº {beneficiary.bankAccount.number}
                        </p>
                      </div>
                      <Button variant="link" size="sm" asChild>
                        <Link to={`/beneficiaries/${beneficiaryId}/bank-accounts`} className="flex items-center gap-2">
                          <span>{t("beneficiaries.detail.manage_accounts_link")}</span>
                          <Icon symbol="chevron_right" className="text-2xl" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </Card>

          {/* Total Paid Card */}
          <Card className="flex min-h-[96px] min-w-[230px] flex-col gap-0 border-0 bg-gradient-to-r from-[#e5f3fa] to-white p-4">
            <div className="flex min-h-[64px] items-center">
              <div className="flex flex-1 flex-col items-start justify-center gap-0">
                <div className="flex w-full flex-col items-start gap-2">
                  <p className="text-xs text-neutral-500">
                    {t("beneficiaries.detail.total_paid_label")}
                  </p>
                  <div className="flex w-full flex-wrap items-center gap-4 pl-2">
                    <div className="flex h-8 flex-1 items-center gap-2">
                      <CountryFlag countryCode={beneficiary.totalPaid.countryCode} className="size-6" />
                      <p className="text-sm font-semibold text-neutral-700">
                        ${beneficiary.totalPaid.amount.toLocaleString("es-CO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {beneficiary.totalPaid.currency}
                      </p>
                    </div>
                    <Button variant="secondary" size="default">
                      {t("beneficiaries.detail.quick_payment_button")}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Credit Cards Section */}
          <Card className="flex flex-col gap-6 border-0 bg-neutral-50 p-6">
            {/* Title + Tabs + Create Button */}
            <div className="flex flex-wrap items-center justify-between gap-y-6">
              <div className="flex items-center gap-8">
                <p className="text-sm text-neutral-700">
                  {t("beneficiaries.detail.cards_title")}
                </p>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList>
                    <TabsTrigger value="physical">
                      {t("beneficiaries.detail.cards_tab_physical")}
                    </TabsTrigger>
                    <TabsTrigger value="virtual">
                      {t("beneficiaries.detail.cards_tab_virtual")}
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
              <Button variant="link" size="sm" className="h-6 p-0">
                <Icon symbol="add" className="text-2xl" />
                {t("beneficiaries.detail.create_card_button")}
              </Button>
            </div>

            {/* Credit Cards Grid */}
            <div className="relative">
              {/* Left gradient overlay */}
              {showLeftButton && (
                <div className="pointer-events-none absolute left-0 top-0 z-[15] h-full w-[72px] bg-gradient-to-r from-neutral-50 to-transparent" />
              )}
              
              {/* Right gradient overlay */}
              {showRightButton && (
                <div className="pointer-events-none absolute right-0 top-0 z-[15] h-full w-[72px] bg-gradient-to-l from-neutral-50 to-transparent" />
              )}

              {/* Scroll container - horizontal scroll with snap */}
              <div
                ref={scrollContainerRef}
                onScroll={handleScroll}
                className="flex items-start gap-4 overflow-x-auto scroll-smooth scrollbar-hide snap-x snap-mandatory"
                style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
              >
                {filteredCards.map((card, index) => (
                  <div
                    key={card.id}
                    className={`group relative shrink-0 transition-all ${index === 0 ? "snap-start" : index === filteredCards.length - 1 ? "snap-end mr-[72px]" : "snap-center"}`}
                    style={{ zIndex: index + 1 }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.zIndex = "10";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.zIndex = (index + 1).toString();
                    }}
                  >
                    <CreditCard card={card} />
                  </div>
                ))}
              </div>

              {/* Left navigation button */}
              {showLeftButton && (
                <Button
                  onClick={scrollLeft}
                  variant="outline"
                  size="icon"
                  className="absolute left-0 top-1/2 z-20 hidden -translate-y-1/2 rounded-xl md:flex"
                  aria-label="Scroll left"
                >
                  <Icon symbol="chevron_left" className="text-2xl" />
                </Button>
              )}

              {/* Right navigation button */}
              {showRightButton && (
                <Button
                  onClick={scrollRight}
                  variant="outline"
                  size="icon"
                  className="absolute right-0 top-1/2 z-20 hidden -translate-y-1/2 rounded-xl md:flex"
                  aria-label="Scroll right"
                >
                  <Icon symbol="chevron_right" className="text-2xl" />
                </Button>
              )}
            </div>
          </Card>

          {/* Transactions Section */}
          <div className="bg-white border border-[#e2e3e5] rounded-3xl p-6 flex flex-col gap-6">
            {/* Header + Search */}
            <div className="flex flex-wrap items-center gap-6">
              <div className="flex min-w-[220px] flex-1 items-center gap-4">
                <p className="text-sm font-semibold text-neutral-700">
                  {t("beneficiaries.detail.transactions_title", { count: 719 })}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <Button variant="secondary" size="default">
                  {t("beneficiaries.detail.transactions_export_button")}
                </Button>
              </div>
              <div className="basis-full lg:basis-0 lg:flex-1 lg:min-w-[500px]">
                <div className="relative">
                  <Icon
                    symbol="search"
                    className="absolute left-2 top-1/2 -translate-y-1/2 text-[#898f99]"
                  />
                  <Input
                    placeholder={t("beneficiaries.detail.transactions_search_placeholder")}
                    className="h-10 pl-10 border-[#e2e3e5] text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Transactions Table */}
            <Table className="rounded-2xl">
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs font-semibold text-[#41454c] uppercase">
                    {t("beneficiaries.detail.transactions_table.date")}
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-[#41454c] uppercase">
                    {t("beneficiaries.detail.transactions_table.amount")}
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-[#41454c] uppercase">
                    {t("beneficiaries.detail.transactions_table.reference")}
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-[#41454c] uppercase">
                    {t("beneficiaries.detail.transactions_table.status")}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((transaction) => (
                  <TableRow
                    key={transaction.id}
                    className="cursor-pointer hover:bg-[#f8f8f9] transition-colors"
                  >
                    <TableCell className="text-sm text-[#41454c]">
                      {transaction.date}
                    </TableCell>
                    <TableCell className="text-sm text-[#41454c]">
                      ${transaction.amount.toLocaleString("es-CO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell className="text-sm text-[#41454c]">
                      {transaction.reference}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getTransactionStatusVariant(transaction.status)}>
                        {t(`beneficiaries.detail.transactions_status.${transaction.status}`)}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Pagination */}
            <Pagination className="justify-start">
              <PaginationContent>
                <PaginationItem>
                  <PaginationLink isActive>1</PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink href="#">2</PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink href="#">3</PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink href="#">4</PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink href="#">13</PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationNext href="#">{t("beneficiaries.detail.transactions_pagination.next")}</PaginationNext>
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </Card>
      </PageContainer>
    </>
  );
}
