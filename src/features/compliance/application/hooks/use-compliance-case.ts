import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { ComplianceService } from "@/features/compliance/api/services/compliance-case.service";
import { useCountry } from "@/features/common/contexts/use-country";
import { withCountryScope } from "@/lib/country/country-code";
import { queryDefaults } from "@/lib/query/defaults";
import { queryKeys } from "@/lib/query/query-keys";

function invalidateCompliance(
  queryClient: ReturnType<typeof useQueryClient>,
  subjectId: string,
) {
  void queryClient.invalidateQueries({ queryKey: ["compliance"] });
  void queryClient.invalidateQueries({ queryKey: ["batches"] });
  void queryClient.invalidateQueries({ queryKey: ["payments"] });
  void queryClient.invalidateQueries({
    queryKey: queryKeys.compliance.case(subjectId),
  });
}

export function useComplianceCase(subjectId: string | undefined) {
  const { t } = useTranslation(["compliance"]);
  const { countryCode } = useCountry();

  const query = useQuery({
    queryKey: withCountryScope(queryKeys.compliance.case(subjectId ?? ""), countryCode),
    queryFn: () => ComplianceService.getCase(subjectId!),
    enabled: Boolean(subjectId),
    ...queryDefaults,
    meta: {
      showMessageOnSuccess: false,
      errorMessage: t("compliance:errors.case_failed", {
        defaultValue: "Error al cargar el caso de cumplimiento",
      }),
    },
  });

  return {
    complianceCase: query.data?.data ?? null,
    isLoading: query.isLoading,
    error: query.error,
  };
}

export function useComplianceScreening(subjectId: string | undefined, enabled = true) {
  const { t } = useTranslation(["compliance"]);
  const { countryCode } = useCountry();

  const query = useQuery({
    queryKey: withCountryScope(
      queryKeys.compliance.screening(subjectId ?? ""),
      countryCode,
    ),
    queryFn: () => ComplianceService.getScreeningDetail(subjectId!),
    enabled: Boolean(subjectId) && enabled,
    ...queryDefaults,
    meta: {
      showMessageOnSuccess: false,
      errorMessage: t("compliance:errors.screening_failed", {
        defaultValue: "Error al cargar los resultados de la novedad",
      }),
    },
  });

  return {
    screening: query.data?.data ?? null,
    isLoading: query.isLoading,
  };
}

export function useResolveFinding(subjectId: string) {
  const queryClient = useQueryClient();
  const { t } = useTranslation(["compliance"]);

  return useMutation({
    mutationKey: [ComplianceService.RESOLVE_FINDING_KEY, subjectId],
    mutationFn: (input: { findingKey: string, note: string }) =>
      ComplianceService.resolveFinding(subjectId, input.findingKey, input.note),
    meta: {
      successMessage: t("compliance:messages.finding_resolved", {
        defaultValue: "Novedad resuelta",
      }),
      errorMessage: t("compliance:errors.resolve_failed", {
        defaultValue: "No se pudo resolver la novedad",
      }),
    },
    onSuccess: () => invalidateCompliance(queryClient, subjectId),
  });
}

export function useAddComplianceComment(subjectId: string) {
  const queryClient = useQueryClient();
  const { t } = useTranslation(["compliance"]);

  return useMutation({
    mutationKey: [ComplianceService.ADD_COMMENT_KEY, subjectId],
    mutationFn: (input: {
      text: string
      attachments?: Array<{
        name: string
        size?: number
        contentType?: string
        contentBase64: string
      }>
    }) => ComplianceService.addComment(subjectId, input),
    meta: {
      successMessage: t("compliance:messages.comment_created", {
        defaultValue: "Comentario enviado",
      }),
      errorMessage: t("compliance:errors.comment_failed", {
        defaultValue: "No se pudo enviar el comentario",
      }),
    },
    onSuccess: () => invalidateCompliance(queryClient, subjectId),
  });
}

export function useApproveComplianceCase(subjectId: string) {
  const queryClient = useQueryClient();
  const { t } = useTranslation(["compliance"]);

  return useMutation({
    mutationKey: [ComplianceService.APPROVE_KEY, subjectId],
    mutationFn: (note?: string) => ComplianceService.approve(subjectId, note),
    meta: {
      successMessage: t("compliance:messages.approved", {
        defaultValue: "Pago aprobado",
      }),
      errorMessage: t("compliance:errors.approve_failed", {
        defaultValue: "No se pudo aprobar el pago",
      }),
    },
    onSuccess: () => invalidateCompliance(queryClient, subjectId),
  });
}

export function useRejectComplianceCase(subjectId: string) {
  const queryClient = useQueryClient();
  const { t } = useTranslation(["compliance"]);

  return useMutation({
    mutationKey: [ComplianceService.REJECT_KEY, subjectId],
    mutationFn: (note: string) => ComplianceService.reject(subjectId, note),
    meta: {
      successMessage: t("compliance:messages.rejected", {
        defaultValue: "Pago rechazado",
      }),
      errorMessage: t("compliance:errors.reject_failed", {
        defaultValue: "No se pudo rechazar el pago",
      }),
    },
    onSuccess: () => invalidateCompliance(queryClient, subjectId),
  });
}
