import { useEffect, useState, type ReactNode } from "react";
import { useAuth } from "@/features/auth/application/contexts/auth.context";
import { AvatarContext } from "@/features/common/contexts/avatar-context-instance";

function getInitials(name: string, lastName: string): string {
  const initials = `${name.charAt(0)}${lastName.charAt(0)}`;
  return initials.toUpperCase();
}

export function AvatarProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar ?? "");

  useEffect(() => {
    setAvatarUrl(user?.avatar ?? "");
  }, [user?.avatar]);

  return (
    <AvatarContext.Provider
      value={{
        avatarUrl,
        setAvatarUrl,
        userInitials: user ? getInitials(user.name, user.lastName) : "",
        userName: user?.fullName ?? "",
        userEmail: user?.email ?? "",
        userRole: user?.roles[0] ?? "",
      }}
    >
      {children}
    </AvatarContext.Provider>
  );
}
