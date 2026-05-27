import { useState, type ReactNode } from "react";
import { AvatarContext } from "@/features/common/contexts/avatar-context-instance";

export function AvatarProvider({ children }: { children: ReactNode }) {
  const [avatarUrl, setAvatarUrl] = useState("");

  return (
    <AvatarContext.Provider
      value={{
        avatarUrl,
        setAvatarUrl,
        userInitials: "ML",
        userName: "María Laura Gómez",
        userEmail: "marialauragomez@starlink.com",
        userRole: "Client Support Specialist",
      }}
    >
      {children}
    </AvatarContext.Provider>
  );
}
