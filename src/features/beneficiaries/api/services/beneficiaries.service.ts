import type {
  BankAccountListItemDTO,
  BeneficiaryDetailDTO,
  BeneficiaryListItemDTO,
  CardMovementDTO,
} from "@/features/beneficiaries/api/dtos/beneficiary.dto";
import type {
  CreateBankAccountDTO,
  CreateBeneficiaryDTO,
  UpdateBankAccountDTO,
  UpdateBeneficiaryDTO,
} from "@/features/beneficiaries/api/dtos/beneficiary-mutation.dto";
import type {
  BankAccount,
  Beneficiary,
  BeneficiaryDetail,
  BeneficiaryTransaction,
  CardMovement,
} from "@/features/beneficiaries/application/entities/beneficiary.entity";
import type {
  CreateBankAccountCommand,
  CreateBeneficiaryCommand,
  DeleteBankAccountCommand,
  SetPrimaryBankAccountCommand,
  UpdateBankAccountCommand,
  UpdateBeneficiaryCommand,
} from "@/features/beneficiaries/application/commands/beneficiary.commands";
import type { ServiceResult } from "@/features/common/services/service-result";
import type { PaymentListItemDTO } from "@/features/transactions/api/dtos/payment.dto";
import type { APIResponse, ListQueryParams } from "@/lib/api/api.types";
import {
  BankAccountMapper,
  BeneficiaryMapper,
  BeneficiaryTransactionMapper,
  CardMovementMapper,
} from "@/features/beneficiaries/api/mappers/beneficiary.mapper";
import { beneficiariesApi } from "@/lib/api/api";
import { handleAPIError, handleAPIResponse } from "@/lib/api/api.utils";
import { apiDelete, apiGetList, apiPatch, apiPost } from "@/lib/api/http.service";
import { mapFormAccountTypeToApi } from "@/features/beneficiaries/application/utils/beneficiary-form.utils";

export class BeneficiariesService {
  public static GET_BENEFICIARIES_KEY = "get_beneficiaries_key";
  public static GET_BENEFICIARY_KEY = "get_beneficiary_key";
  public static GET_BANK_ACCOUNTS_KEY = "get_bank_accounts_key";
  public static GET_TRANSACTIONS_KEY = "get_beneficiary_transactions_key";
  public static GET_CARD_MOVEMENTS_KEY = "get_card_movements_key";
  public static CREATE_BENEFICIARY_KEY = "create_beneficiary_key";
  public static UPDATE_BENEFICIARY_KEY = "update_beneficiary_key";
  public static CREATE_BANK_ACCOUNT_KEY = "create_bank_account_key";
  public static UPDATE_BANK_ACCOUNT_KEY = "update_bank_account_key";
  public static DELETE_BANK_ACCOUNT_KEY = "delete_bank_account_key";
  public static SET_PRIMARY_BANK_ACCOUNT_KEY = "set_primary_bank_account_key";

  public static async list(
    params?: ListQueryParams,
  ): Promise<ServiceResult<Beneficiary[]>> {
    return apiGetList<BeneficiaryListItemDTO, Beneficiary>(
      beneficiariesApi,
      "/beneficiaries",
      BeneficiaryMapper.toDomainList,
      params,
    );
  }

  public static async getById(
    beneficiaryId: string,
  ): Promise<ServiceResult<BeneficiaryDetail>> {
    try {
      const [beneficiaryResponse, bankAccountsResponse] = await Promise.all([
        beneficiariesApi.get<APIResponse<BeneficiaryDetailDTO>>(
          `/beneficiaries/${beneficiaryId}`,
        ),
        beneficiariesApi.get<APIResponse<BankAccountListItemDTO[]>>(
          `/beneficiaries/${beneficiaryId}/bank-accounts`,
          { params: { limit: 10 } },
        ),
      ]);

      const beneficiaryResult = await handleAPIResponse(
        beneficiaryResponse,
        (dto) => dto,
      );
      const bankAccountsResult = await handleAPIResponse(
        bankAccountsResponse,
        (dtos) => dtos,
      );

      if (!beneficiaryResult.data) {
        return beneficiaryResult as unknown as ServiceResult<BeneficiaryDetail>;
      }

      const bankAccounts = bankAccountsResult.data ?? [];
      const primaryBank = bankAccounts.find((account) => account.isPrimary)
        ?? bankAccounts[0];

      return {
        ...beneficiaryResult,
        data: BeneficiaryMapper.toDetail(beneficiaryResult.data, primaryBank),
      };
    } catch(error) {
      handleAPIError(error);
    }
  }

