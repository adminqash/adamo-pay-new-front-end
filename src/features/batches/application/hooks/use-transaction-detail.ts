import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { BatchesService } from "@/features/batches/api/services/batches.service";
import { useCountry } from "@/features/common/contexts/use-country";
import { withCountryScope } from "@/lib/country/country-code";
import { listQueryDefaults } from "@/lib/query/defaults";
import { queryKeys } from "@/lib/query/query-keys";

export function useBatchTransactionDetail(
  batchId: string | undefined,
  transactionId: string | undefined,
) {
  const { t } = useTranslation(["batches"]);
  const { countryCode } = useCountry();

  const query = useQuery({
    queryKey: withCountryScope(
      queryKeys.batches.transactionDetail(batchId ?? "", transactionId ?? ""),
      countryCode,
    ),
    queryFn: () => BatchesService.getTransaction(batchId!, transactionId!),
    enabled: Boolean(batchId && transactionId),
    ...listQueryDefaults,
    meta: {
      showMessageOnSuccess: false,
      errorMessage: t("batches:errors.transaction_detail_failed", {
        defaultValue: "Error al cargar el detalle de la transacción",
      }),
    },
  });

  return {
    transaction: query.data?.data ?? null,
    isLoading: query.isLoading,
    error: query.error,
  };
}

/** @deprecated Use useBatchTransactionDetail instead */
export const useTransactionDetail = useBatchTransactionDetail;
