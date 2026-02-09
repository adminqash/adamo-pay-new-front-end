import { usePortalContainer } from "@adamosuiteservices/ui/use-portal-container";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import { PageContainer } from "@/features/common/components/layout/page-container";
import { PageTitle } from "@/features/common/components/layout/page-title";
import { useHandleQueryError } from "@/features/common/hooks/use-handle-query-error";
import { useDocuments } from "@/features/documents/application/hooks/use-documents";

export function DocumentsPage() {
  const { t } = useTranslation(["documents"]);

  const sidebarTopBarPortal = usePortalContainer("[data-slot='sidebar-top-bar-portal']");

  const documents = useDocuments();

  useHandleQueryError({
    error: documents.error,
    fn: (error) => {
      console.log(error);
    },
  });

  return (
    <>
      {sidebarTopBarPortal && createPortal(
        <PageTitle>{t("documents:documents.page_title")}</PageTitle>,
        sidebarTopBarPortal,
      )}
      <PageContainer>
        {JSON.stringify(documents.data?.data)}
      </PageContainer>
    </>
  );
}
