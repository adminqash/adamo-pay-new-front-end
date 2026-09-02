import type { ServiceResult } from "@/features/common/services/service-result";
import type { PaymentListItemDTO } from "@/features/transactions/api/dtos/payment.dto";
import type {
  PaymentDetailDTO,
  PaymentTimelineDTO,
} from "@/features/transactions/api/dtos/payment-detail.dto";
import type { PaymentStatusSummaryDTO } from "@/features/transactions/api/dtos/payment-summary.dto";
import type {
  CorrectPaymentCommand,
  CreatePaymentCommand,
  UpdatePaymentStatusCommand,
} from "@/features/transactions/application/commands/payment.commands";
import type { Transaction } from "@/features/transactions/application/entities/transaction.entity";
import type { TransactionDetail } from "@/features/transactions/application/entities/transaction-detail.entity";
import type { APIResponse, ListQueryParams } from "@/lib/api/api.types";
import { PaymentMapper } from "@/features/transactions/api/mappers/payment.mapper";
import { PaymentDetailMapper } from "@/features/transactions/api/mappers/payment-detail.mapper";
import { coreApi } from "@/lib/api/api";
import { handleAPIError, handleAPIResponse } from "@/lib/api/api.utils";
import { apiGetList, apiGetRaw, apiPatch } from "@/lib/api/http.service";

export class PaymentsService {
  public static GET_PAYMENTS_KEY = "get_payments_key";
  public static CREATE_PAYMENT_KEY = "create_payment_key";
  public static CORRECT_PAYMENT_KEY = "correct_payment_key";
  public static UPDATE_PAYMENT_STATUS_KEY = "update_payment_status_key";
  public static DOWNLOAD_RECEIPT_KEY = "download_receipt_key";

  private static idempotencyHeaders() {
    return {
      headers: {
        "Idempotency-Key": crypto.randomUUID(),
      },
    };
  }

  public static async list(
    params?: ListQueryParams,
  ): Promise<ServiceResult<Transaction[]>> {
    return apiGetList<PaymentListItemDTO, Transaction>(
      coreApi,
      "/payments",
      PaymentMapper.toDomainList,
      params,
    );
  }

  public static async getStatusSummary(): Promise<ServiceResult<PaymentStatusSummaryDTO>> {
    return apiGetRaw<PaymentStatusSummaryDTO>(coreApi, "/payments/summary");
  }

  public static async getDetailDto(
    paymentId: string,
  ): Promise<ServiceResult<PaymentDetailDTO>> {
    return apiGetRaw<PaymentDetailDTO>(coreApi, `/payments/${paymentId}`);
  }

  public static async getById(
    paymentId: string,
    options?: { includeTimeline?: boolean },
  ): Promise<ServiceResult<TransactionDetail>> {
    const includeTimeline = options?.includeTimeline === true;
    const detailResult = await apiGetRaw<PaymentDetailDTO>(
      coreApi,
      `/payments/${paymentId}`,
    );

    if (!detailResult?.data) {
      throw new Error("Payment detail not found");
    }

    let timelineData: PaymentTimelineDTO | undefined;
    if (includeTimeline) {
      const timelineResult = await apiGetRaw<PaymentTimelineDTO>(
        coreApi,
        `/payments/${paymentId}/timeline`,
      );
      timelineData = timelineResult?.data ?? undefined;
    }

    return {
      ...detailResult,
      data: PaymentDetailMapper.toDomain(detailResult.data, timelineData),
    };
  }

  public static async create(
    command: CreatePaymentCommand,
  ): Promise<ServiceResult<TransactionDetail>> {
    try {
      const response = await coreApi.post<APIResponse<PaymentDetailDTO>>(
        "/payments",
        command,
        PaymentsService.idempotencyHeaders(),
      );

      return handleAPIResponse(response, (dto) => PaymentDetailMapper.toDomain(dto));
    } catch(error) {
      handleAPIError(error);
    }
  }

  public static async correct(
    command: CorrectPaymentCommand,
  ): Promise<ServiceResult<TransactionDetail>> {
    const { paymentId, ...body } = command;

    return apiPatch<PaymentDetailDTO, TransactionDetail>(
      coreApi,
      `/payments/${paymentId}/correct`,
      body,
      (dto) => PaymentDetailMapper.toDomain(dto),
    );
  }

  public static async updateStatus(
    command: UpdatePaymentStatusCommand,
  ): Promise<ServiceResult<TransactionDetail>> {
    return apiPatch<PaymentDetailDTO, TransactionDetail>(
      coreApi,
      `/payments/${command.paymentId}/status`,
      { status: command.status },
      (dto) => PaymentDetailMapper.toDomain(dto),
    );
  }

  public static async downloadReceipt(paymentId: string): Promise<void> {
    const result = await apiGetRaw<{ url: string }>(
      coreApi,
      `/payments/${paymentId}/receipt`,
    );
    const url = result.data?.url;
    if (!url) {
      throw new Error("Receipt URL not found");
    }
    window.open(url, "_blank", "noopener,noreferrer");
  }
}
