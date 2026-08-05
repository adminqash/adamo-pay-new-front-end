import type { AuthorizeDto } from "@/features/auth/api/dtos/authorize.dto";
import type { ServiceResult } from "@/features/common/services/service-result";
import { handleIdentityError, unwrapIdentityResponse, type IdentityApiResponse } from "@/features/auth/api/services/identity-response";
import { authApi } from "@/lib/api/api";

export class AuthorizeService {
  public static async check(): Promise<ServiceResult<AuthorizeDto>> {
    try {
      const response = await authApi.get<IdentityApiResponse<AuthorizeDto>>("/auth/authorize");
      return unwrapIdentityResponse(response.data, (dto) => dto);
    } catch(error) {
      handleIdentityError(error);
    }
  }
}
