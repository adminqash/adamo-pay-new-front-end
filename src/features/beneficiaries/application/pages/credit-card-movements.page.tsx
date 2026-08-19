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
import { Card } from "@adamosuiteservices/ui/card";
import { Button } from "@adamosuiteservices/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@adamosuiteservices/ui/input-group";
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
import { Checkbox } from "@adamosuiteservices/ui/checkbox";
import { Label } from "@adamosuiteservices/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@adamosuiteservices/ui/table";
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
import { useCountry } from "@/features/common/contexts/use-country";
import { Link, useParams, useLocation, useNavigate } from "react-router";
import { useState, useEffect } from "react";
import { PageContainer } from "@/features/common/components/layout/page-container";
import { PermissionGate } from "@/features/auth/application/components/permission-gate";
import { EXPORT_DATA } from "@/features/auth/domain/permission-ui";
import { CompactCreditCard, type CreditCardData } from "../components/compact-credit-card";

/**
 * credit card movements page
 * 
 * page for viewing credit card movements and details
 */
export function CreditCardMovementsPage() {
  const { t } = useTranslation("beneficiaries");
  const { currencyUpper, locale: moneyLocale } = useCountry();
  const { beneficiaryId, cardId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const sidebarTopBarPortal = usePortalContainer("[data-slot='sidebar-top-bar-portal']");

  // export dialog state
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [exportFormatCSV, setExportFormatCSV] = useState(false);
  const [exportFormatPDF, setExportFormatPDF] = useState(false);

  // card state - mutable to reflect changes
  const [cardData, setCardData] = useState<CreditCardData | null>(null);

  // TODO: Fetch credit card data using beneficiaryId and cardId from API
  console.log("Viewing card movements:", { beneficiaryId, cardId });

  // Get card from navigation state or use fallback
  const cardFromState = location.state?.card as CreditCardData | undefined;

  // Fallback card data if no state is passed
  const fallbackCard: CreditCardData = {
    id: cardId || "1",
    name: "Nombre de la tarjeta",
    type: "physical",
    balance: 0,
    currency: currencyUpper,
    cardNumber: "1234567890120121",
    status: "active",
    gradient: "linear-gradient(147.63deg, rgb(14, 147, 132) 0%, rgb(159, 212, 206) 100%)",
  };

  // Use card from state or fallback
  const card = cardFromState || fallbackCard;

  // Initialize card data state on mount
  useEffect(() => {
    if (!cardData) {
      setCardData(card);
    }
  }, [card, cardData]);

  /**
   * handle card status update
   */
  const handleUpdateCardStatus = (cardId: string, newStatus: CreditCardData["status"]) => {
    if (cardData && cardData.id === cardId) {
      setCardData({ ...cardData, status: newStatus });
    }
  };

  // TODO: Replace with actual movements data from API
  const movements = [
    { id: "1", date: "10/12/2025", amount: -22350000, type: "debit" },
    { id: "2", date: "11/15/2025", amount: -18750000, type: "debit" },
    { id: "3", date: "12/01/2025", amount: -27900000, type: "debit" },
    { id: "4", date: "01/20/2026", amount: -15500000, type: "debit" },
    { id: "5", date: "02/15/2026", amount: 20000000, type: "credit" },
    { id: "6", date: "03/10/2026", amount: -23750000, type: "debit" },
    { id: "7", date: "04/05/2026", amount: -19300000, type: "debit" },
    { id: "8", date: "05/25/2026", amount: -25500000, type: "debit" },
    { id: "9", date: "06/30/2026", amount: 30000000, type: "credit" },
    { id: "10", date: "07/18/2026", amount: -28150000, type: "debit" },
    { id: "11", date: "08/12/2026", amount: -16800000, type: "debit" },
    { id: "12", date: "09/09/2026", amount: 22900000, type: "credit" },
    { id: "13", date: "10/30/2026", amount: 21250000, type: "credit" },
    { id: "14", date: "11/21/2026", amount: -24900000, type: "debit" },
    { id: "15", date: "12/14/2026", amount: -29000000, type: "debit" },
  ];

  const formatAmount = (amount: number) => {
    const formatted = Math.abs(amount).toLocaleString(moneyLocale, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    return amount < 0 ? `-$${formatted}` : `$${formatted}`;
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
              <BreadcrumbPage className="truncate">{t("beneficiaries.credit_card_movements.page_title")}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>,
        sidebarTopBarPortal,
      )}
      <PageContainer className="bg-subtle">
        <div className="flex flex-col gap-4">
          {/* Compact Card Header */}
          <CompactCreditCard card={cardData || card} onUpdateCardStatus={handleUpdateCardStatus} />

          {/* Movements Table Card */}
          <Card className="flex flex-col gap-6 p-6">
            {/* Header + Search */}
            <div className="flex flex-wrap items-center gap-6">
              <div className="flex min-w-[220px] flex-1 items-center gap-4">
                <p className="text-sm font-semibold text-foreground">
                  {t("beneficiaries.credit_card_movements.movements_count", { count: 719 })}
                </p>
              </div>
              <div className="flex items-center gap-4">
              <PermissionGate permission={[...EXPORT_DATA]} mode="any">
              <Dialog open={isExportDialogOpen} onOpenChange={setIsExportDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="secondary" size="default">
                    {t("beneficiaries.credit_card_movements.export_button")}
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[640px]">
                  <DialogHeader>
                    <DialogTitle>{t("beneficiaries.credit_card_movements.export_dialog.title")}</DialogTitle>
                    <p className="text-sm text-foreground mt-2">{t("beneficiaries.credit_card_movements.export_dialog.description")}</p>
                  </DialogHeader>
                  <DialogBody className="flex flex-col gap-8">
                    {/* file type checkboxes */}
                    <div className="flex items-center gap-8">
                      <p className="text-sm text-foreground">{t("beneficiaries.credit_card_movements.export_dialog.file_type_label")}</p>
                      <div className="flex items-center gap-3">
                        <Checkbox
                          id="csv"
                          checked={exportFormatCSV}
                          onCheckedChange={(checked) => setExportFormatCSV(checked as boolean)}
                        />
                        <Label htmlFor="csv" className="text-sm cursor-pointer">
                          {t("beneficiaries.credit_card_movements.export_dialog.csv_excel")}
                        </Label>
                      </div>
                      <div className="flex items-center gap-3">
                        <Checkbox
                          id="pdf"
                          checked={exportFormatPDF}
                          onCheckedChange={(checked) => setExportFormatPDF(checked as boolean)}
                        />
                        <Label htmlFor="pdf" className="text-sm cursor-pointer">
                          {t("beneficiaries.credit_card_movements.export_dialog.pdf")}
                        </Label>
                      </div>
                    </div>
                  </DialogBody>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant="secondary">
                        {t("beneficiaries.credit_card_movements.export_dialog.cancel")}
                      </Button>
                    </DialogClose>
                    <Button 
                      variant="default" 
                      disabled={!exportFormatCSV && !exportFormatPDF}
                    >
                      {t("beneficiaries.credit_card_movements.export_dialog.export")}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              </PermissionGate>
            </div>
              <div className="min-w-[500px] basis-full lg:basis-0 lg:flex-1">
                <InputGroup>
                  <InputGroupAddon>
                    <Icon symbol="search" />
                  </InputGroupAddon>
                  <InputGroupInput
                    placeholder={t("beneficiaries.credit_card_movements.search_placeholder")}
                  />
                </InputGroup>
              </div>
            </div>
            {/* Table */}
            <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  {t("beneficiaries.credit_card_movements.table.date")}
                </TableHead>
                <TableHead>
                  {t("beneficiaries.credit_card_movements.table.amount")}
                </TableHead>
                <TableHead>
                  {t("beneficiaries.credit_card_movements.table.type")}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {movements.map((movement) => (
                <TableRow
                  key={movement.id}
                >
                  <TableCell>{movement.date}</TableCell>
                  <TableCell>
                    {formatAmount(movement.amount)}
                  </TableCell>
                  <TableCell>
                    {t(`beneficiaries.credit_card_movements.movement_types.${movement.type}`)}
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
                <PaginationNext href="#">
                  {t("beneficiaries.credit_card_movements.pagination.next")}
                </PaginationNext>
              </PaginationItem>
            </PaginationContent>
            </Pagination>
          </Card>
        </div>
      </PageContainer>
    </>
  );
}
