import type { ReportListItemDTO } from "@/features/reports/api/dtos/report.dto";
import type { Report } from "@/features/reports/application/entities/report.entity";
import { formatDisplayDate } from "@/lib/utils/date.utils";

const REPORT_TYPE_LABELS: Record<ReportListItemDTO["type"], string> = {
  transactions: "Transacciones",
  batches: "Lotes",
  beneficiaries: "Beneficiario",
  accounts: "Cuentas",
  compliance: "Cumplimiento",
  audit: "Auditoría",
};

export class ReportMapper {
  public static toDomain(dto: ReportListItemDTO): Report {
    return {
      id: dto.id,
      date: formatDisplayDate(dto.createdAt),
      name: dto.name,
      type: REPORT_TYPE_LABELS[dto.type] ?? dto.type,
      status: dto.status,
      canDownload: dto.canDownload,
    };
  }

  public static toDomainList(dtos: ReportListItemDTO[]): Report[] {
    return dtos.map(ReportMapper.toDomain);
  }
}
