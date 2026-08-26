import { Badge } from "@adamosuiteservices/ui/badge";
import { Button } from "@adamosuiteservices/ui/button";
import { Card } from "@adamosuiteservices/ui/card";
import { Icon } from "@adamosuiteservices/ui/icon";
import { Input } from "@adamosuiteservices/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@adamosuiteservices/ui/table";
import { ToastManager } from "@adamosuiteservices/ui/toaster";
import { usePortalContainer } from "@adamosuiteservices/ui/use-portal-container";
import { useState } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import { DeleteReportDialog } from "../components/delete-report-dialog";
import { useReports } from "../hooks/use-reports";
import type { Report, ReportStatus } from "../entities/report.entity";
import { ReportsService } from "@/features/reports/api/services/reports.service";
import { triggerBrowserDownload } from "@/lib/utils/file.utils";
import { PageContainer } from "@/features/common/components/layout/page-container";
import { PageTitle } from "@/features/common/components/layout/page-title";
import { StickyFilterHeader } from "@/features/common/components/layout/sticky-filter-header";

function getStatusVariant(status: ReportStatus): "muted" | "success-medium" | "destructive-medium" {
  if (status === "completed") return "success-medium";
  if (status === "failed") return "destructive-medium";
  return "muted";
}

export function ReportsPage() {
  const { t } = useTranslation(["reports"]);

  const sidebarTopBarPortal = usePortalContainer("[data-slot='sidebar-top-bar-portal']");

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const { reports, totalCount, refetch } = useReports({ search: searchQuery || undefined });

  const handleDownload = async(report: Report) => {
    try {
      const { blob, fileName } = await ReportsService.download(report.id, `${report.name}.csv`);
      triggerBrowserDownload(blob, fileName);
    } catch {
      ToastManager.show({
        message: t("reports:messages.download_error"),
        variant: "destructive",
      });
    }
  };

  const handleDelete = (report: Report) => {
    setSelectedReport(report);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async() => {
    if (!selectedReport) {
      return;
    }

    try {
      await ReportsService.remove(selectedReport.id);
      ToastManager.show({
        message: t("reports:messages.delete_success"),
        variant: "success",
      });
      await refetch();
    } catch {
      ToastManager.show({
        message: t("reports:messages.delete_error"),
        variant: "destructive",
      });
    } finally {
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
        <Card className="flex flex-col gap-0 overflow-visible border p-6">
          <StickyFilterHeader className="flex flex-col gap-0">
            {/* header + search */}
            <div className="flex flex-wrap items-center gap-6">
              {/* title */}
              <div className="flex min-w-[220px] flex-1 items-center gap-4">
                <p className="text-sm font-semibold text-neutral-700">
                  {t("reports:header.count", { count: totalCount })}
                </p>
              </div>
              {/* search input */}
              <div className="min-w-[500px] flex-1">
                <div className="relative">
                  <Icon
                    symbol="search"
                    className={`
                      absolute top-1/2 left-2 -translate-y-1/2 text-neutral-500
                    `}
                  />
                  <Input
                    placeholder={t("reports:header.search_placeholder")}
                    className="h-10 pl-10 text-sm"
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
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
                  <TableHead className={`
                    text-xs font-semibold text-neutral-700 uppercase
                  `}
                  >
                    {t("reports:table.date")}
                  </TableHead>
                  <TableHead className={`
                    text-xs font-semibold text-neutral-700 uppercase
                  `}
                  >
                    {t("reports:table.report_name")}
                  </TableHead>
                  <TableHead className={`
                    text-xs font-semibold text-neutral-700 uppercase
                  `}
                  >
                    {t("reports:table.report_type")}
                  </TableHead>
                  <TableHead className={`
                    text-xs font-semibold text-neutral-700 uppercase
                  `}
                  >
                    {t("reports:table.status")}
                  </TableHead>
                  <TableHead className={`
                    text-xs font-semibold text-neutral-700 uppercase
                  `}
                  >
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
                      {t(`reports:types.${report.type}`, { defaultValue: report.type })}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={getStatusVariant(report.status)}
                        className="h-8 px-2 text-sm leading-5"
                      >
                        {t(`reports:status.${report.status}`)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-4">
                        <Button
                          variant="link"
                          size="sm"
                          className="h-6 px-0 text-pay-500"
                          disabled={!report.canDownload}
                          onClick={() => void handleDownload(report)}
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
        onConfirm={() => void handleConfirmDelete()}
      />
    </>
  );
}
