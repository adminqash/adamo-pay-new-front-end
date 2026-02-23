import { usePortalContainer } from "@adamosuiteservices/ui/use-portal-container";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbPage,
} from "@adamosuiteservices/ui/breadcrumb";
import { Card } from "@adamosuiteservices/ui/card";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import { PageContainer } from "@/features/common/components/layout/page-container";
import { PageTitle } from "@/features/common/components/layout/page-title";

export function MetricsPage() {
  const { t } = useTranslation("metrics");

  const sidebarTopBarPortal = usePortalContainer("[data-slot='sidebar-top-bar-portal']");

  return (
    <>
      {sidebarTopBarPortal && createPortal(
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbPage>{t("metrics.page_title")}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>,
        sidebarTopBarPortal,
      )}
      <PageContainer>
        <PageTitle>{t("metrics.page_title")}</PageTitle>
        <Card className="flex flex-col gap-6 border-neutral-200 p-6">
          <p className="text-sm text-neutral-500">
            {t("metrics.description")}
          </p>
        </Card>
      </PageContainer>
    </>
  );
}
