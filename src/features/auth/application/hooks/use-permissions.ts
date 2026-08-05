import { useAuth } from "@/features/auth/application/contexts/auth.context";

export function usePermissions() {
  const { user } = useAuth();
  const permissions = user?.permissions ?? [];

  const hasPermission = (requiredPermissions: string | string[], mode: "all" | "any" = "all"): boolean => {
    const permissionList = Array.isArray(requiredPermissions) ? requiredPermissions : [requiredPermissions];

    if (mode === "any") {
      return permissionList.some((permission) => permissions.includes(permission));
    }

    return permissionList.every((permission) => permissions.includes(permission));
  };

  return { permissions, hasPermission };
}
