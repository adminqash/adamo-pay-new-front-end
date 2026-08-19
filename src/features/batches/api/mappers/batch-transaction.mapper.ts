import type { BatchTransactionDTO } from "@/features/batches/api/dtos/batch-transaction.dto";
import type { Transaction } from "@/features/transactions/application/entities/transaction.entity";
import { normalizeBatchItemStatus } from "@/features/transactions/application/utils/transaction-status";
import { formatDisplayDate } from "@/lib/utils/date.utils";
import { minorToMajor } from "@/lib/money/money";

export class BatchTransactionMapper {
  public static toDomain(dto: BatchTransactionDTO): Transaction {
    // API amounts are integer minor units; `Transaction.amount` is consumed
    // as a major-unit number by the batch detail table's formatter.
    const amount = Number(
      minorToMajor(dto.rawData.amount ?? dto.parsedData?.amount ?? 0),
    );
    const firstError = dto.validationErrors?.[0]?.message
      ?? dto.screening?.reasons?.[0]?.detail
      ?? dto.screening?.reasons?.[0]?.code;

    return {
      id: dto.paymentId ?? dto.id,
      date: formatDisplayDate(dto.createdAt),
      beneficiary: dto.rawData.beneficiaryName ?? "",
      idNumber: dto.rawData.idNumber ?? "",
      amount,
      reference: dto.rawData.reference ?? `ROW-${dto.rowNumber}`,
      status: normalizeBatchItemStatus(dto.status),
      screeningVerdict: dto.screening?.verdict,
      screeningDetail: firstError,
    };
  }

  public static toDomainList(dtos: BatchTransactionDTO[]): Transaction[] {
    return dtos.map(BatchTransactionMapper.toDomain);
  }
}
