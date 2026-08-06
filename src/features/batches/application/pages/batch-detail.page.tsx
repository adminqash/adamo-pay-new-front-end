import { useTranslation } from "react-i18next";
import { usePortalContainer } from "@adamosuiteservices/ui/use-portal-container";
import { createPortal } from "react-dom";
import { PageContainer } from "@/features/common/components/layout/page-container";
import { useParams, Link, useNavigate } from "react-router";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
} from "@adamosuiteservices/ui/breadcrumb";
import { useBatchDetail } from "../hooks/use-batch-detail";
import { useBatchesRealtime } from "../hooks/use-batches-realtime";
import { useBatchTransactions } from "../hooks/use-batch-transactions";
import { useBatchTimeline } from "../hooks/use-batch-timeline";
import { buildBatchTransactionListParams } from "../utils/batch-filters.utils";
import { Button } from "@adamosuiteservices/ui/button";
import { Card } from "@adamosuiteservices/ui/card";
import { Icon } from "@adamosuiteservices/ui/icon";
import { Input } from "@adamosuiteservices/ui/input";
import { Badge } from "@adamosuiteservices/ui/badge";
import { Alert, AlertTitle, AlertDescription } from "@adamosuiteservices/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@adamosuiteservices/ui/table";
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
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetBody,
} from "@adamosuiteservices/ui/sheet";
import { Checkbox } from "@adamosuiteservices/ui/checkbox";
import { Label } from "@adamosuiteservices/ui/label";
import { Combobox } from "@adamosuiteservices/ui/combobox";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
} from "@adamosuiteservices/ui/pagination";
import {
  Timeline,
  TimelineItem,
  TimelineIndicator,
  TimelineContent,
  TimelineTitle,
  TimelineDescription,
  TimelineTime,
} from "@adamosuiteservices/ui/timeline";
import type { TransactionStatus } from "@/features/transactions/application/entities/transaction.entity";
import { useState, useMemo } from "react";

/**
 * batch detail page
 * 
 * displays detailed information about a specific batch
 */
