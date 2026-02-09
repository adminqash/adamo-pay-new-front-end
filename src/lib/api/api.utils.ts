import { isAxiosError, type AxiosResponse } from "axios";
import type { APIResponse, APIPagination } from "./api.types";
import { Pagination } from "@/features/common/services/service-pagination";
import { ServiceResult } from "@/features/common/services/service-result";

/**
 * Maps APIPagination to domain Pagination
 */
export class PaginationMapper {
  public static toDomain(pagination: APIPagination | null): Pagination | null {
    if (!pagination) {
      return null;
    }

    return Pagination.builder()
      .setTotal(pagination.total)
      .setPages(pagination.pages)
      .setPage(pagination.page)
      .setNext(pagination.next)
      .setPrevious(pagination.previous)
      .build();
  }
}

/**
 * Transforms APIResponse to domain ServiceResult (with mapper - expects data).
 * Throws ServiceResult as exception if success: false or if data is missing
 */
export async function handleAPIResponse<TDTO, TDomain>(
  response: AxiosResponse<APIResponse<TDTO>>,
  mapper: (dto: TDTO) => TDomain,
): Promise<ServiceResult<TDomain>>;

/**
 * Transforms APIResponse to domain ServiceResult (without mapper - no data expected).
 * Throws ServiceResult as exception if success: false
 */
export async function handleAPIResponse<TDTO>(
  response: AxiosResponse<APIResponse<TDTO>>,
  mapper?: undefined,
): Promise<ServiceResult<null>>;

/**
 * Implementation
 */
export async function handleAPIResponse<TDTO, TDomain = null>(
  response: AxiosResponse<APIResponse<TDTO>>,
  mapper?: (dto: TDTO) => TDomain,
): Promise<ServiceResult<TDomain | null>> {
  const _response = response.data;

  // If backend responds with success: false, throw error
  if (!_response.success) {
    throw ServiceResult.builder<TDTO>()
      .setSuccess(_response.success)
      .setMessage(_response.message)
      .setData(_response.data)
      .setCode(_response.code)
      .setTimestamp(_response.timestamp)
      .setTraceId(_response.traceId)
      .setPagination(PaginationMapper.toDomain(_response.pagination))
      .build();
  }

  const dto = _response.data;

  // If a mapper was provided, it means data is EXPECTED
  if (mapper) {
    if (!dto) {
      throw ServiceResult.builder<TDTO>()
        .setSuccess(false)
        .setMessage("Expected data is unavailable")
        .setCode("data_unavailable")
        .setTimestamp(_response.timestamp)
        .setTraceId(_response.traceId)
        .build();
    }

    return ServiceResult.builder<TDomain>()
      .setSuccess(_response.success)
      .setMessage(_response.message)
      .setData(mapper(dto))
      .setCode(_response.code)
      .setTimestamp(_response.timestamp)
      .setTraceId(_response.traceId)
      .setPagination(PaginationMapper.toDomain(_response.pagination))
      .build();
  }

  // If NO mapper was provided, no data is expected (e.g., DELETE)
  return ServiceResult.builder<null>()
    .setSuccess(_response.success)
    .setMessage(_response.message)
    .setData(null)
    .setCode(_response.code)
    .setTimestamp(_response.timestamp)
    .setTraceId(_response.traceId)
    .setPagination(PaginationMapper.toDomain(_response.pagination))
    .build() as ServiceResult<TDomain | null>;
}

/**
 * Wrapper for handling Axios HTTP errors.
 * Transforms Axios errors into ServiceResult
 *
 * @param error - Caught error
 * @throws ServiceResult with error information
 */
export function handleAPIError<TDTO>(error: unknown): never {
  // If it's already a ServiceResult, let it pass through
  if (error instanceof ServiceResult) {
    throw error;
  }

  // If it's an HTTP error (400, 500, etc.), backend also responds with APIResponse
  if (isAxiosError(error) && error.response?.data) {
    const _error = error.response.data as APIResponse<TDTO>;

    throw ServiceResult.builder<TDTO>()
      .setSuccess(_error.success)
      .setMessage(_error.message)
      .setData(_error.data)
      .setCode(_error.code)
      .setTimestamp(_error.timestamp)
      .setTraceId(_error.traceId)
      .setPagination(PaginationMapper.toDomain(_error.pagination))
      .build();
  }

  // Unexpected error (network, timeout, etc.)
  throw ServiceResult.builder()
    .setSuccess(false)
    .setMessage("Server communication error")
    .setCode("network_error")
    .setTimestamp(new Date().toISOString())
    .build();
}
