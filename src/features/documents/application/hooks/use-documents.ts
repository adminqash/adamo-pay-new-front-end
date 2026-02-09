import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { DocumentsService } from "@/features/documents/api/services/documents.service";

export function useDocuments() {
  const { t } = useTranslation(["documents"]);

  return useQuery({
    queryKey: [DocumentsService.GET_DOCUMENTS_KEY],
    queryFn: DocumentsService.getAll,
    meta: {
      successMessage: t("documents:documents.success_message"),
      errorMessage: t("documents:documents.error_message"),
    },
  });
}
