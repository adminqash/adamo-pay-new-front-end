import { useMemo } from "react";
import { useAuth } from "@/features/auth/application/contexts/auth.context";
import { useAccessOptional } from "@/features/auth/application/contexts/access.context";
import {
  hasPermission as hasPermissionCheck,
  normalizePermissions,
  resolveAccessCapabilities,
  type AccessCapabilities,
  type PermissionMode,
} from "@/features/auth/domain/permissions";

export function usePermissions() {
  const access = useAccessOptional();
  const { user } = useAuth();
  const authPermissions = useMemo(
    () => normalizePermissions(user?.permissions ?? []),
    [user?.permissions],
  );
  const authCapabilities = useMemo(
    () => resolveAccessCapabilities(authPermissions),
    [authPermissions],
  );

  if (access) {
    return {
      permissions: access.permissions,
      capabilities: access.capabilities,
      hasPermission: access.hasPermission,
      isLoading: access.isLoading,
    };
  }

  const hasPermission = (
    requiredPermissions: string | string[],
    mode: PermissionMode = "all",
  ): boolean => hasPermissionCheck(authPermissions, requiredPermissions, mode);

  return {
    permissions: authPermissions,
    capabilities: authCapabilities,
    hasPermission,
    isLoading: false,
  };
}

export type { AccessCapabilities };
