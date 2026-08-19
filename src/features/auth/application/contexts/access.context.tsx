import { createContext, useCallback, useContext, useMemo, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { AccessService } from "@/features/auth/api/services/access.service";
import { useAuth } from "@/features/auth/application/contexts/auth.context";
import {
  hasPermission as hasPermissionCheck,
  normalizePermissions,
  resolveAccessCapabilities,
  type AccessCapabilities,
  type PermissionMode,
} from "@/features/auth/domain/permissions";
import { isEnvJwtAuth } from "@/lib/auth/env-access-token";
import { SELECTABLE_COUNTRIES } from "@/lib/country/country-code";
import { queryKeys } from "@/lib/query/query-keys";

type AccessContextValue = {
  permissions: string[]
  capabilities: AccessCapabilities
  allowedCountries: string[]
  operatingCountries: string[]
  allowedAccountIds: string[] | null
  canChooseDebitAccount: boolean
  isLoading: boolean
  hasPermission: (required: string | string[], mode?: PermissionMode) => boolean
};

const AccessContext = createContext<AccessContextValue | undefined>(undefined);

const ACCESS_STALE_MS = 60 * 1000;
const JWT_FALLBACK_COUNTRIES = SELECTABLE_COUNTRIES.map((country) => country.alpha3);

export function AccessProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const authPermissions = useMemo(
    () => normalizePermissions(user?.permissions ?? []),
    [user?.permissions],
  );
  const query = useQuery({
    queryKey: queryKeys.auth.access,
    queryFn: AccessService.getMe,
    enabled: Boolean(user),
    staleTime: ACCESS_STALE_MS,
    gcTime: 5 * ACCESS_STALE_MS,
    retry: 1,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    meta: { showMessageOnError: false },
  });

  const remote = query.data?.data;
  const permissions = useMemo(
    () => (remote ? normalizePermissions(remote.permissions ?? []) : authPermissions),
    [authPermissions, remote],
  );
  const capabilities = useMemo(
    () => remote?.capabilities ?? resolveAccessCapabilities(permissions),
    [permissions, remote?.capabilities],
  );
  const allowedCountries = useMemo(() => {
    if (Array.isArray(remote?.allowedCountries) && remote.allowedCountries.length > 0) {
      return remote.allowedCountries;
    }
    if (isEnvJwtAuth()) {
      return JWT_FALLBACK_COUNTRIES;
    }
    return [];
  }, [remote?.allowedCountries]);

  const operatingCountries = useMemo(() => {
    if (Array.isArray(remote?.operatingCountries) && remote.operatingCountries.length > 0) {
      return remote.operatingCountries;
    }
    if (isEnvJwtAuth()) {
      return JWT_FALLBACK_COUNTRIES;
    }
    return [];
  }, [remote?.operatingCountries]);

  const hasPermission = useCallback(
    (required: string | string[], mode: PermissionMode = "all") =>
      hasPermissionCheck(permissions, required, mode),
    [permissions],
  );

  const value = useMemo<AccessContextValue>(() => ({
    permissions,
    capabilities,
    allowedCountries,
    operatingCountries,
    allowedAccountIds: remote?.allowedAccountIds ?? null,
    canChooseDebitAccount: capabilities.canChooseDebitAccount,
    isLoading: !user || query.isLoading,
    hasPermission,
  }), [
    allowedCountries,
    operatingCountries,
    capabilities,
    hasPermission,
    permissions,
    query.isLoading,
    remote?.allowedAccountIds,
    user,
  ]);

  return (
    <AccessContext.Provider value={value}>
      {children}
    </AccessContext.Provider>
  );
}

export function useAccess() {
  const context = useContext(AccessContext);
  if (!context) {
    throw new Error("useAccess must be used within AccessProvider");
  }
  return context;
}

export function useAccessOptional() {
  return useContext(AccessContext);
}
