import type { ComplianceCheckDTO } from "@/features/compliance/api/dtos/compliance-check.dto";
import { ComplianceCheckMapper, type ComplianceCheck } from "@/features/compliance/api/mappers/compliance-check.mapper";
import type { ServiceResult } from "@/features/common/services/service-result";
import type { ListQueryParams } from "@/lib/api/api.types";
import { coreApi } from "@/lib/api/api";
import { apiGetList } from "@/lib/api/http.service";

export class ComplianceService {
  public static async listChecks(
    params?: ListQueryParams,
  ): Promise<ServiceResult<ComplianceCheck[]>> {
    return apiGetList<ComplianceCheckDTO, ComplianceCheck>(
      coreApi,
      "/compliance/checks",
      ComplianceCheckMapper.toDomainList,
      params,
    );
  }
}
