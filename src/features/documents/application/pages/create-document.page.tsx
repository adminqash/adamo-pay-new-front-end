import { usePortalContainer } from "@adamosuiteservices/ui/use-portal-container";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import { PageContainer } from "@/features/common/components/layout/page-container";
import { PageTitle } from "@/features/common/components/layout/page-title";
import { CreateDocumentForm } from "@/features/documents/application/components/create/create-document-form";

export function CreateDocumentPage() {
  const { t } = useTranslation(["documents"]);

  const sidebarTopBarPortal = usePortalContainer("[data-slot='sidebar-top-bar-portal']");

  return (
    <>
      {sidebarTopBarPortal && createPortal(
        <PageTitle>{t("documents:create_document.page_title")}</PageTitle>,
        sidebarTopBarPortal,
      )}
      <PageContainer>
        <CreateDocumentForm />
      </PageContainer>
    </>
  );
}
