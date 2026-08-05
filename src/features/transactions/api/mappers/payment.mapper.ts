import type { PaymentListItemDTO } from "@/features/transactions/api/dtos/payment.dto";
import type { Transaction } from "@/features/transactions/application/entities/transaction.entity";
import { formatDisplayDate } from "@/lib/utils/date.utils";

export class PaymentMapper {
  public static toDomain(dto: PaymentListItemDTO): Transaction {
    return {
      id: dto.id,
      date: formatDisplayDate(dto.createdAt),
      beneficiary: dto.beneficiary,
      idNumber: dto.idNumber,
      amount: dto.amount,
      reference: dto.reference,
      status: dto.status,
    };
  }

  public static toDomainList(dtos: PaymentListItemDTO[]): Transaction[] {
    return dtos.map(PaymentMapper.toDomain);
  }
}
