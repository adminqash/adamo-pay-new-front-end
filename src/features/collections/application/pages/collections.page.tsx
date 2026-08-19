import { Card } from "@adamosuiteservices/ui/card";
import { usePortalContainer } from "@adamosuiteservices/ui/use-portal-container";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import { PageContainer } from "@/features/common/components/layout/page-container";
import { PageTitle } from "@/features/common/components/layout/page-title";

export function CollectionsPage() {
  const { t } = useTranslation(["collections"]);
  const sidebarTopBarPortal = usePortalContainer("[data-slot='sidebar-top-bar-portal']");

  return (
    <>
      {sidebarTopBarPortal && createPortal(
        <PageTitle>{t("collections:page_title")}</PageTitle>,
        sidebarTopBarPortal,
      )}
      <PageContainer>
        <Card className="p-6">
          <p className="text-sm text-foreground">{t("collections:placeholder")}</p>
        </Card>
      </PageContainer>
    </>
  );
}
