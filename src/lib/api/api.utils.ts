import { isAxiosError, type AxiosResponse } from "axios";
import type { APIPagination, APIPaginationRaw, APIResponse } from "./api.types";
import { Pagination } from "@/features/common/services/service-pagination";
import { ServiceResult } from "@/features/common/services/service-result";

function isRawPagination(
  pagination: APIPagination | APIPaginationRaw,
): pagination is APIPaginationRaw {
  return "totalPages" in pagination;
}

/**
 * Maps API pagination (backend or legacy) to domain Pagination.
 */
export class PaginationMapper {
  public static toDomain(
    pagination: APIPagination | APIPaginationRaw | null | undefined,
  ): Pagination | null {
    if (!pagination) {
      return null;
    }

    if (isRawPagination(pagination)) {
      return Pagination.builder()
        .setTotal(pagination.total)
        .setPages(pagination.totalPages)
        .setPage(pagination.page)
        .setNext(pagination.hasNextPage ? pagination.page + 1 : null)
        .setPrevious(pagination.hasPreviousPage ? pagination.page - 1 : null)
        .build();
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

function extractCode(response: APIResponse<unknown>): string | null {
  if (response.code) return response.code;
  if (response.errors?.[0]?.code) return response.errors[0].code;
  return null;
}

function extractTraceId(response: APIResponse<unknown>): string | null {
  if (response.traceId) return response.traceId;
  if (response.meta?.requestId) return response.meta.requestId;
  return null;
}

function buildServiceResult<T>(
  response: APIResponse<unknown>,
  data: T | null,
  pagination: Pagination | null,
): ServiceResult<T> {
  return ServiceResult.builder<T>()
    .setSuccess(response.success)
    .setMessage(response.message)
    .setData(data)
    .setCode(extractCode(response))
    .setTimestamp(response.timestamp)
    .setTraceId(extractTraceId(response))
    .setPagination(pagination)
    .build();
}

/**
 * Transforms APIResponse to domain ServiceResult (with mapper - expects data).
 */
export async function handleAPIResponse<TDTO, TDomain>(
  response: AxiosResponse<APIResponse<TDTO>>,
  mapper: (dto: TDTO) => TDomain,
): Promise<ServiceResult<TDomain>>;

/**
 * Transforms APIResponse to domain ServiceResult (list mapper).
 */
export async function handleAPIResponse<TDTO, TDomain>(
  response: AxiosResponse<APIResponse<TDTO[]>>,
  mapper: (dto: TDTO[]) => TDomain[],
): Promise<ServiceResult<TDomain[]>>;

/**
 * Transforms APIResponse to domain ServiceResult (without mapper).
 */
export async function handleAPIResponse<TDTO>(
  response: AxiosResponse<APIResponse<TDTO>>,
  mapper?: undefined,
): Promise<ServiceResult<null>>;

export async function handleAPIResponse<TDTO, TDomain = null>(
  response: AxiosResponse<APIResponse<TDTO | TDTO[]>>,
  mapper?: ((dto: TDTO) => TDomain) | ((dto: TDTO[]) => TDomain[]),
): Promise<ServiceResult<TDomain | TDomain[] | null>> {
  const _response = response.data;
  const pagination = PaginationMapper.toDomain(_response.pagination);

  if (!_response.success) {
    throw buildServiceResult(_response, _response.data as TDomain | null, pagination);
  }

  const dto = _response.data;

  if (mapper) {
    if (dto === null || dto === undefined) {
      throw ServiceResult.builder<TDTO>()
        .setSuccess(false)
        .setMessage("Expected data is unavailable")
        .setCode("data_unavailable")
        .setTimestamp(_response.timestamp)
        .setTraceId(extractTraceId(_response))
        .build();
    }

    const mapped = Array.isArray(dto)
      ? (mapper as (d: TDTO[]) => TDomain[])(dto)
      : (mapper as (d: TDTO) => TDomain)(dto as TDTO);

    return buildServiceResult(_response, mapped, pagination);
  }

  return buildServiceResult<null>(_response, null, pagination);
}

/**
 * Wrapper for handling Axios HTTP errors.
 */
export function handleAPIError<TDTO>(error: unknown): never {
  if (error instanceof ServiceResult) {
    throw error;
  }

  if (isAxiosError(error) && error.response?.data) {
    const _error = error.response.data as APIResponse<TDTO>;

    throw buildServiceResult(
      _error,
      _error.data as TDTO | null,
      PaginationMapper.toDomain(_error.pagination),
    );
  }

  throw ServiceResult.builder()
    .setSuccess(false)
    .setMessage("Server communication error")
    .setCode("network_error")
    .setTimestamp(new Date().toISOString())
    .build();
}
