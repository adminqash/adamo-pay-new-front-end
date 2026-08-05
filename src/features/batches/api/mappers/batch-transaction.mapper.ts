import type { BatchTransactionDTO } from "@/features/batches/api/dtos/batch-transaction.dto";
import type { Transaction, TransactionStatus } from "@/features/transactions/application/entities/transaction.entity";
import { formatDisplayDate } from "@/lib/utils/date.utils";
import { minorToMajor } from "@/lib/money/money";

function mapStatus(status: string): TransactionStatus {
  switch (status) {
    case "paid":
      return "paid";
    case "returned":
      return "returned";
    case "rejected":
    case "invalid":
      return "rejected";
    case "valid":
      return "validated";
    case "pending":
    case "processing":
    default:
      return "pending";
  }
}

export class BatchTransactionMapper {
  public static toDomain(dto: BatchTransactionDTO): Transaction {
    // API amounts are integer minor units; `Transaction.amount` is consumed
    // as a major-unit number by the batch detail table's formatter.
    const amount = Number(
      minorToMajor(dto.rawData.amount ?? dto.parsedData?.amount ?? 0),
    );

    return {
      id: dto.paymentId ?? dto.id,
      date: formatDisplayDate(dto.createdAt),
      beneficiary: dto.rawData.beneficiaryName ?? "",
      idNumber: dto.rawData.idNumber ?? "",
      amount,
      reference: dto.rawData.reference ?? `ROW-${dto.rowNumber}`,
      status: mapStatus(dto.status),
    };
  }

  public static toDomainList(dtos: BatchTransactionDTO[]): Transaction[] {
    return dtos.map(BatchTransactionMapper.toDomain);
  }
}
