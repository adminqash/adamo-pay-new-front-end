import type { BatchListItemDTO } from "@/features/batches/api/dtos/batch.dto";
import type { Batch, BatchStatus } from "@/features/batches/application/entities/batch.entity";
import { formatDisplayDate } from "@/lib/utils/date.utils";

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
      amount: dto.summary?.totalAmount ?? 0,
      batchId: dto.batchId,
      status: mapStatus(dto.status),
    };
  }

  public static toDomainList(dtos: BatchListItemDTO[]): Batch[] {
    return dtos.map(BatchMapper.toDomain);
  }
}
