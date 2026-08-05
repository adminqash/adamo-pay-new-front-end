import { env } from "@/lib/env";

function landingUrl(path: string): URL {
  return new URL(path, env.VITE_ADAMO_LANDING_BASE_URL);
}

export function redirectToLogin(opts?: { sessionExpired?: boolean }): void {
  const url = landingUrl("/adamo-pay");
  url.searchParams.set("login_open", "true");
  url.searchParams.set("redirect_to", window.location.href);
  if (opts?.sessionExpired) {
    url.searchParams.set("session_expired", "true");
  }

  window.location.href = url.toString();
}

export function redirectToProductLanding(): void {
  window.location.href = landingUrl("/adamo-pay").toString();
}

export function redirectToLogout(): void {
  window.location.href = landingUrl("/logout").toString();
}
