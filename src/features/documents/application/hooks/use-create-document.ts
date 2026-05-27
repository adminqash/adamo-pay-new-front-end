import { useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { DocumentsService } from "@/features/documents/api/services/documents.service";

export function useCreateDocument() {
  const { t } = useTranslation(["documents"]);

  return useMutation({
    mutationKey: [DocumentsService.CREATE_DOCUMENT_KEY],
    mutationFn: DocumentsService.create,
    meta: {
      successMessage: t("documents:create_document.success_message"),
      errorMessage: t("documents:create_document.error_message"),
    },
    onMutate: () => {},
    onSuccess: () => {},
    onError: () => {},
    onSettled: () => {},
  });
}
