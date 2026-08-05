import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { PaymentsService } from "@/features/transactions/api/services/payments.service";
import { queryDefaults } from "@/lib/query/defaults";
import { queryKeys } from "@/lib/query/query-keys";

export function useTransactionDetail(paymentId: string | null, enabled = true) {
  const { t } = useTranslation(["transactions"]);

  const query = useQuery({
    queryKey: queryKeys.payments.detail(paymentId ?? ""),
    queryFn: () => PaymentsService.getById(paymentId!),
    enabled: Boolean(paymentId) && enabled,
    ...queryDefaults,
    meta: {
      showMessageOnSuccess: false,
      errorMessage: t("transactions:errors.detail_failed", {
        defaultValue: "Error al cargar el detalle del pago",
      }),
    },
  });

  return {
    detail: query.data?.data ?? null,
    isLoading: query.isLoading,
    error: query.error,
  };
}
