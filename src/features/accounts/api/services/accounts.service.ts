import type {
  CreateAccountDTO,
  TransferAccountDTO,
  TransferResultDTO,
  UpdateAccountDTO,
} from "@/features/accounts/api/dtos/account-mutation.dto";
import type { AccountListItemDTO, AccountBalanceSummaryDTO, MovementDTO } from "@/features/accounts/api/dtos/account.dto";
import type {
  CreateAccountCommand,
  DeleteAccountCommand,
  TransferAccountCommand,
  UpdateAccountCommand,
} from "@/features/accounts/application/commands/account.commands";
import type { Account, AccountMovement } from "@/features/accounts/application/entities/account.entity";
import type { ListQueryParams } from "@/lib/api/api.types";
import { AccountMapper, MovementMapper } from "@/features/accounts/api/mappers/account.mapper";
import { ServiceResult } from "@/features/common/services/service-result";
import { coreApi } from "@/lib/api/api";
import {
  apiDelete,
  apiGet,
  apiGetList,
  apiGetRaw,
  apiPatch,
  apiPost,
} from "@/lib/api/http.service";
import { formatCurrencyDisplay } from "@/lib/utils/currency.utils";

export class AccountsService {
  public static GET_ACCOUNTS_KEY = "get_accounts_key";
  public static GET_ACCOUNT_KEY = "get_account_key";
  public static GET_MOVEMENTS_KEY = "get_account_movements_key";
  public static GET_BALANCE_SUMMARY_KEY = "get_accounts_balance_summary_key";
  public static CREATE_ACCOUNT_KEY = "create_account_key";
  public static UPDATE_ACCOUNT_KEY = "update_account_key";
  public static DELETE_ACCOUNT_KEY = "delete_account_key";
  public static TRANSFER_ACCOUNT_KEY = "transfer_account_key";

  public static async list(
    params?: ListQueryParams,
  ): Promise<ServiceResult<Account[]>> {
    return apiGetList<AccountListItemDTO, Account>(
      coreApi,
      "/accounts",
      AccountMapper.toDomainList,
      params,
    );
  }

  public static async getById(
    accountId: string,
    params?: Pick<ListQueryParams, "countryCode">,
  ): Promise<ServiceResult<Account>> {
    return apiGet<AccountListItemDTO, Account>(
      coreApi,
      `/accounts/${accountId}`,
      AccountMapper.toDomain,
      params,
    );
  }

  public static async listMovements(
    accountId: string,
    params?: ListQueryParams,
  ): Promise<ServiceResult<AccountMovement[]>> {
    return apiGetList<MovementDTO, AccountMovement>(
      coreApi,
      `/accounts/${accountId}/movements`,
      MovementMapper.toDomainList,
      params,
    );
  }

  public static async getBalanceSummary(
    params?: Pick<ListQueryParams, "countryCode">,
  ): Promise<ServiceResult<string>> {
    const result = await apiGetRaw<AccountBalanceSummaryDTO>(
      coreApi,
      "/accounts/summary/balance",
      params,
    );

    if (!result.data) {
      return ServiceResult.builder<string>()
        .setSuccess(result.success)
        .setMessage(result.message)
        .setData("$0,00")
        .setCode(result.code)
        .setTimestamp(result.timestamp)
        .setTraceId(result.traceId)
        .build();
    }

    const primary = result.data.byCurrency[0];
    const formatted = primary
      ? formatCurrencyDisplay(primary.totalBalance, primary.currency)
      : formatCurrencyDisplay(result.data.totalBalance);

    return ServiceResult.builder<string>()
      .setSuccess(result.success)
      .setMessage(result.message)
      .setData(formatted)
      .setCode(result.code)
      .setTimestamp(result.timestamp)
      .setTraceId(result.traceId)
      .build();
  }

  public static async create(command: CreateAccountCommand): Promise<ServiceResult<Account>> {
    const dto: CreateAccountDTO = {
      name: command.name,
      currency: command.currency,
      countryCode: command.countryCode,
    };
    return apiPost<AccountListItemDTO, Account>(
      coreApi,
      "/accounts",
      dto,
      AccountMapper.toDomain,
    );
  }

  public static async update(command: UpdateAccountCommand): Promise<ServiceResult<Account>> {
    const dto: UpdateAccountDTO = {
      name: command.name,
      totp: command.totp,
    };
    return apiPatch<AccountListItemDTO, Account>(
      coreApi,
      `/accounts/${command.accountId}`,
      dto,
      AccountMapper.toDomain,
    );
  }

  public static async delete(command: DeleteAccountCommand): Promise<ServiceResult<Account>> {
    return apiDelete<AccountListItemDTO, Account>(
      coreApi,
      `/accounts/${command.accountId}`,
      AccountMapper.toDomain,
    );
  }

  public static async transfer(
    command: TransferAccountCommand,
  ): Promise<ServiceResult<TransferResultDTO>> {
    const dto: TransferAccountDTO = {
      toAccountId: command.toAccountId,
      amount: command.amount,
      totp: command.totp,
    };
    return apiPost<TransferResultDTO, TransferResultDTO>(
      coreApi,
      `/accounts/${command.fromAccountId}/transfer`,
      dto,
      (result) => result,
    );
  }
}
