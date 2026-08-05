import type { ServiceResult } from "@/features/common/services/service-result";
import type { ReportListItemDTO } from "@/features/reports/api/dtos/report.dto";
import type { Report } from "@/features/reports/application/entities/report.entity";
import type { ListQueryParams } from "@/lib/api/api.types";
import { ReportMapper } from "@/features/reports/api/mappers/report.mapper";
import { analyticsApi } from "@/lib/api/api";
import { apiGetList } from "@/lib/api/http.service";

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
}
