import { usePortalContainer } from "@adamosuiteservices/ui/use-portal-container";
import { Card } from "@adamosuiteservices/ui/card";
import { Input } from "@adamosuiteservices/ui/input";
import { Icon } from "@adamosuiteservices/ui/icon";
import { Button } from "@adamosuiteservices/ui/button";
import { ToastManager } from "@adamosuiteservices/ui/toaster";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@adamosuiteservices/ui/table";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { PageContainer } from "@/features/common/components/layout/page-container";
import { PageTitle } from "@/features/common/components/layout/page-title";
import { StickyFilterHeader } from "@/features/common/components/layout/sticky-filter-header";
import { DeleteReportDialog } from "../components/delete-report-dialog";

interface Report {
  id: string;
  date: string;
  name: string;
  type: string;
}

export function ReportsPage() {
  const { t } = useTranslation(["reports"]);

  const sidebarTopBarPortal = usePortalContainer("[data-slot='sidebar-top-bar-portal']");

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  // reports state - mutable to reflect changes
  const [reports, setReports] = useState<Report[]>([
    { id: "1", date: "10/12/2025", name: "Reporte de transacciones Felipe", type: "Transacciones" },
    { id: "2", date: "11/15/2025", name: "Reporte de lotes Mayo 25", type: "Lotes" },
    { id: "3", date: "12/01/2025", name: "Reporte de transacciones Juan", type: "Transacciones" },
    { id: "4", date: "01/20/2026", name: "Reporte Technova solutions", type: "Beneficiario" },
    { id: "5", date: "02/15/2026", name: "Reporte de lotes Junio 25", type: "Lotes" },
    { id: "6", date: "03/10/2026", name: "Reporte de transacciones Maria", type: "Transacciones" },
    { id: "7", date: "04/05/2026", name: "Reporte de lotes Septiembre", type: "Lotes" },
    { id: "8", date: "05/25/2026", name: "Reporte de lotes Diciembre", type: "Lotes" },
    { id: "9", date: "06/30/2026", name: "Reporte de lotes Diciembre", type: "Transacciones" },
  ]);

  const handleDownload = (reportId: string) => {
    // TODO: implement download logic
    console.log("Download report:", reportId);
  };

  const handleDelete = (report: Report) => {
    setSelectedReport(report);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (selectedReport) {
      // Remove report from state
      setReports((prevReports) => 
        prevReports.filter((report) => report.id !== selectedReport.id)
      );
      
      // Show success toast
      ToastManager.show({
        message: t("reports:messages.delete_success"),
        variant: "success",
      });
      
      // Reset selected report
      setSelectedReport(null);
    }
  };

  return (
    <>
      {sidebarTopBarPortal && createPortal(
        <PageTitle>{t("reports:page_title")}</PageTitle>,
        sidebarTopBarPortal,
      )}
      <PageContainer>
        <Card className="p-6 border overflow-visible flex flex-col gap-0">
          <StickyFilterHeader className="flex flex-col gap-0">
          {/* header + search */}
          <div className="flex flex-wrap items-center gap-6">
            {/* title */}
            <div className="flex flex-1 items-center gap-4 min-w-[220px]">
              <p className="text-sm font-semibold text-neutral-700">
                {t("reports:header.count", { count: reports.length })}
              </p>
            </div>

            {/* search input */}
            <div className="flex-1 min-w-[500px]">
              <div className="relative">
                <Icon
                  symbol="search"
                  className="absolute left-2 top-1/2 -translate-y-1/2 text-neutral-500"
                />
                <Input
                  placeholder={t("reports:header.search_placeholder")}
                  className="h-10 pl-10 text-sm"
                />
              </div>
            </div>
          </div>
          </StickyFilterHeader>

          {/* table */}
          <div className="mt-6">
            <Table className="rounded-2xl">
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs font-semibold text-neutral-700 uppercase">
                  {t("reports:table.date")}
                </TableHead>
                <TableHead className="text-xs font-semibold text-neutral-700 uppercase">
                  {t("reports:table.report_name")}
                </TableHead>
                <TableHead className="text-xs font-semibold text-neutral-700 uppercase">
                  {t("reports:table.report_type")}
                </TableHead>
                <TableHead className="text-xs font-semibold text-neutral-700 uppercase">
                  {t("reports:table.actions")}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reports.map((report) => (
                <TableRow key={report.id}>
                  <TableCell className="text-sm text-neutral-700">
                    {report.date}
                  </TableCell>
                  <TableCell className="text-sm text-neutral-700">
                    {report.name}
                  </TableCell>
                  <TableCell className="text-sm text-neutral-700">
                    {report.type}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-4">
                      <Button
                        variant="link"
                        size="sm"
                        className="h-6 px-0 text-pay-500"
                        onClick={() => handleDownload(report.id)}
                      >
                        {t("reports:table.download")}
                      </Button>
                      <Button
                        variant="link"
                        size="icon"
                        className="h-6 w-6 text-destructive"
                        onClick={() => handleDelete(report)}
                      >
                        <Icon symbol="delete" weight={200} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          </div>
        </Card>
      </PageContainer>

      {/* Delete confirmation dialog */}
      <DeleteReportDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        reportName={selectedReport?.name || ""}
        onConfirm={handleConfirmDelete}
      />
    </>
  );
}