export const BatchDetailPage = () => {
  const { t } = useTranslation(["batches", "transactions"]);
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { batch, isLoading: isBatchLoading } = useBatchDetail(id ?? "");
  useBatchesRealtime(id);

  const sidebarTopBarPortal = usePortalContainer("[data-slot='sidebar-top-bar-portal']");

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string[]>(["all"]);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15;

  const transactionListParams = useMemo(
    () => buildBatchTransactionListParams({
      statusFilter,
      search: searchQuery,
      page: currentPage,
      limit: pageSize,
    }),
    [statusFilter, searchQuery, currentPage],
  );

  const {
    transactions,
    totalCount,
    isLoading: isTransactionsLoading,
  } = useBatchTransactions(id, transactionListParams);

  // export dialog state
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [exportStatusFilter, setExportStatusFilter] = useState<string[]>(["all"]);
  const [exportFormatCSV, setExportFormatCSV] = useState(false);
  const [exportFormatPDF, setExportFormatPDF] = useState(false);

  // timeline dialog state
  const [isTimelineDialogOpen, setIsTimelineDialogOpen] = useState(false);
  const { timeline } = useBatchTimeline(id, isTimelineDialogOpen);

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  /**
   * format currency amount
   */
  const formatAmount = (amount: number): string => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  /**
   * get badge variant based on transaction status
   */
  const getStatusVariant = (status: TransactionStatus): "muted" | "success-medium" | "warning-medium" | "destructive-medium" => {
    switch (status) {
      case "paid":
        return "success-medium";
      case "validated":
        return "warning-medium";
      case "returned":
      case "rejected":
        return "destructive-medium";
      case "pending":
      case "in_review":
      default:
        return "muted";
    }
  };

  /**
   * handle transaction row click
   */
  const handleTransactionClick = (transactionId: string) => {
    navigate(`/batches/${id}/transactions/${transactionId}`);
  };

  if (isBatchLoading) {
    return null;
  }

  if (!batch) {
    return null;
  }

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
                <Link to="/batches">{t("batches.page_title")}</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbItem className="md:hidden">
              <button
                onClick={() => navigate("/batches")}
                className="flex h-9 w-9 items-center justify-center"
              >
                <BreadcrumbEllipsis />
              </button>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem className="min-w-0">
              <BreadcrumbPage className="truncate">{t("batches.detail.title")}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>,
        sidebarTopBarPortal,
      )}
      <PageContainer className="bg-neutrals-25">
        <Card className="flex flex-col gap-6 border-[#e2e3e5] p-6">
          {/* batch name + status */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className={`
                flex size-[44px] items-center justify-center rounded-full
                bg-[#f8f8f9]
              `}
              >
                <Icon symbol="text_snippet" className="text-[#41454c]" />
              </div>
              <p className="text-sm font-bold text-[#41454c]">{batch.name}</p>
            </div>
            <Badge
              variant="default-medium"
              className="h-8 bg-[#e5f3fa] px-2 text-sm leading-5"
            >
              Enviado
            </Badge>
          </div>

          {/* warning alert */}
          <Alert variant="warning" className="border-0">
            <Icon symbol="error" />
            <AlertTitle>{t("batches.detail.alert_title")}</AlertTitle>
            <AlertDescription>
              {t("batches.detail.alert_description")}
            </AlertDescription>
          </Alert>

          {/* action buttons */}
          <div className="flex items-center gap-6">
            <Button variant="default">
              {t("batches.detail.review_later")}
            </Button>
            <Button variant="link" onClick={() => setIsTimelineDialogOpen(true)}>
              <Icon symbol="hourglass" />
              {t("batches.detail.view_timeline")}
            </Button>
          </div>

          {/* info cards */}
          <div className="rounded-3xl bg-[#f8f8f9] p-6">
            <div className="flex flex-wrap gap-4">
              {/* fecha de lote */}
              <Card className="min-w-[230px] flex-1 rounded-3xl border-0 p-4">
                <div className="flex flex-col gap-2">
                  <p className="text-xs text-[#41454c]">{t("batches.detail.batch_date")}</p>
                  <div className="flex items-center gap-2 pl-2">
                    <Icon
                      symbol="calendar_today"
                      weight={200}
                      className="size-[24px] text-[#161719]"
                    />
                    <p className="text-sm font-semibold text-[#161719]">{batch.date}</p>
                  </div>
                </div>
              </Card>

              {/* id del lote */}
              <Card className="min-w-[230px] flex-1 rounded-3xl border-0 p-4">
                <div className="flex flex-col gap-2">
                  <p className="text-xs text-[#41454c]">{t("batches.detail.batch_id")}</p>
                  <div className="flex items-center gap-2 pl-2">
                    <Icon
                      symbol="confirmation_number"
                      weight={200}
                      className="size-[24px] text-[#161719]"
                    />
                    <p className="text-sm font-semibold text-[#161719]">{batch.batchId}</p>
                  </div>
                </div>
              </Card>

              {/* monto total */}
              <Card className="min-w-[230px] flex-1 rounded-3xl border-0 p-4">
                <div className="flex flex-col gap-2">
                  <p className="text-xs text-[#41454c]">{t("batches.detail.total_amount")}</p>
                  <div className="flex items-center gap-2 pl-2">
                    <Icon
                      symbol="paid"
                      weight={200}
                      className="size-[24px] text-[#161719]"
                    />
                    <p className="text-sm font-semibold text-[#161719]">{formatAmount(batch.amount)}</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {/* transactions table section */}
          <div className={`
            flex flex-col gap-6 rounded-3xl border border-[#e2e3e5] bg-white p-6
          `}
          >
            {/* header */}
            <div className="flex flex-wrap items-center gap-6">
            <div className="min-w-[220px] flex-1">
              <p className="text-sm font-semibold text-[#41454c]">
                {t("batches.detail.transactions_count", { count: batch.transactions })}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Dialog open={isExportDialogOpen} onOpenChange={setIsExportDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="secondary">
                    {t("batches.detail.export_data")}
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[640px]">
                  <DialogHeader>
                    <DialogTitle>{t("batches.export_dialog.title")}</DialogTitle>
                    <p className="mt-2 text-sm text-neutrals-700">{t("batches.export_dialog.description")}</p>
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
                            { value: "all", label: t("batches.filters.all_status") },
                            { value: "pending", label: t("transactions:transactions.status.pending") },
                            { value: "paid", label: t("transactions:transactions.status.paid") },
                            { value: "returned", label: t("transactions:transactions.status.returned") },
                            { value: "rejected", label: t("transactions:transactions.status.rejected") },
                          ]}
                          value={exportStatusFilter}
                          onValueChange={(value) => setExportStatusFilter(value as string[])}
                          labels={{
                            placeholder: t("batches.filters.status"),
                          }}
                          classNames={{
                            trigger: "h-10 w-full",
                          }}
                        />
                      </div>
                    </div>

                    {/* file type checkboxes */}
                    <div className="flex items-center gap-8">
                      <p className="text-sm text-neutrals-700">{t("batches.export_dialog.file_type_label")}</p>
                      <div className="flex items-center gap-3">
                        <Checkbox
                          id="detail-csv"
                          checked={exportFormatCSV}
                          onCheckedChange={(checked) => setExportFormatCSV(checked as boolean)}
                        />
                        <Label
                          htmlFor="detail-csv"
                          className="cursor-pointer text-sm text-neutrals-700"
                        >
                          {t("batches.export_dialog.csv_excel")}
                        </Label>
                      </div>
                      <div className="flex items-center gap-3">
                        <Checkbox
                          id="detail-pdf"
                          checked={exportFormatPDF}
                          onCheckedChange={(checked) => setExportFormatPDF(checked as boolean)}
                        />
                        <Label
                          htmlFor="detail-pdf"
                          className="cursor-pointer text-sm text-neutrals-700"
                        >
                          {t("batches.export_dialog.pdf")}
                        </Label>
                      </div>
                    </div>
                  </DialogBody>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant="secondary">
                        {t("batches.export_dialog.cancel")}
                      </Button>
                    </DialogClose>
                    <Button 
                      variant="default" 
                      disabled={!exportFormatCSV && !exportFormatPDF}
                    >
                      {t("batches.export_dialog.export")}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
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
                    absolute top-1/2 left-2 -translate-y-1/2 text-[#898f99]
                  `}
                />
                <Input
                  placeholder={t("batches.detail.search_placeholder")}
                  className="h-10 border-[#e2e3e5] pl-10 text-sm"
                  value={searchQuery}
                  onChange={(event) => {
                    setSearchQuery(event.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>
            </div>
            </div>

          {/* table */}
          <Table className="rounded-2xl">
            <TableHeader>
              <TableRow>
                <TableHead className={`
                  text-xs font-semibold text-[#41454c] uppercase
                `}
                >
                  {t("batches.detail.table.date")}
                </TableHead>
                <TableHead className={`
                  text-xs font-semibold text-[#41454c] uppercase
                `}
                >
                  {t("batches.detail.table.beneficiary")}
                </TableHead>
                <TableHead className={`
                  text-xs font-semibold text-[#41454c] uppercase
                `}
                >
                  {t("batches.detail.table.id_number")}
                </TableHead>
                <TableHead className={`
                  text-xs font-semibold text-[#41454c] uppercase
                `}
                >
                  {t("batches.detail.table.amount")}
                </TableHead>
                <TableHead className={`
                  text-xs font-semibold text-[#41454c] uppercase
                `}
                >
                  {t("batches.detail.table.reference")}
                </TableHead>
                <TableHead className={`
                  text-xs font-semibold text-[#41454c] uppercase
                `}
                >
                  {t("batches.detail.table.status")}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!isTransactionsLoading && transactions.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="py-8 text-center text-sm text-[#41454c]"
                  >
                    {t("batches.detail.no_transactions", { defaultValue: "No hay transacciones para este lote" })}
                  </TableCell>
                </TableRow>
              )}
              {transactions.map((transaction) => (
                <TableRow 
                  key={transaction.id}
                  onClick={() => handleTransactionClick(transaction.id)}
                  className={`
                    cursor-pointer transition-colors
                    hover:bg-[#f8f8f9]
                  `}
                >
                  <TableCell className="text-sm text-[#41454c]">
                    {transaction.date}
                  </TableCell>
                  <TableCell className="text-sm text-[#41454c]">
                    {transaction.beneficiary}
                  </TableCell>
                  <TableCell className="text-sm text-[#41454c]">
                    {transaction.idNumber}
                  </TableCell>
                  <TableCell className="text-sm text-[#41454c]">
                    {formatAmount(transaction.amount)}
                  </TableCell>
                  <TableCell className="text-sm text-[#41454c]">
                    {transaction.reference}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={getStatusVariant(transaction.status)}
                      className="h-8 px-2 text-sm leading-5"
                    >
                      {t(`transactions:transactions.status.${transaction.status}`)}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* pagination */}
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
                      Siguiente
                    </PaginationNext>
                  </PaginationItem>
                )}
            </PaginationContent>
          </Pagination>
          )}
          </div>
        </Card>
      </PageContainer>

      {/* Timeline Sheet */}
      <Sheet open={isTimelineDialogOpen} onOpenChange={setIsTimelineDialogOpen}>
        <SheetContent className="sm:w-[576px] sm:max-w-[576px]">
          <SheetHeader>
            <SheetTitle>{t("batches.detail.timeline_dialog.title")}</SheetTitle>
          </SheetHeader>
          <SheetBody className="overflow-y-auto">
            <Timeline>
              {timeline.length > 0 ? timeline.map((event) => (
                <TimelineItem key={event.id} status={event.status}>
                  <TimelineIndicator />
                  <TimelineContent>
                    <TimelineTitle>{event.title}</TimelineTitle>
                    {event.description && (
                      <TimelineDescription>{event.description}</TimelineDescription>
                    )}
                    <TimelineTime>{event.time}</TimelineTime>
                  </TimelineContent>
                </TimelineItem>
              )) : (
                <>
              <TimelineItem status="complete">
                <TimelineIndicator />
                <TimelineContent>
                  <TimelineTitle>Lote enviado exitosamente</TimelineTitle>
                  <TimelineDescription>
                    El lote ha sido procesado y enviado al banco para su ejecución.
                  </TimelineDescription>
                  <TimelineTime>15 Marzo 2026. 03:45 PM</TimelineTime>
                </TimelineContent>
              </TimelineItem>
              <TimelineItem status="complete">
                <TimelineIndicator />
                <TimelineContent>
                  <TimelineTitle>Validación completada</TimelineTitle>
                  <TimelineDescription>
                    Todas las transacciones del lote han sido validadas correctamente.
                  </TimelineDescription>
                  <TimelineTime>15 Marzo 2026. 03:30 PM</TimelineTime>
                </TimelineContent>
              </TimelineItem>
              <TimelineItem status="complete">
                <TimelineIndicator />
                <TimelineContent>
                  <TimelineTitle>Lote en revisión</TimelineTitle>
                  <TimelineDescription>
                    El sistema está revisando las transacciones incluidas en el lote.
                  </TimelineDescription>
                  <TimelineTime>15 Marzo 2026. 03:15 PM</TimelineTime>
                </TimelineContent>
              </TimelineItem>
              <TimelineItem status="complete">
                <TimelineIndicator />
                <TimelineContent>
                  <TimelineTitle>Lote creado</TimelineTitle>
                  <TimelineDescription>
                    El lote de pagos ha sido creado con {batch.transactions} transacciones.
                  </TimelineDescription>
                  <TimelineTime>15 Marzo 2026. 03:00 PM</TimelineTime>
                </TimelineContent>
              </TimelineItem>
                </>
              )}
            </Timeline>
          </SheetBody>
        </SheetContent>
      </Sheet>
    </>
  );
};
