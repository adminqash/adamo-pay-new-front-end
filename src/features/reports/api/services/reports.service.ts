import type { ServiceResult } from "@/features/common/services/service-result";
import type { ReportListItemDTO } from "@/features/reports/api/dtos/report.dto";
import type { Report } from "@/features/reports/application/entities/report.entity";
import type { ListQueryParams } from "@/lib/api/api.types";
import { ReportMapper } from "@/features/reports/api/mappers/report.mapper";
import { analyticsApi } from "@/lib/api/api";
import { apiDelete, apiDownload, apiGetList, apiPost } from "@/lib/api/http.service";

export type CreateReportCommand = {
  name: string
  type: "transactions" | "batches" | "fundings"
  format: "csv"
  filters?: Record<string, unknown>
};

export class ReportsService {
  public static GET_REPORTS_KEY = "get_reports_key";

  public static async list(
    params?: ListQueryParams,
  ): Promise<ServiceResult<Report[]>> {
    return apiGetList<ReportListItemDTO, Report>(
      analyticsApi,
      "/reports",
      ReportMapper.toDomainList,
      params,
    );
  }

  public static async create(
    command: CreateReportCommand,
  ): Promise<ServiceResult<Report>> {
    return apiPost<ReportListItemDTO, Report>(
      analyticsApi,
      "/reports",
      command,
      ReportMapper.toDomain,
    );
  }

  public static async remove(id: string): Promise<ServiceResult<Report>> {
    return apiDelete<ReportListItemDTO, Report>(
      analyticsApi,
      `/reports/${id}`,
      ReportMapper.toDomain,
    );
  }

  public static async download(id: string, fallbackFileName = "reporte.csv") {
    return apiDownload(analyticsApi, `/reports/${id}/download`, fallbackFileName);
  }
}
