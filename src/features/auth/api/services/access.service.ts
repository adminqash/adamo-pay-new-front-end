import type { AccessMeDto } from "@/features/auth/api/dtos/access-me.dto";
import type { ServiceResult } from "@/features/common/services/service-result";
import { coreApi } from "@/lib/api/api";
import { apiGetRaw } from "@/lib/api/http.service";

export class AccessService {
  public static async getMe(): Promise<ServiceResult<AccessMeDto>> {
    return apiGetRaw<AccessMeDto>(coreApi, "/access/me");
  }
}
