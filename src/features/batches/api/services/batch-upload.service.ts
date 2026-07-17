import i18next from "i18next";
import type { ServiceResult } from "@/features/common/services/service-result";
import type { APIResponse } from "@/lib/api/api.types";
import type { AxiosResponse } from "axios";
import { handleAPIError, handleAPIResponse } from "@/lib/api/api.utils";
import { apiUrls, env } from "@/lib/env";

export type BatchUploadAcceptedDTO = {
  uploadId: string
  batchId: string
  status: "accepted"
  fileName: string
  sizeBytes: number
  requestId?: string
};

export type BatchUploadStatusDTO = {
  uploadId: string
  batchId: string
  status:
    | "accepted"
    | "uploading"
    | "parsing"
    | "ingesting"
    | "completed"
    | "failed"
  progress: number
  fileName: string
  fileId: string | null
  errorMessage: string | null
  summary: {
    totalItems: number
    validItems: number
    invalidItems: number
    totalAmount: number
    currency: string
  } | null
};

export type UploadBatchFileCommand = {
  batchId: string
  file: File
};

export class BatchUploadService {
  public static UPLOAD_BATCH_FILE_KEY = "upload_batch_file_key";
  public static GET_UPLOAD_STATUS_KEY = "get_upload_status_key";

  private static authHeaders(requestId?: string): Record<string, string> {
    const headers: Record<string, string> = {
      Accept: "application/json",
      "Accept-Language": i18next.language,
      "X-Request-ID": requestId ?? crypto.randomUUID(),
    };

    if (env.VITE_API_BEARER_TOKEN) {
      headers.Authorization = `Bearer ${env.VITE_API_BEARER_TOKEN}`;
    }

    return headers;
  }

  public static async upload(
    command: UploadBatchFileCommand,
  ): Promise<ServiceResult<BatchUploadAcceptedDTO>> {
    try {
      const formData = new FormData();
      formData.append("file", command.file);
      formData.append("batchId", command.batchId);
      const requestId = crypto.randomUUID();

      const response = await fetch(`${apiUrls.realtime}/batches/upload`, {
        method: "POST",
        body: formData,
        credentials: "include",
        headers: this.authHeaders(requestId),
      });

      const payload = (await response.json()) as APIResponse<BatchUploadAcceptedDTO>;

      if (!response.ok) {
        throw payload;
      }

      const result = await handleAPIResponse(
        { data: payload } as AxiosResponse<APIResponse<BatchUploadAcceptedDTO>>,
        (data) => ({
          ...data,
          requestId: payload.meta?.requestId ?? requestId,
        }),
      );

      return result;
    } catch(error) {
      if (
        error
        && typeof error === "object"
        && "success" in error
        && "message" in error
      ) {
        throw error;
      }
      handleAPIError(error);
    }
  }

  public static async getUploadStatus(
    uploadId: string,
  ): Promise<ServiceResult<BatchUploadStatusDTO>> {
    try {
      const response = await fetch(`${apiUrls.realtime}/batches/upload/${uploadId}`, {
        method: "GET",
        credentials: "include",
        headers: this.authHeaders(),
      });

      const payload = (await response.json()) as APIResponse<BatchUploadStatusDTO>;

      if (!response.ok) {
        throw payload;
      }

      return handleAPIResponse(
        { data: payload } as AxiosResponse<APIResponse<BatchUploadStatusDTO>>,
        (data) => data,
      );
    } catch(error) {
      if (
        error
        && typeof error === "object"
        && "success" in error
        && "message" in error
      ) {
        throw error;
      }
      handleAPIError(error);
    }
  }
}
