import { redirectToLogout } from "@/features/auth/api/services/auth-redirect";
import { authApi } from "@/lib/api/api";
import { client as queryClient } from "@/lib/query/client.config";

export async function signOut(): Promise<void> {
  try {
    await authApi.post("/auth/logout");
  } catch {
    // Invalidate session server-side when possible; always redirect even if the call fails.
  } finally {
    queryClient.clear();
    redirectToLogout();
  }
}
