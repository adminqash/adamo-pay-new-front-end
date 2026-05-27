import { useContext } from "react";
import { AvatarContext } from "@/features/common/contexts/avatar-context-instance";

export function useAvatar() {
  const context = useContext(AvatarContext);

  if (context === undefined) {
    throw new Error("useAvatar must be used within an AvatarProvider");
  }

  return context;
}
