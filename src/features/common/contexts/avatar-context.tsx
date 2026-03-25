import { createContext, useContext, useState, ReactNode } from "react";

interface AvatarContextType {
  avatarUrl: string;
  setAvatarUrl: (url: string) => void;
  userInitials: string;
  userName: string;
  userEmail: string;
  userRole: string;
}

const AvatarContext = createContext<AvatarContextType | undefined>(undefined);

export function AvatarProvider({ children }: { children: ReactNode }) {
  const [avatarUrl, setAvatarUrl] = useState("");

  return (
    <AvatarContext.Provider value={{ 
      avatarUrl, 
      setAvatarUrl,
      userInitials: "ML",
      userName: "María Laura Gómez",
      userEmail: "marialauragomez@starlink.com",
      userRole: "Client Support Specialist"
    }}>
      {children}
    </AvatarContext.Provider>
  );
}

export function useAvatar() {
  const context = useContext(AvatarContext);
  if (context === undefined) {
    throw new Error("useAvatar must be used within an AvatarProvider");
  }
  return context;
}
