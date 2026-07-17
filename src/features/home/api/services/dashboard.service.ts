import type { ServiceResult } from "@/features/common/services/service-result";
import type { DashboardSummaryDTO } from "@/features/home/api/dtos/dashboard.dto";
import type { Home } from "@/features/home/application/entities/home.entity";
import { DashboardMapper } from "@/features/home/api/mappers/dashboard.mapper";
import { coreApi } from "@/lib/api/api";
import { apiGet } from "@/lib/api/http.service";

export class DashboardService {
  public static GET_SUMMARY_KEY = "get_dashboard_summary_key";

  public static async getSummary(): Promise<ServiceResult<Home>> {
    return apiGet<DashboardSummaryDTO, Home>(
      coreApi,
      "/dashboard/summary",
      DashboardMapper.toDomain,
    );
  }
}
