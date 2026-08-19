import type { ReactNode } from "react";
import { usePermissions } from "@/features/auth/application/hooks/use-permissions";
import type { PermissionMode } from "@/features/auth/domain/permissions";

type PermissionGateProps = Readonly<{
  permission?: string | string[]
  mode?: PermissionMode
  when?: boolean
  children: ReactNode
  fallback?: ReactNode
}>;

export function PermissionGate({
  permission,
  mode = "all",
  when,
  children,
  fallback = null,
}: PermissionGateProps) {
  const { hasPermission, isLoading } = usePermissions();

  if (isLoading) {
    return fallback;
  }

  const allowed = when ?? (permission ? hasPermission(permission, mode) : true);
  if (!allowed) {
    return fallback;
  }

  return children;
}
