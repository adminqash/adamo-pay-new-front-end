import type { ProfileDto } from "@/features/auth/api/dtos/user-profile.dto";
import type { ServiceResult } from "@/features/common/services/service-result";
import type { User } from "@/features/auth/application/entities/user.entity";
import { UserMapper } from "@/features/auth/api/mappers/user.mapper";
import { handleIdentityError, unwrapIdentityResponse, type IdentityApiResponse } from "@/features/auth/api/services/identity-response";
import { authApi } from "@/lib/api/api";

export class UserProfileService {
  public static async getProfile(): Promise<ServiceResult<User>> {
    try {
      const response = await authApi.get<IdentityApiResponse<ProfileDto>>("/user/profile");
      return unwrapIdentityResponse(response.data, UserMapper.toDomain);
    } catch(error) {
      handleIdentityError(error);
    }
  }
}
