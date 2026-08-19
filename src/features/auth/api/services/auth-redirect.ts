import { isEnvJwtAuth } from "@/lib/auth/env-access-token";
import { env } from "@/lib/env";

function landingUrl(path: string): URL | null {
  const base = env.VITE_ADAMO_LANDING_BASE_URL?.trim();
  if (!base) {
    return null;
  }

  try {
    return new URL(path, base);
  } catch {
    return null;
  }
}

export function redirectToLogin(opts?: { sessionExpired?: boolean }): void {
  if (isEnvJwtAuth()) {
    return;
  }

  const url = landingUrl("/adamo-pay");
  if (!url) {
    console.warn("[auth] VITE_ADAMO_LANDING_BASE_URL is not set; cannot redirect to SSO login.");
    return;
  }

  url.searchParams.set("login_open", "true");
  url.searchParams.set("redirect_to", window.location.href);
  if (opts?.sessionExpired) {
    url.searchParams.set("session_expired", "true");
  }

  window.location.href = url.toString();
}

export function redirectToProductLanding(): void {
  if (isEnvJwtAuth()) {
    return;
  }

  const url = landingUrl("/adamo-pay");
  if (!url) {
    return;
  }

  window.location.href = url.toString();
}

export function redirectToLogout(): void {
  if (isEnvJwtAuth()) {
    return;
  }

  const url = landingUrl("/logout");
  if (!url) {
    return;
  }

  window.location.href = url.toString();
}
