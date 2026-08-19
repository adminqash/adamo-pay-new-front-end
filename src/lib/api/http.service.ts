import { handleAPIError, handleAPIResponse } from "./api.utils";
import { buildQueryParams } from "./query-params";
import type { APIResponse } from "./api.types";
import { ServiceResult } from "@/features/common/services/service-result";
import { isAxiosError, type AxiosInstance } from "axios";

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

function extractFileName(contentDisposition: string | undefined, fallback: string): string {
  const match = contentDisposition?.match(/filename="?([^"; ]+)"?/i);
  return match?.[1] ?? fallback;
}

/**
 * Downloads a file response (not the standard JSON envelope). With
 * responseType:"blob", axios also returns error bodies as a Blob instead of
 * parsed JSON, so failures are handled separately here rather than reusing
 * handleAPIError, which expects `error.response.data` to already be JSON.
 */
async function assertDownloadBlob(blob: Blob): Promise<void> {
  const header = new Uint8Array(await blob.slice(0, 2).arrayBuffer());
  if (header[0] === 0x50 && header[1] === 0x4b) {
    return;
  }

  const text = await blob.text();
  try {
    const parsed = JSON.parse(text) as APIResponse<unknown>;
    throw ServiceResult.builder()
      .setSuccess(false)
      .setMessage(parsed.message ?? "Download failed")
      .setCode(parsed.code ?? null)
      .setTimestamp(parsed.timestamp ?? new Date().toISOString())
      .build();
  } catch (error) {
    if (error instanceof ServiceResult) {
      throw error;
    }
    throw ServiceResult.builder()
      .setSuccess(false)
      .setMessage("Download failed")
      .setCode("download_error")
      .setTimestamp(new Date().toISOString())
      .build();
  }
}

export async function apiDownload(
  client: AxiosInstance,
  path: string,
  fallbackFileName = "download",
): Promise<{ blob: Blob, fileName: string }> {
  try {
    const response = await client.get(path, {
      responseType: "blob",
      headers: {
        Accept: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/octet-stream",
      },
    });
    const blob = response.data as Blob;
    await assertDownloadBlob(blob);
    return {
      blob,
      fileName: extractFileName(response.headers?.["content-disposition"], fallbackFileName),
    };
  } catch(error) {
    if (error instanceof ServiceResult) {
      throw error;
    }
    if (isAxiosError(error) && error.response?.data instanceof Blob) {
      try {
        const text = await error.response.data.text();
        const parsed = JSON.parse(text) as APIResponse<unknown>;
        throw ServiceResult.builder()
          .setSuccess(false)
          .setMessage(parsed.message ?? "Download failed")
          .setCode(parsed.code ?? null)
          .setTimestamp(parsed.timestamp ?? new Date().toISOString())
          .build();
      } catch {
        throw ServiceResult.builder()
          .setSuccess(false)
          .setMessage("Download failed")
          .setCode("download_error")
          .setTimestamp(new Date().toISOString())
          .build();
      }
    }
    handleAPIError(error);
  }
}
