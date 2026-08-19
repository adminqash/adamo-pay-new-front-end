import type { BatchTimelineDTO } from "@/features/batches/api/dtos/batch-timeline.dto";
import type { BatchTransactionDTO } from "@/features/batches/api/dtos/batch-transaction.dto";
import type { BatchListItemDTO } from "@/features/batches/api/dtos/batch.dto";
import type {
  CreateBatchCommand,
  ProcessBatchCommand,
  UpdateBatchCommand,
  UpdateBatchTransactionCommand,
  UpdateBatchTransactionStatusCommand,
} from "@/features/batches/application/commands/batch.commands";
import type { BatchTransactionDetail } from "@/features/batches/application/entities/batch-transaction-detail.entity";
import type { Batch } from "@/features/batches/application/entities/batch.entity";
import type { ServiceResult } from "@/features/common/services/service-result";
import type { TransactionTimelineItem } from "@/features/transactions/application/entities/transaction-detail.entity";
import type { Transaction } from "@/features/transactions/application/entities/transaction.entity";
import type { APIResponse, ListQueryParams } from "@/lib/api/api.types";
import { BatchTimelineMapper } from "@/features/batches/api/mappers/batch-timeline.mapper";
import { BatchTransactionDetailMapper } from "@/features/batches/api/mappers/batch-transaction-detail.mapper";
import { BatchTransactionMapper } from "@/features/batches/api/mappers/batch-transaction.mapper";
import { BatchMapper } from "@/features/batches/api/mappers/batch.mapper";
import { coreApi } from "@/lib/api/api";
import { handleAPIError, handleAPIResponse } from "@/lib/api/api.utils";
import { apiDownload, apiGet, apiGetList, apiGetRaw, apiPatch, apiPost } from "@/lib/api/http.service";
import { triggerBrowserDownload } from "@/lib/utils/file.utils";

export class BatchesService {
  public static GET_BATCHES_KEY = "get_batches_key";
  public static GET_BATCH_KEY = "get_batch_key";
  public static CREATE_BATCH_KEY = "create_batch_key";
  public static PROCESS_BATCH_KEY = "process_batch_key";
  public static UPDATE_BATCH_KEY = "update_batch_key";
  public static UPDATE_BATCH_TRANSACTION_KEY = "update_batch_transaction_key";
  public static UPDATE_BATCH_TRANSACTION_STATUS_KEY = "update_batch_transaction_status_key";
  public static GET_BATCH_TEMPLATE_KEY = "get_batch_template_key";

  private static idempotencyHeaders() {
    return {
      headers: {
        "Idempotency-Key": crypto.randomUUID(),
      },
    };
  }

  public static async downloadTemplate(): Promise<void> {
    const { blob, fileName } = await apiDownload(
      coreApi,
      "/batches/template",
      "plantilla-lote-pagos.xlsx",
    );
    triggerBrowserDownload(blob, fileName);
  }

  public static async list(
    params?: ListQueryParams,
  ): Promise<ServiceResult<Batch[]>> {
    return apiGetList<BatchListItemDTO, Batch>(
      coreApi,
      "/batches",
      BatchMapper.toDomainList,
      params,
    );
  }

  public static async getById(
    batchId: string,
    params?: Pick<ListQueryParams, "countryCode">,
  ): Promise<ServiceResult<Batch>> {
    return apiGet<BatchListItemDTO, Batch>(
      coreApi,
      `/batches/${batchId}`,
      BatchMapper.toDomain,
      params,
    );
  }

  public static async create(
    command: CreateBatchCommand,
  ): Promise<ServiceResult<Batch>> {
    try {
      const response = await coreApi.post<APIResponse<BatchListItemDTO>>(
        "/batches",
        command,
        BatchesService.idempotencyHeaders(),
      );

      return handleAPIResponse(response, BatchMapper.toDomain);
    } catch(error) {
      handleAPIError(error);
    }
  }

  public static async process(
    command: ProcessBatchCommand,
  ): Promise<ServiceResult<Batch>> {
    const { batchId, totp } = command;

    return apiPost<BatchListItemDTO, Batch>(
      coreApi,
      `/batches/${batchId}/process`,
      { totp },
      BatchMapper.toDomain,
    );
  }

  public static async update(
    command: UpdateBatchCommand,
  ): Promise<ServiceResult<Batch>> {
    const { batchId, ...body } = command;

    return apiPatch<BatchListItemDTO, Batch>(
      coreApi,
      `/batches/${batchId}`,
      body,
      BatchMapper.toDomain,
    );
  }

  public static async listTransactions(
    batchId: string,
    params?: ListQueryParams,
  ): Promise<ServiceResult<Transaction[]>> {
    return apiGetList<BatchTransactionDTO, Transaction>(
      coreApi,
      `/batches/${batchId}/transactions`,
      BatchTransactionMapper.toDomainList,
      params,
    );
  }

  public static async getTimeline(
    batchId: string,
    params?: Pick<ListQueryParams, "countryCode">,
  ): Promise<ServiceResult<TransactionTimelineItem[]>> {
    const result = await apiGetRaw<BatchTimelineDTO>(
      coreApi,
      `/batches/${batchId}/timeline`,
      params,
    );

    if (!result?.data) {
      throw new Error("Batch timeline not found");
    }

    return {
      ...result,
      data: BatchTimelineMapper.toDomain(result.data),
    };
  }

  public static async getTransaction(
    batchId: string,
    transactionId: string,
    params?: Pick<ListQueryParams, "countryCode">,
  ): Promise<ServiceResult<BatchTransactionDetail>> {
    return apiGet<BatchTransactionDTO, BatchTransactionDetail>(
      coreApi,
      `/batches/${batchId}/transactions/${transactionId}`,
      BatchTransactionDetailMapper.toDomain,
      params,
    );
  }

  public static async updateTransaction(
    command: UpdateBatchTransactionCommand,
  ): Promise<ServiceResult<BatchTransactionDetail>> {
    const { batchId, transactionId, rawData } = command;

    return apiPatch<BatchTransactionDTO, BatchTransactionDetail>(
      coreApi,
      `/batches/${batchId}/transactions/${transactionId}`,
      { rawData },
      BatchTransactionDetailMapper.toDomain,
    );
  }

  public static async updateTransactionStatus(
    command: UpdateBatchTransactionStatusCommand,
  ): Promise<ServiceResult<BatchTransactionDetail>> {
    const { batchId, transactionId, status } = command;

    return apiPatch<BatchTransactionDTO, BatchTransactionDetail>(
      coreApi,
      `/batches/${batchId}/transactions/${transactionId}/status`,
      { status },
      BatchTransactionDetailMapper.toDomain,
    );
  }
}