  public static async listBankAccounts(
    beneficiaryId: string,
    params?: ListQueryParams,
  ): Promise<ServiceResult<BankAccount[]>> {
    return apiGetList<BankAccountListItemDTO, BankAccount>(
      beneficiariesApi,
      `/beneficiaries/${beneficiaryId}/bank-accounts`,
      BankAccountMapper.toDomainList,
      params,
    );
  }

  public static async listTransactions(
    beneficiaryId: string,
    params?: ListQueryParams,
  ): Promise<ServiceResult<BeneficiaryTransaction[]>> {
    return apiGetList<PaymentListItemDTO, BeneficiaryTransaction>(
      beneficiariesApi,
      `/beneficiaries/${beneficiaryId}/transactions`,
      BeneficiaryTransactionMapper.toDomainList,
      params,
    );
  }

  public static async listCardMovements(
    beneficiaryId: string,
    cardId: string,
    params?: ListQueryParams,
  ): Promise<ServiceResult<CardMovement[]>> {
    return apiGetList<CardMovementDTO, CardMovement>(
      beneficiariesApi,
      `/beneficiaries/${beneficiaryId}/cards/${cardId}/movements`,
      CardMovementMapper.toDomainList,
      params,
    );
  }

  public static async create(
    command: CreateBeneficiaryCommand,
  ): Promise<ServiceResult<Beneficiary>> {
    const dto: CreateBeneficiaryDTO = {
      documentType: command.documentType,
      documentNumber: command.documentNumber,
      firstName: command.firstName,
      lastName: command.lastName,
      accountType: mapFormAccountTypeToApi(command.accountType),
      bank: command.bank,
      accountNumber: command.accountNumber,
      isMainAccount: command.isMainAccount,
    };

    return apiPost<BeneficiaryDetailDTO, Beneficiary>(
      beneficiariesApi,
      "/beneficiaries",
      dto,
      (detail) => BeneficiaryMapper.toDomain(detail),
    );
  }

  public static async update(
    command: UpdateBeneficiaryCommand,
  ): Promise<ServiceResult<BeneficiaryDetail>> {
    const dto: UpdateBeneficiaryDTO = {
      fullName: command.fullName,
      idType: command.idType,
      idNumber: command.idNumber,
      totp: command.totp,
    };

    return apiPatch<BeneficiaryDetailDTO, BeneficiaryDetail>(
      beneficiariesApi,
      `/beneficiaries/${command.beneficiaryId}`,
      dto,
      (detail) => BeneficiaryMapper.toDetail(detail),
    );
  }

  public static async createBankAccount(
    command: CreateBankAccountCommand,
  ): Promise<ServiceResult<BankAccount>> {
    const dto: CreateBankAccountDTO = {
      accountType: mapFormAccountTypeToApi(command.accountType),
      bank: command.bank,
      accountNumber: command.accountNumber,
      isPrimary: command.isPrimary,
    };

    return apiPost<BankAccountListItemDTO, BankAccount>(
      beneficiariesApi,
      `/beneficiaries/${command.beneficiaryId}/bank-accounts`,
      dto,
      BankAccountMapper.toDomain,
    );
  }

  public static async updateBankAccount(
    command: UpdateBankAccountCommand,
  ): Promise<ServiceResult<BankAccount>> {
    const dto: UpdateBankAccountDTO = {
      accountType: command.accountType
        ? mapFormAccountTypeToApi(command.accountType)
        : undefined,
      bank: command.bank,
      accountNumber: command.accountNumber,
      isPrimary: command.isPrimary,
      totp: command.totp,
    };

    return apiPatch<BankAccountListItemDTO, BankAccount>(
      beneficiariesApi,
      `/beneficiaries/${command.beneficiaryId}/bank-accounts/${command.bankAccountId}`,
      dto,
      BankAccountMapper.toDomain,
    );
  }

  public static async deleteBankAccount(
    command: DeleteBankAccountCommand,
  ): Promise<ServiceResult<BankAccount>> {
    return apiDelete<BankAccountListItemDTO, BankAccount>(
      beneficiariesApi,
      `/beneficiaries/${command.beneficiaryId}/bank-accounts/${command.bankAccountId}`,
      BankAccountMapper.toDomain,
    );
  }

  public static async setPrimaryBankAccount(
    command: SetPrimaryBankAccountCommand,
  ): Promise<ServiceResult<BankAccount>> {
    return apiPatch<BankAccountListItemDTO, BankAccount>(
      beneficiariesApi,
      `/beneficiaries/${command.beneficiaryId}/bank-accounts/${command.bankAccountId}/set-primary`,
      {},
      BankAccountMapper.toDomain,
    );
  }
}
