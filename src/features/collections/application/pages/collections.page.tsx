import { Button } from "@adamosuiteservices/ui/button";
import { Card } from "@adamosuiteservices/ui/card";
import { Checkbox } from "@adamosuiteservices/ui/checkbox";
import { Combobox } from "@adamosuiteservices/ui/combobox";
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
import { Label } from "@adamosuiteservices/ui/label";
import { ToastManager } from "@adamosuiteservices/ui/toaster";
import { usePortalContainer } from "@adamosuiteservices/ui/use-portal-container";
import { useState } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import { PermissionGate } from "@/features/auth/application/components/permission-gate";
import { EXPORT_DATA } from "@/features/auth/domain/permission-ui";
import { PageContainer } from "@/features/common/components/layout/page-container";
import { PageTitle } from "@/features/common/components/layout/page-title";
import { ReportsService } from "@/features/reports/api/services/reports.service";

export function CollectionsPage() {
  const { t } = useTranslation(["collections"]);
  const sidebarTopBarPortal = usePortalContainer("[data-slot='sidebar-top-bar-portal']");
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [exportStatusFilter, setExportStatusFilter] = useState<string[]>(["all"]);
  const [exportTypeFilter, setExportTypeFilter] = useState("all");
  const [exportFormatCSV, setExportFormatCSV] = useState(false);

  const handleExportCollections = async() => {
    try {
      const statuses = exportStatusFilter.filter((status) => status !== "all");

      await ReportsService.create({
        name: "Recaudos",
        type: "collections",
        format: "csv",
        filters: {
          status: statuses.length > 0 ? statuses.join(",") : undefined,
          type: exportTypeFilter !== "all" ? exportTypeFilter : undefined,
        },
      });

      ToastManager.show({
        message: t("collections:export_dialog.success"),
        variant: "success",
      });
      setIsExportDialogOpen(false);
      setExportFormatCSV(false);
    } catch {
      ToastManager.show({
        message: t("collections:export_dialog.error"),
        variant: "destructive",
      });
    }
  };

  return (
    <>
      {sidebarTopBarPortal && createPortal(
        <PageTitle>{t("collections:page_title")}</PageTitle>,
        sidebarTopBarPortal,
      )}
      <PageContainer>
        <Card className="flex flex-col gap-6 p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <p className="text-sm text-foreground">{t("collections:placeholder")}</p>
            <PermissionGate permission={[...EXPORT_DATA]} mode="any">
              <Dialog open={isExportDialogOpen} onOpenChange={setIsExportDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="secondary">
                    {t("collections:header.export_data")}
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[640px]">
                  <DialogHeader>
                    <DialogTitle>{t("collections:export_dialog.title")}</DialogTitle>
                    <p className="mt-2 text-sm text-foreground">
                      {t("collections:export_dialog.description")}
                    </p>
                  </DialogHeader>
                  <DialogBody className="flex flex-col gap-8">
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <Combobox
                          multiple
                          exclusiveOption="all"
                          alwaysShowPlaceholder
                          valuePosition="right"
                          icon="search_activity"
                          options={[
                            { value: "all", label: t("collections:export_dialog.status_all") },
                            { value: "pending", label: t("collections:status.pending") },
                            { value: "validated", label: t("collections:status.validated") },
                            { value: "paid", label: t("collections:status.paid") },
                            { value: "requires-review", label: t("collections:status.requires-review") },
                            { value: "rejected", label: t("collections:status.rejected") },
                            { value: "expired", label: t("collections:status.expired") },
                            { value: "cancelled", label: t("collections:status.cancelled") },
                          ]}
                          value={exportStatusFilter}
                          onValueChange={(value) => setExportStatusFilter(value as string[])}
                          labels={{
                            placeholder: t("collections:export_dialog.status_filter"),
                          }}
                          classNames={{ trigger: "h-10 w-full" }}
                        />
                      </div>
                      <div className="flex-1">
                        <Combobox
                          alwaysShowPlaceholder
                          valuePosition="right"
                          selectedFeedback="check"
                          icon="format_list_bulleted"
                          options={[
                            { value: "all", label: t("collections:export_dialog.type_all") },
                            { value: "payment_link", label: t("collections:type.payment_link") },
                            { value: "breb_qr", label: t("collections:type.breb_qr") },
                          ]}
                          value={exportTypeFilter}
                          onValueChange={(value) => setExportTypeFilter(value as string)}
                          labels={{
                            placeholder: t("collections:export_dialog.type_filter"),
                          }}
                          classNames={{ trigger: "h-10 w-full" }}
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-8">
                      <p className="text-sm text-foreground">
                        {t("collections:export_dialog.file_type_label")}
                      </p>
                      <div className="flex items-center gap-3">
                        <Checkbox
                          id="collections-csv"
                          checked={exportFormatCSV}
                          onCheckedChange={(checked) => setExportFormatCSV(checked === true)}
                        />
                        <Label htmlFor="collections-csv" className="cursor-pointer text-sm">
                          {t("collections:export_dialog.csv_excel")}
                        </Label>
                      </div>
                      <div className="flex items-center gap-3">
                        <Checkbox id="collections-pdf" checked={false} disabled />
                        <Label htmlFor="collections-pdf" className="cursor-not-allowed text-sm text-muted-foreground">
                          {t("collections:export_dialog.pdf")}
                        </Label>
                      </div>
                    </div>
                  </DialogBody>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant="secondary">
                        {t("collections:export_dialog.cancel")}
                      </Button>
                    </DialogClose>
                    <Button
                      variant="default"
                      disabled={!exportFormatCSV}
                      onClick={() => void handleExportCollections()}
                    >
                      {t("collections:export_dialog.export")}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </PermissionGate>
          </div>
        </Card>
      </PageContainer>
    </>
  );
}
