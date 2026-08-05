import type { DashboardSummaryDTO } from "@/features/home/api/dtos/dashboard.dto";
import type { Home } from "@/features/home/application/entities/home.entity";
import { formatCurrencyDisplay } from "@/lib/utils/currency.utils";

export class DashboardMapper {
  public static toDomain(dto: DashboardSummaryDTO): Home {
    const primaryBalance = dto.availableBalances[0];

    return {
      walletBalance: {
        amount: primaryBalance
          ? formatCurrencyDisplay(primaryBalance.amount, primaryBalance.currency)
          : "$0,00",
        currency: primaryBalance?.currency ?? "COP",
        countryCode: primaryBalance?.countryCode ?? "CO",
      },
      transactionStats: {
        pending: dto.transactions.pending,
        returned: dto.transactions.returned,
        rejected: dto.transactions.rejected,
        validated: dto.transactions.validated,
        paid: dto.transactions.paid,
      },
    };
  }
}
