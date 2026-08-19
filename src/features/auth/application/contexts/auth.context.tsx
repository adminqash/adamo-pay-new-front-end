/* eslint-disable react-refresh/only-export-components */

import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import type { User } from "@/features/auth/application/entities/user.entity";
import { redirectToLogin, redirectToProductLanding } from "@/features/auth/api/services/auth-redirect";
import { roleToKey } from "@/features/auth/api/mappers/user.mapper";
import { normalizePermissions } from "@/features/auth/domain/permissions";
import { useAuthorize } from "@/features/auth/application/hooks/use-authorize";
import { useUserProfile } from "@/features/auth/application/hooks/use-user-profile";
import { signOut as logout } from "@/features/auth/api/services/auth.service";
import {
  isEnvJwtAuth,
  userFromEnvAccessToken,
} from "@/lib/auth/env-access-token";

type AuthStatus = "loading" | "authenticated" | "unauthenticated";

type AuthContextValue = {
  user: User | null
  status: AuthStatus
  signOut: () => Promise<void>
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export type AuthProviderProps = Readonly<{
  children: ReactNode
}>;

const REQUIRED_PRODUCT = "adamo_pay";
const envJwtUser = userFromEnvAccessToken();
const jwtAuthEnabled = isEnvJwtAuth();

export function AuthProvider({ children }: AuthProviderProps) {
  const [status, setStatus] = useState<AuthStatus>(
    envJwtUser ? "authenticated" : jwtAuthEnabled ? "unauthenticated" : "loading",
  );
  const [user, setUser] = useState<User | null>(envJwtUser);

  const { data: profileUser, isLoading: isLoadingProfile, error: profileError } = useUserProfile();
  const { data: authorizeData } = useAuthorize();

  const hasRequiredProductAccess = (candidate: User) => candidate.allowedProducts.includes(REQUIRED_PRODUCT);

  useEffect(() => {
    if (jwtAuthEnabled) {
      return;
    }

    if (!profileUser) {
      return;
    }

    if (!hasRequiredProductAccess(profileUser)) {
      setStatus("unauthenticated");
      redirectToProductLanding();
      return;
    }

    setUser(profileUser);
    setStatus("authenticated");
  }, [profileUser]);

  useEffect(() => {
    if (jwtAuthEnabled) {
      return;
    }

    if (profileError && !isLoadingProfile) {
      setStatus("unauthenticated");
      redirectToLogin();
    }
  }, [profileError, isLoadingProfile]);

  // /auth/authorize is the source of truth for roles/permissions once available —
  // it overrides whatever getProfile returned, and re-runs after every silent
  // token refresh (see src/lib/api/refresh-interceptor.ts invalidating both queries).
  useEffect(() => {
    if (jwtAuthEnabled) {
      return;
    }

    const authorizedUser = authorizeData?.data?.authorized ? authorizeData.data.user : null;
    if (!authorizedUser) {
      return;
    }

    setUser((current) => {
      if (!current) {
        return current;
      }

      const authorizedPermissions = normalizePermissions([
        ...(authorizedUser.permissions ?? []),
        ...(authorizedUser.additionalPermissions ?? []),
      ]);
      const authorizedRoles = (authorizedUser.roles ?? [])
        .map(roleToKey)
        .filter((role): role is string => Boolean(role));

      return {
        ...current,
        roles: authorizedRoles.length > 0 ? authorizedRoles : current.roles,
        permissions: authorizedPermissions.length > 0 ? authorizedPermissions : current.permissions,
      };
    });
  }, [authorizeData]);

  if (jwtAuthEnabled && !user) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6 text-sm text-neutrals-700">
        VITE_ACCESS_TOKEN is set but is not a valid JWT.
      </div>
    );
  }

  if (status !== "authenticated") {
    return null;
  }

  return (
    <AuthContext.Provider value={{ user, status, signOut: logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
