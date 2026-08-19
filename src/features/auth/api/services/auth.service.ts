import { redirectToLogout } from "@/features/auth/api/services/auth-redirect";
import { authApi } from "@/lib/api/api";
import { isEnvJwtAuth } from "@/lib/auth/env-access-token";
import { client as queryClient } from "@/lib/query/client.config";

export async function signOut(): Promise<void> {
  if (isEnvJwtAuth()) {
    queryClient.clear();
    return;
  }

  try {
    await authApi.post("/auth/logout");
  } catch {
    // Invalidate session server-side when possible; always redirect even if the call fails.
  } finally {
    queryClient.clear();
    redirectToLogout();
  }
}
