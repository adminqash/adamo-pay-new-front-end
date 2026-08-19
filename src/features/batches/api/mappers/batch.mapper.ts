import type { BatchListItemDTO } from "@/features/batches/api/dtos/batch.dto";
import type { Batch, BatchStatus } from "@/features/batches/application/entities/batch.entity";
import { formatDisplayDate } from "@/lib/utils/date.utils";
import { minorToMajor } from "@/lib/money/money";

function mapStatus(status: string): BatchStatus {
  if (status === "pending" || status === "processing" || status === "completed") {
    return status;
  }
  if (status === "cancelled" || status === "failed") {
    return "completed";
  }
  return "pending";
}

export class BatchMapper {
  public static toDomain(dto: BatchListItemDTO): Batch {
    return {
      id: dto.id,
      date: formatDisplayDate(dto.createdAt),
      name: dto.name,
      transactions: dto.summary?.totalItems ?? 0,
      // API amounts are integer minor units; this entity's `amount` is
      // consumed as a major-unit number by Intl.NumberFormat in the pages.
      amount: Number(minorToMajor(dto.summary?.totalAmount ?? 0)),
      batchId: dto.batchId,
      status: mapStatus(dto.status),
      lastAction: dto.lastAction,
      validItems: dto.summary?.validItems ?? 0,
      invalidItems: dto.summary?.invalidItems ?? 0,
      screening: dto.summary?.screening,
    };
  }

  public static toDomainList(dtos: BatchListItemDTO[]): Batch[] {
    return dtos.map(BatchMapper.toDomain);
  }
}
