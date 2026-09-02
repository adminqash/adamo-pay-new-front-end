import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useCountry } from "@/features/common/contexts/use-country";
import { PaymentsService } from "@/features/transactions/api/services/payments.service";
import { withCountryScope } from "@/lib/country/country-code";
import { queryDefaults } from "@/lib/query/defaults";
import { queryKeys } from "@/lib/query/query-keys";

export function useTransactionDetail(
  paymentId: string | null,
  options: { enabled?: boolean, includeTimeline?: boolean } = {},
) {
  const { t } = useTranslation(["transactions"]);
  const { countryCode } = useCountry();
  const enabled = options.enabled ?? true;
  const includeTimeline = options.includeTimeline === true;

  const query = useQuery({
    queryKey: withCountryScope(
      [...queryKeys.payments.detail(paymentId ?? ""), includeTimeline],
      countryCode,
    ),
    queryFn: () =>
      PaymentsService.getById(paymentId!, { includeTimeline }),
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
