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
} from "@adamosuiteservices/ui/breadcrumb";
import { useBatchDetail } from "../hooks/use-batch-detail";
import { useTransactions } from "@/features/transactions/application/hooks/use-transactions";
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
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
} from "@adamosuiteservices/ui/pagination";
import type { TransactionStatus } from "@/features/transactions/application/entities/transaction.entity";

/**
 * batch detail page
 * 
 * displays detailed information about a specific batch
 */
export const BatchDetailPage = () => {
  const { t } = useTranslation("batches");
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { batch } = useBatchDetail(id || "1");
  const { transactions } = useTransactions();

  const sidebarTopBarPortal = usePortalContainer("[data-slot='sidebar-top-bar-portal']");

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
  const getStatusVariant = (status: TransactionStatus): "default-medium" | "success-medium" | "warning-medium" | "destructive-medium" | "waiting-medium" => {
    switch (status) {
      case "paid":
        return "success-medium";
      case "returned":
        return "warning-medium";
      case "rejected":
        return "destructive-medium";
      case "pending":
      default:
        return "waiting-medium";
    }
  };

  /**
   * handle transaction row click
   */
  const handleTransactionClick = (transactionId: string) => {
    navigate(`/batches/${id}/transactions/${transactionId}`);
  };

  if (!batch) {
    return null;
  }

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
              <BreadcrumbPage>{t("batches.detail.title")}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>,
        sidebarTopBarPortal,
      )}
      <PageContainer className="bg-[#f8f8f9]">
        <Card className="p-6 border-[#e2e3e5] flex flex-col gap-6">
          {/* batch name + status */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="bg-[#f8f8f9] flex items-center justify-center rounded-full size-[44px]">
                <Icon symbol="text_snippet" className="text-[#41454c]" />
              </div>
              <p className="text-sm font-bold text-[#41454c]">{batch.name}</p>
            </div>
            <Badge variant="default-medium" className="bg-[#e5f3fa]">
              Enviado
            </Badge>
          </div>

          {/* warning alert */}
          <Alert variant="warning">
            <Icon symbol="warning" />
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
            <Button variant="link">
              <Icon symbol="hourglass" />
              {t("batches.detail.view_timeline")}
            </Button>
          </div>

          {/* info cards */}
          <div className="bg-[#f8f8f9] rounded-3xl p-6">
            <div className="flex flex-wrap gap-4">
              {/* fecha de lote */}
              <Card className="flex-1 min-w-[230px] p-4 border-0 rounded-3xl">
                <div className="flex flex-col gap-2">
                  <p className="text-xs text-[#41454c]">{t("batches.detail.batch_date")}</p>
                  <div className="flex items-center gap-2 pl-2">
                    <Icon symbol="calendar_today" weight={200} className="text-[#161719] size-[24px]" />
                    <p className="text-sm font-semibold text-[#161719]">{batch.date}</p>
                  </div>
                </div>
              </Card>

              {/* id del lote */}
              <Card className="flex-1 min-w-[230px] p-4 border-0 rounded-3xl">
                <div className="flex flex-col gap-2">
                  <p className="text-xs text-[#41454c]">{t("batches.detail.batch_id")}</p>
                  <div className="flex items-center gap-2 pl-2">
                    <Icon symbol="confirmation_number" weight={200} className="text-[#161719] size-[24px]" />
                    <p className="text-sm font-semibold text-[#161719]">{batch.batchId}</p>
                  </div>
                </div>
              </Card>

              {/* monto total */}
              <Card className="flex-1 min-w-[230px] p-4 border-0 rounded-3xl">
                <div className="flex flex-col gap-2">
                  <p className="text-xs text-[#41454c]">{t("batches.detail.total_amount")}</p>
                  <div className="flex items-center gap-2 pl-2">
                    <Icon symbol="paid" weight={200} className="text-[#161719] size-[24px]" />
                    <p className="text-sm font-semibold text-[#161719]">{formatAmount(batch.amount)}</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {/* transactions table section */}
          <div className="bg-white border border-[#e2e3e5] rounded-3xl p-6 flex flex-col gap-6">
            {/* header */}
            <div className="flex flex-wrap items-center gap-6">
            <div className="flex-1 min-w-[220px]">
              <p className="text-sm font-semibold text-[#41454c]">
                {t("batches.detail.transactions_count", { count: batch.transactions })}
              </p>
            </div>
            <div className="flex gap-4 items-center">
              <Button variant="secondary">
                {t("batches.detail.export_data")}
              </Button>
            </div>
            <div className="basis-full lg:basis-0 lg:flex-1 lg:min-w-[500px]">
              <div className="relative">
                <Icon
                  symbol="search"
                  className="absolute left-2 top-1/2 -translate-y-1/2 text-[#898f99]"
                />
                <Input
                  placeholder={t("batches.detail.search_placeholder")}
                  className="h-10 pl-10 border-[#e2e3e5] text-sm"
                />
              </div>
            </div>
          </div>

          {/* table */}
          <Table className="rounded-2xl">
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs font-semibold text-[#41454c] uppercase">
                  FECHA
                </TableHead>
                <TableHead className="text-xs font-semibold text-[#41454c] uppercase">
                  BENEFICIARIO
                </TableHead>
                <TableHead className="text-xs font-semibold text-[#41454c] uppercase">
                  Nº DE ID
                </TableHead>
                <TableHead className="text-xs font-semibold text-[#41454c] uppercase">
                  MONTO
                </TableHead>
                <TableHead className="text-xs font-semibold text-[#41454c] uppercase">
                  REFERENCIA
                </TableHead>
                <TableHead className="text-xs font-semibold text-[#41454c] uppercase">
                  ESTADO
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.slice(0, 15).map((transaction) => (
                <TableRow 
                  key={transaction.id}
                  onClick={() => handleTransactionClick(transaction.id)}
                  className="cursor-pointer hover:bg-[#f8f8f9] transition-colors"
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
                    <Badge variant={getStatusVariant(transaction.status)}>
                      Pendiente
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* pagination */}
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
                  <PaginationNext href="#">Siguiente</PaginationNext>
                </PaginationItem>
              </PaginationContent>
            </Pagination>
        </div>
      </Card>
      </PageContainer>
    </>
  );
};
