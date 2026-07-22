import type { AccountListItemDTO, MovementDTO } from "@/features/accounts/api/dtos/account.dto";
import type { Account, AccountMovement } from "@/features/accounts/application/entities/account.entity";
import { formatCurrencyDisplay } from "@/lib/utils/currency.utils";
import { formatDisplayDate } from "@/lib/utils/date.utils";

export class AccountMapper {
  public static toDomain(dto: AccountListItemDTO): Account {
    const balanceMinor = dto.balance;
    const availableMinor = dto.balance - (dto.reservedBalance ?? 0);
    return {
      id: dto.id,
      name: dto.name,
      balance: formatCurrencyDisplay(availableMinor, dto.currency),
      balanceMinor,
      availableMinor,
      currency: dto.currency,
      countryCode: dto.countryCode,
    };
  }

  public static toDomainList(dtos: AccountListItemDTO[]): Account[] {
    return dtos.map(AccountMapper.toDomain);
  }
}

export class MovementMapper {
  private static readonly TYPE_LABELS: Record<string, string> = {
    credit: "Crédito",
    debit: "Débito",
    transfer_in: "Crédito",
    transfer_out: "Débito",
    reservation: "Reserva",
    reservation_release: "Liberación de reserva",
    reservation_commit: "Compromiso de reserva",
  };

  public static toDomain(dto: MovementDTO): AccountMovement {
    return {
      id: dto.id,
      date: formatDisplayDate(dto.createdAt),
      type: MovementMapper.TYPE_LABELS[dto.type] ?? dto.type,
      amount: formatCurrencyDisplay(dto.amount, dto.currency),
    };
  }

  public static toDomainList(dtos: MovementDTO[]): AccountMovement[] {
    return dtos.map(MovementMapper.toDomain);
  }
}
