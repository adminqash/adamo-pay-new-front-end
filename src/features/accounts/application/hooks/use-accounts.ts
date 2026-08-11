import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import type {
  CreateAccountCommand,
  DeleteAccountCommand,
  TransferAccountCommand,
  UpdateAccountCommand,
} from "@/features/accounts/application/commands/account.commands";
import type { ListQueryParams } from "@/lib/api/api.types";
import { AccountsService } from "@/features/accounts/api/services/accounts.service";
import { useCountry } from "@/features/common/contexts/use-country";
import { withCountryScope } from "@/lib/country/country-code";
import { listQueryDefaults } from "@/lib/query/defaults";
import { queryKeys } from "@/lib/query/query-keys";

export function useAccounts(params?: ListQueryParams) {
  const { t } = useTranslation(["accounts"]);
  const { countryCode } = useCountry();

  const accountsQuery = useQuery({
    queryKey: withCountryScope(queryKeys.accounts.all(params), countryCode),
    queryFn: () => AccountsService.list(params),
    ...listQueryDefaults,
    meta: {
      showMessageOnSuccess: false,
      errorMessage: t("accounts:errors.load_failed", { defaultValue: "Error al cargar cuentas" }),
    },
  });

  const balanceQuery = useQuery({
    queryKey: withCountryScope(queryKeys.accounts.balanceSummary, countryCode),
    queryFn: () => AccountsService.getBalanceSummary(),
    ...listQueryDefaults,
    meta: { showMessageOnSuccess: false, showMessageOnError: false },
  });

  return {
    accounts: accountsQuery.data?.data ?? [],
    totalCount: accountsQuery.data?.pagination?.total ?? 0,
    totalBalance: balanceQuery.data?.data ?? "$0,00",
    isLoading: accountsQuery.isLoading || balanceQuery.isLoading,
    error: accountsQuery.error ?? balanceQuery.error,
    refetch: accountsQuery.refetch,
  };
}

export function useAccount(accountId: string) {
  const { t } = useTranslation(["accounts"]);
  const { countryCode } = useCountry();

  const query = useQuery({
    queryKey: withCountryScope(queryKeys.accounts.detail(accountId), countryCode),
    queryFn: () => AccountsService.getById(accountId),
    enabled: Boolean(accountId),
    ...listQueryDefaults,
    meta: {
      showMessageOnSuccess: false,
      errorMessage: t("accounts:errors.load_failed", { defaultValue: "Error al cargar cuenta" }),
    },
  });

  return {
    account: query.data?.data,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

export function useAccountMovements(accountId: string, params?: ListQueryParams) {
  const { t } = useTranslation(["accounts"]);
  const { countryCode } = useCountry();

  const query = useQuery({
    queryKey: withCountryScope(queryKeys.accounts.movements(accountId, params), countryCode),
    queryFn: () => AccountsService.listMovements(accountId, params),
    enabled: Boolean(accountId),
    ...listQueryDefaults,
    meta: {
      showMessageOnSuccess: false,
      errorMessage: t("accounts:errors.movements_failed", { defaultValue: "Error al cargar movimientos" }),
    },
  });

  return {
    movements: query.data?.data ?? [],
    totalCount: query.data?.pagination?.total ?? 0,
    page: query.data?.pagination?.page ?? params?.page ?? 1,
    pages: query.data?.pagination?.pages ?? 1,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

function invalidateAccounts(queryClient: ReturnType<typeof useQueryClient>) {
  void queryClient.invalidateQueries({ queryKey: ["accounts"] });
}

export function useCreateAccount() {
  const queryClient = useQueryClient();
  const { t } = useTranslation(["accounts"]);

  return useMutation({
    mutationKey: [AccountsService.CREATE_ACCOUNT_KEY],
    mutationFn: (command: CreateAccountCommand) => AccountsService.create(command),
    meta: {
      successMessage: t("accounts:messages.account_created"),
      errorMessage: t("accounts:errors.create_failed", { defaultValue: "Error al crear cuenta" }),
    },
    onSuccess: () => invalidateAccounts(queryClient),
  });
}

export function useUpdateAccount() {
  const queryClient = useQueryClient();
  const { t } = useTranslation(["accounts"]);

  return useMutation({
    mutationKey: [AccountsService.UPDATE_ACCOUNT_KEY],
    mutationFn: (command: UpdateAccountCommand) => AccountsService.update(command),
    meta: {
      successMessage: t("accounts:messages.name_updated"),
      errorMessage: t("accounts:errors.update_failed", { defaultValue: "Error al actualizar cuenta" }),
    },
    onSuccess: (_data, variables) => {
      invalidateAccounts(queryClient);
      void queryClient.invalidateQueries({
        queryKey: queryKeys.accounts.detail(variables.accountId),
      });
    },
  });
}

export function useDeleteAccount() {
  const queryClient = useQueryClient();
  const { t } = useTranslation(["accounts"]);

  return useMutation({
    mutationKey: [AccountsService.DELETE_ACCOUNT_KEY],
    mutationFn: (command: DeleteAccountCommand) => AccountsService.delete(command),
    meta: {
      successMessage: t("accounts:messages.account_deleted"),
      errorMessage: t("accounts:errors.delete_failed", { defaultValue: "Error al eliminar cuenta" }),
    },
    onSuccess: () => invalidateAccounts(queryClient),
  });
}

export function useTransferAccount() {
  const queryClient = useQueryClient();
  const { t } = useTranslation(["accounts"]);

  return useMutation({
    mutationKey: [AccountsService.TRANSFER_ACCOUNT_KEY],
    mutationFn: (command: TransferAccountCommand) => AccountsService.transfer(command),
    meta: {
      successMessage: t("accounts:messages.transfer_success"),
      errorMessage: t("accounts:errors.transfer_failed", { defaultValue: "Error al transferir" }),
    },
    onSuccess: (_data, variables) => {
      invalidateAccounts(queryClient);
      void queryClient.invalidateQueries({
        queryKey: queryKeys.accounts.detail(variables.fromAccountId),
      });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.accounts.detail(variables.toAccountId),
      });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.accounts.movements(variables.fromAccountId),
      });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.accounts.movements(variables.toAccountId),
      });
    },
  });
}
