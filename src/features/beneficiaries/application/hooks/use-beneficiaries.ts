import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import type { ListQueryParams } from "@/lib/api/api.types";
import { BeneficiariesService } from "@/features/beneficiaries/api/services/beneficiaries.service";
import type {
  CreateBankAccountCommand,
  CreateBeneficiaryCommand,
  DeleteBankAccountCommand,
  SetPrimaryBankAccountCommand,
  UpdateBankAccountCommand,
  UpdateBeneficiaryCommand,
} from "@/features/beneficiaries/application/commands/beneficiary.commands";
import { useCountry } from "@/features/common/contexts/use-country";
import { withCountryScope } from "@/lib/country/country-code";
import { listQueryDefaults } from "@/lib/query/defaults";
import { queryKeys } from "@/lib/query/query-keys";

export function useBeneficiaries(params?: ListQueryParams) {
  const { t } = useTranslation(["beneficiaries"]);
  const { countryCode } = useCountry();

  const query = useQuery({
    queryKey: withCountryScope(queryKeys.beneficiaries.all(params), countryCode),
    queryFn: () => BeneficiariesService.list(params),
    ...listQueryDefaults,
    meta: {
      showMessageOnSuccess: false,
      errorMessage: t("beneficiaries:errors.load_failed", { defaultValue: "Error al cargar beneficiarios" }),
    },
  });

  return {
    beneficiaries: query.data?.data ?? [],
    totalCount: query.data?.pagination?.total ?? 0,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

export function useBeneficiaryDetail(beneficiaryId: string) {
  const { t } = useTranslation(["beneficiaries"]);
  const { countryCode } = useCountry();

  const query = useQuery({
    queryKey: withCountryScope(queryKeys.beneficiaries.detail(beneficiaryId), countryCode),
    queryFn: () => BeneficiariesService.getById(beneficiaryId),
    enabled: Boolean(beneficiaryId),
    ...listQueryDefaults,
    meta: {
      showMessageOnSuccess: false,
      errorMessage: t("beneficiaries:errors.detail_failed", { defaultValue: "Error al cargar beneficiario" }),
    },
  });

  return {
    beneficiary: query.data?.data,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

export function useBankAccounts(beneficiaryId: string, params?: ListQueryParams) {
  const { t } = useTranslation(["beneficiaries"]);
  const { countryCode } = useCountry();

  const query = useQuery({
    queryKey: withCountryScope(queryKeys.beneficiaries.bankAccounts(beneficiaryId, params), countryCode),
    queryFn: () => BeneficiariesService.listBankAccounts(beneficiaryId, params),
    enabled: Boolean(beneficiaryId),
    ...listQueryDefaults,
    meta: {
      showMessageOnSuccess: false,
      errorMessage: t("beneficiaries:errors.bank_accounts_failed", { defaultValue: "Error al cargar cuentas bancarias" }),
    },
  });

  return {
    bankAccounts: query.data?.data ?? [],
    totalCount: query.data?.pagination?.total ?? 0,
    pages: query.data?.pagination?.pages ?? 1,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

export function useBeneficiaryTransactions(beneficiaryId: string, params?: ListQueryParams) {
  const { t } = useTranslation(["beneficiaries"]);
  const { countryCode } = useCountry();

  const query = useQuery({
    queryKey: withCountryScope(queryKeys.beneficiaries.transactions(beneficiaryId, params), countryCode),
    queryFn: () => BeneficiariesService.listTransactions(beneficiaryId, params),
    enabled: Boolean(beneficiaryId),
    ...listQueryDefaults,
    meta: {
      showMessageOnSuccess: false,
      errorMessage: t("beneficiaries:errors.transactions_failed", { defaultValue: "Error al cargar transacciones" }),
    },
  });

  return {
    transactions: query.data?.data ?? [],
    totalCount: query.data?.pagination?.total ?? 0,
    pages: query.data?.pagination?.pages ?? 1,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

export function useCardMovements(
  beneficiaryId: string,
  cardId: string,
  params?: ListQueryParams,
) {
  const { t } = useTranslation(["beneficiaries"]);
  const { countryCode } = useCountry();

  const query = useQuery({
    queryKey: withCountryScope(
      queryKeys.beneficiaries.cardMovements(beneficiaryId, cardId, params),
      countryCode,
    ),
    queryFn: () => BeneficiariesService.listCardMovements(beneficiaryId, cardId, params),
    enabled: Boolean(beneficiaryId) && Boolean(cardId),
    ...listQueryDefaults,
    meta: {
      showMessageOnSuccess: false,
      errorMessage: t("beneficiaries:errors.card_movements_failed", { defaultValue: "Error al cargar movimientos" }),
    },
  });

  return {
    movements: query.data?.data ?? [],
    totalCount: query.data?.pagination?.total ?? 0,
    isLoading: query.isLoading,
    error: query.error,
  };
}

function invalidateBeneficiaries(queryClient: ReturnType<typeof useQueryClient>) {
  void queryClient.invalidateQueries({ queryKey: ["beneficiaries"] });
}

export function useCreateBeneficiary() {
  const queryClient = useQueryClient();
  const { t } = useTranslation(["beneficiaries"]);

  return useMutation({
    mutationKey: [BeneficiariesService.CREATE_BENEFICIARY_KEY],
    mutationFn: (command: CreateBeneficiaryCommand) => BeneficiariesService.create(command),
    meta: {
      successMessage: t("beneficiaries.detail.messages.beneficiary_created"),
      errorMessage: t("beneficiaries:errors.create_failed", { defaultValue: "Error al crear beneficiario" }),
    },
    onSuccess: () => invalidateBeneficiaries(queryClient),
  });
}

export function useUpdateBeneficiary() {
  const queryClient = useQueryClient();
  const { t } = useTranslation(["beneficiaries"]);

  return useMutation({
    mutationKey: [BeneficiariesService.UPDATE_BENEFICIARY_KEY],
    mutationFn: (command: UpdateBeneficiaryCommand) => BeneficiariesService.update(command),
    meta: {
      successMessage: t("beneficiaries.detail.messages.beneficiary_updated", {
        defaultValue: "Beneficiario actualizado",
      }),
      errorMessage: t("beneficiaries:errors.update_failed", { defaultValue: "Error al actualizar beneficiario" }),
    },
    onSuccess: (_data, variables) => {
      invalidateBeneficiaries(queryClient);
      void queryClient.invalidateQueries({
        queryKey: queryKeys.beneficiaries.detail(variables.beneficiaryId),
      });
    },
  });
}

export function useCreateBankAccount() {
  const queryClient = useQueryClient();
  const { t } = useTranslation(["beneficiaries"]);

  return useMutation({
    mutationKey: [BeneficiariesService.CREATE_BANK_ACCOUNT_KEY],
    mutationFn: (command: CreateBankAccountCommand) => BeneficiariesService.createBankAccount(command),
    meta: {
      successMessage: t("beneficiaries.bank_accounts.add_success"),
      errorMessage: t("beneficiaries:errors.bank_account_create_failed", {
        defaultValue: "Error al crear cuenta bancaria",
      }),
    },
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.beneficiaries.bankAccounts(variables.beneficiaryId),
      });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.beneficiaries.detail(variables.beneficiaryId),
      });
    },
  });
}

export function useUpdateBankAccount() {
  const queryClient = useQueryClient();
  const { t } = useTranslation(["beneficiaries"]);

  return useMutation({
    mutationKey: [BeneficiariesService.UPDATE_BANK_ACCOUNT_KEY],
    mutationFn: (command: UpdateBankAccountCommand) => BeneficiariesService.updateBankAccount(command),
    meta: {
      successMessage: t("beneficiaries.bank_accounts.edit_success"),
      errorMessage: t("beneficiaries:errors.bank_account_update_failed", {
        defaultValue: "Error al actualizar cuenta bancaria",
      }),
    },
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.beneficiaries.bankAccounts(variables.beneficiaryId),
      });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.beneficiaries.detail(variables.beneficiaryId),
      });
    },
  });
}

