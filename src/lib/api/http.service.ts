import { handleAPIError, handleAPIResponse } from "./api.utils";
import { buildQueryParams } from "./query-params";
import type { APIResponse } from "./api.types";
import type { ServiceResult } from "@/features/common/services/service-result";
import type { AxiosInstance } from "axios";

export async function apiGet<TDTO, TDomain>(
  client: AxiosInstance,
  path: string,
  mapper: (dto: TDTO) => TDomain,
  params?: Record<string, string | number | boolean | undefined>,
): Promise<ServiceResult<TDomain>> {
  try {
    const response = await client.get<APIResponse<TDTO>>(path, {
      params: buildQueryParams(params),
    });
    return handleAPIResponse(response, mapper);
  } catch(error) {
    handleAPIError(error);
  }
}

export async function apiGetList<TDTO, TDomain>(
  client: AxiosInstance,
  path: string,
  mapper: (dtos: TDTO[]) => TDomain[],
  params?: Record<string, string | number | boolean | undefined>,
): Promise<ServiceResult<TDomain[]>> {
  try {
    const response = await client.get<APIResponse<TDTO[]>>(path, {
      params: buildQueryParams(params),
    });
    return handleAPIResponse(response, mapper);
  } catch(error) {
    handleAPIError(error);
  }
}

export async function apiGetRaw<TDTO>(
  client: AxiosInstance,
  path: string,
  params?: Record<string, string | number | boolean | undefined>,
): Promise<ServiceResult<TDTO>> {
  try {
    const response = await client.get<APIResponse<TDTO>>(path, {
      params: buildQueryParams(params),
    });
    return handleAPIResponse(response, (dto) => dto);
  } catch(error) {
    handleAPIError(error);
  }
}

export async function apiPost<TDTO, TDomain>(
  client: AxiosInstance,
  path: string,
  body: unknown,
  mapper: (dto: TDTO) => TDomain,
): Promise<ServiceResult<TDomain>> {
  try {
    const response = await client.post<APIResponse<TDTO>>(path, body);
    return handleAPIResponse(response, mapper);
  } catch(error) {
    handleAPIError(error);
  }
}

export async function apiPatch<TDTO, TDomain>(
  client: AxiosInstance,
  path: string,
  body: unknown,
  mapper: (dto: TDTO) => TDomain,
): Promise<ServiceResult<TDomain>> {
  try {
    const response = await client.patch<APIResponse<TDTO>>(path, body);
    return handleAPIResponse(response, mapper);
  } catch(error) {
    handleAPIError(error);
  }
}

export async function apiDelete<TDTO, TDomain>(
  client: AxiosInstance,
  path: string,
  mapper: (dto: TDTO) => TDomain,
): Promise<ServiceResult<TDomain>> {
  try {
    const response = await client.delete<APIResponse<TDTO>>(path);
    return handleAPIResponse(response, mapper);
  } catch(error) {
    handleAPIError(error);
  }
}
