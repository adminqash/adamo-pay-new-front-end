import { Navigate } from "react-router";
import type { ReactNode } from "react";
import { usePermissions } from "@/features/auth/application/hooks/use-permissions";
import { PERMISSIONS, type PermissionMode } from "@/features/auth/domain/permissions";
import { VIEW_TRANSACTIONS } from "@/features/auth/domain/permission-ui";
import { PageLoader } from "@/features/common/components/layout/page-loader";

type RequirePermissionProps = Readonly<{
  permission: string | string[]
  mode?: PermissionMode
  children: ReactNode
}>;

export function firstAllowedPath(hasPermission: (permission: string | string[], mode?: PermissionMode) => boolean): string {
  if (hasPermission(PERMISSIONS.DASHBOARD_VIEW)) {
    return "/";
  }
  if (hasPermission(PERMISSIONS.COMPLIANCE_PENDING_LIST)) {
    return "/compliance";
  }
  if (hasPermission([...VIEW_TRANSACTIONS], "any")) {
    return "/transactions";
  }
  if (hasPermission(PERMISSIONS.PAYMENTS_BATCH_LIST)) {
    return "/batches";
  }
  if (hasPermission(PERMISSIONS.BENEFICIARIES_LIST)) {
    return "/beneficiaries";
  }
  if (hasPermission(PERMISSIONS.ACCOUNTS_LIST)) {
    return "/accounts";
  }
  if (hasPermission(PERMISSIONS.METRICS_COUNTRY)) {
    return "/metrics";
  }
  if (hasPermission(PERMISSIONS.REPORTS_OWN)) {
    return "/reports";
  }
  if (hasPermission(PERMISSIONS.COLLECTIONS_LIST)) {
    return "/collections";
  }
  return "/profile";
}

export function RequirePermission({
  permission,
  mode = "all",
  children,
}: RequirePermissionProps) {
  const { hasPermission, isLoading } = usePermissions();

  if (isLoading) {
    return <PageLoader />;
  }

  if (!hasPermission(permission, mode)) {
    return <Navigate to={firstAllowedPath(hasPermission)} replace />;
  }

  return children;
}
