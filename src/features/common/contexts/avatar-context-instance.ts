import { createContext } from "react";

export interface AvatarContextType {
  avatarUrl: string
  setAvatarUrl: (url: string) => void
  userInitials: string
  userName: string
  userEmail: string
  userRole: string
}

export const AvatarContext = createContext<AvatarContextType | undefined>(undefined);
