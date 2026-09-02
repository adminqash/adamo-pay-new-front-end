import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { usePermissions } from "@/features/auth/application/hooks/use-permissions";
import { PaymentsService } from "@/features/transactions/api/services/payments.service";
import { useCountry } from "@/features/common/contexts/use-country";
import { withCountryScope } from "@/lib/country/country-code";
import { queryDefaults } from "@/lib/query/defaults";
import { queryKeys } from "@/lib/query/query-keys";

const EMPTY_COUNTS = {
  total: 0,
  pending: 0,
  returned: 0,
  rejected: 0,
  validated: 0,
  paid: 0,
};

export function usePaymentsSummary() {
  const { t } = useTranslation(["transactions"]);
  const { countryCode } = useCountry();
  const { capabilities } = usePermissions();
  const enabled
    = capabilities.canListTransactions && !capabilities.canViewDashboard;

  const query = useQuery({
    queryKey: withCountryScope(queryKeys.payments.summary, countryCode),
    queryFn: PaymentsService.getStatusSummary,
    enabled,
    ...queryDefaults,
    meta: {
      showMessageOnSuccess: false,
      errorMessage: t("transactions:errors.summary_failed", {
        defaultValue: "Error al cargar el resumen de transacciones",
      }),
    },
  });

  return {
    counts: query.data?.data?.transactions ?? EMPTY_COUNTS,
    isEnabled: enabled,
    isLoading: query.isLoading,
  };
}
