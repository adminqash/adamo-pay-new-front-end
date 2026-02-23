import { useTranslation } from "react-i18next";
import { usePortalContainer } from "@adamosuiteservices/ui/use-portal-container";
import { createPortal } from "react-dom";
import { PageTitle } from "@/features/common/components/layout/page-title";
import { PageContainer } from "@/features/common/components/layout/page-container";
import { useBatches } from "../hooks/use-batches";
import { Button } from "@adamosuiteservices/ui/button";
import { Card } from "@adamosuiteservices/ui/card";
import { Icon } from "@adamosuiteservices/ui/icon";
import { Input } from "@adamosuiteservices/ui/input";
import { Badge } from "@adamosuiteservices/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@adamosuiteservices/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@adamosuiteservices/ui/table";
import type { BatchStatus } from "../entities/batch.entity";
import { useState } from "react";
import { useNavigate } from "react-router";

/**
 * batches page
 * 
 * displays batches list
 */
export const BatchesPage = () => {
  const { t } = useTranslation("batches");
  const { batches, totalCount } = useBatches();
  const navigate = useNavigate();

  const sidebarTopBarPortal = usePortalContainer("[data-slot='sidebar-top-bar-portal']");

  const [dateFilter, setDateFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  /**
   * check if any filter is active
   */
  const hasActiveFilters = dateFilter !== "all" || statusFilter !== "all";

  /**
   * reset all filters
   */
  const handleResetFilters = () => {
    setDateFilter("all");
    setStatusFilter("all");
  };

  /**
   * handle row click
   */
  const handleRowClick = (batchId: string) => {
    navigate(`/batches/${batchId}`);
  };

  /**
   * get badge variant based on batch status
   */
  const getStatusVariant = (status: BatchStatus): "default-medium" | "success-medium" | "warning-medium" | "destructive-medium" | "waiting-medium" => {
    switch (status) {
      case "completed":
        return "success-medium";
      case "processing":
        return "default-medium";
      case "pending":
      default:
        return "waiting-medium";
    }
  };

  /**
   * format currency amount
   */
  const formatAmount = (amount: number): string => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  /**
   * format transaction count
   */
  const formatTransactionCount = (count: number): string => {
    return new Intl.NumberFormat("es-AR").format(count);
  };

  return (
    <>
      {sidebarTopBarPortal && createPortal(
        <PageTitle>{t("batches.page_title")}</PageTitle>,
        sidebarTopBarPortal,
      )}
      <PageContainer className="bg-[#f8f8f9]">
        <Card className="p-6 border-[#e2e3e5]">
        {/* header section */}
        <div className="flex flex-col gap-6">
          {/* header + search */}
          <div className="flex flex-wrap items-center gap-6">
            {/* title + refresh button */}
            <div className="flex flex-1 items-center gap-4 min-w-[220px]">
              <Button
                variant="secondary"
              >
                <Icon symbol="refresh" weight={200} />
              </Button>
              <p className="text-sm font-semibold text-[#41454c]">
                {t("batches.header.count", { count: totalCount })}
              </p>
            </div>

            {/* action buttons */}
            <div className="flex items-center gap-4">
              <Button
                variant="default"
              >
                {t("batches.header.new_batch")}
              </Button>
              <Button
                variant="secondary"
              >
                {t("batches.header.export_data")}
              </Button>
            </div>

            {/* search input */}
            <div className="flex-1 min-w-[500px]">
              <div className="relative">
                <Icon
                  symbol="search"
                  className="absolute left-2 top-1/2 -translate-y-1/2 text-[#898f99]"
                />
                <Input
                  placeholder={t("batches.header.search_placeholder")}
                  className="h-10 pl-10 border-[#e2e3e5] text-sm"
                />
              </div>
            </div>
          </div>

          {/* filters */}
          <div className="flex flex-wrap items-center gap-6">
            {/* date filter */}
            <div className="flex-1 min-w-[240px]">
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="h-10 border-[#e2e3e5] w-full">
                  <div className="flex items-center gap-2">
                    <Icon symbol="calendar_today" className="text-[#898f99]" />
                    <SelectValue placeholder={t("batches.filters.date")} />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("batches.filters.all")}</SelectItem>
                  <SelectItem value="today">{t("batches.filters.today")}</SelectItem>
                  <SelectItem value="week">{t("batches.filters.week")}</SelectItem>
                  <SelectItem value="month">{t("batches.filters.month")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* status filter */}
            <div className="flex-1 min-w-[240px]">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-10 border-[#e2e3e5] w-full">
                  <div className="flex items-center gap-2">
                    <Icon symbol="circle" className="text-[#898f99]" />
                    <SelectValue placeholder={t("batches.filters.status")} />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("batches.filters.all_status")}</SelectItem>
                  <SelectItem value="pending">{t("batches.status.pending")}</SelectItem>
                  <SelectItem value="processing">{t("batches.status.processing")}</SelectItem>
                  <SelectItem value="completed">{t("batches.status.completed")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* reset filters button */}
            {hasActiveFilters && (
              <Button 
                variant="link" 
                onClick={handleResetFilters}
                className="h-10 text-[#0e9384] shrink-0"
              >
                {t("batches.filters.reset")}
              </Button>
            )}
          </div>
        </div>

        {/* table */}
        <Table className="rounded-2xl">
          <TableHeader>
              <TableRow>
                <TableHead className="text-xs font-semibold text-[#41454c] uppercase">
                  {t("batches.table.date")}
                </TableHead>
                <TableHead className="text-xs font-semibold text-[#41454c] uppercase">
                  {t("batches.table.batch_name")}
                </TableHead>
                <TableHead className="text-xs font-semibold text-[#41454c] uppercase">
                  {t("batches.table.transactions")}
                </TableHead>
                <TableHead className="text-xs font-semibold text-[#41454c] uppercase">
                  {t("batches.table.amount")}
                </TableHead>
                <TableHead className="text-xs font-semibold text-[#41454c] uppercase">
                  {t("batches.table.batch_id")}
                </TableHead>
                <TableHead className="text-xs font-semibold text-[#41454c] uppercase">
                  {t("batches.table.status")}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {batches.map((batch) => (
                <TableRow 
                  key={batch.id}
                  onClick={() => handleRowClick(batch.id)}
                  className="cursor-pointer hover:bg-[#f8f8f9]"
                >
                  <TableCell className="text-sm text-[#41454c]">
                    {batch.date}
                  </TableCell>
                  <TableCell className="text-sm text-[#41454c]">
                    {batch.name}
                  </TableCell>
                  <TableCell className="text-sm text-[#41454c]">
                    {formatTransactionCount(batch.transactions)}
                  </TableCell>
                  <TableCell className="text-sm text-[#41454c]">
                    {formatAmount(batch.amount)}
                  </TableCell>
                  <TableCell className="text-sm text-[#41454c]">
                    {batch.batchId}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(batch.status)}>
                      {t(`batches.status.${batch.status}`)}
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
};
