import { redirectToLogout } from "@/features/auth/api/services/auth-redirect";

export function signOut(): void {
  redirectToLogout();
}
