import { isAxiosError } from "axios";
import { ServiceResult } from "@/features/common/services/service-result";

export type IdentityApiResponse<T> = {
  message: string
  data: T | null
  errors?: string[] | null
  timestamp: string
};

export function unwrapIdentityResponse<TDTO, TDomain>(
  response: IdentityApiResponse<TDTO>,
  mapper: (dto: TDTO) => TDomain,
): ServiceResult<TDomain> {
  const hasErrors = Array.isArray(response.errors) && response.errors.length > 0;

  if (hasErrors || response.data === null || response.data === undefined) {
    throw ServiceResult.builder<TDomain>()
      .setSuccess(false)
      .setMessage(response.message)
      .setCode(response.errors?.[0] ?? "identity_error")
      .setTimestamp(response.timestamp)
      .build();
  }

  return ServiceResult.builder<TDomain>()
    .setSuccess(true)
    .setMessage(response.message)
    .setData(mapper(response.data))
    .setTimestamp(response.timestamp)
    .build();
}

export function handleIdentityError(error: unknown): never {
  if (error instanceof ServiceResult) {
    throw error;
  }

  if (isAxiosError(error) && error.response?.data) {
    const body = error.response.data as Partial<IdentityApiResponse<unknown>>;

    throw ServiceResult.builder()
      .setSuccess(false)
      .setMessage(body.message ?? "Server communication error")
      .setCode(body.errors?.[0] ?? "identity_error")
      .setTimestamp(body.timestamp ?? new Date().toISOString())
      .build();
  }

  throw ServiceResult.builder()
    .setSuccess(false)
    .setMessage("Server communication error")
    .setCode("network_error")
    .setTimestamp(new Date().toISOString())
    .build();
}