export function useDeleteBankAccount() {
  const queryClient = useQueryClient();
  const { t } = useTranslation(["beneficiaries"]);

  return useMutation({
    mutationKey: [BeneficiariesService.DELETE_BANK_ACCOUNT_KEY],
    mutationFn: (command: DeleteBankAccountCommand) => BeneficiariesService.deleteBankAccount(command),
    meta: {
      successMessage: t("beneficiaries.bank_accounts.delete_success"),
      errorMessage: t("beneficiaries:errors.bank_account_delete_failed", {
        defaultValue: "Error al eliminar cuenta bancaria",
      }),
    },
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.beneficiaries.bankAccounts(variables.beneficiaryId),
      });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.beneficiaries.detail(variables.beneficiaryId),
      });
    },
  });
}

export function useSetPrimaryBankAccount() {
  const queryClient = useQueryClient();
  const { t } = useTranslation(["beneficiaries"]);

  return useMutation({
    mutationKey: [BeneficiariesService.SET_PRIMARY_BANK_ACCOUNT_KEY],
    mutationFn: (command: SetPrimaryBankAccountCommand) =>
      BeneficiariesService.setPrimaryBankAccount(command),
    meta: {
      successMessage: t("beneficiaries.bank_accounts.set_primary_success"),
      errorMessage: t("beneficiaries:errors.bank_account_primary_failed", {
        defaultValue: "Error al establecer cuenta principal",
      }),
    },
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.beneficiaries.bankAccounts(variables.beneficiaryId),
      });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.beneficiaries.detail(variables.beneficiaryId),
      });
    },
  });
}
