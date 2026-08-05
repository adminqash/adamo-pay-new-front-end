import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import type { ListQueryParams } from "@/lib/api/api.types";
import { PaymentsService } from "@/features/transactions/api/services/payments.service";
import { listQueryDefaults } from "@/lib/query/defaults";
import { queryKeys } from "@/lib/query/query-keys";

export function useTransactions(params?: ListQueryParams) {
  const { t } = useTranslation(["transactions"]);

  const query = useQuery({
    queryKey: queryKeys.payments.all(params),
    queryFn: () => PaymentsService.list(params),
    ...listQueryDefaults,
    meta: {
      showMessageOnSuccess: false,
      errorMessage: t("transactions:errors.load_failed", { defaultValue: "Error al cargar transacciones" }),
    },
  });

  return {
    transactions: query.data?.data ?? [],
    totalCount: query.data?.pagination?.total ?? 0,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}
