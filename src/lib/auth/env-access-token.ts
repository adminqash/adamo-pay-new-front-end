import type { User } from "@/features/auth/application/entities/user.entity";
import { PERMISSIONS } from "@/features/auth/domain/permissions";
import { env } from "@/lib/env";

type JwtPayload = {
  sub?: string
  userId?: string
  subjectId?: string
  subjectName?: string
  subjectEmail?: string
  organization?: {
    id?: string
    name?: string
  }
};

function sanitizeAccessToken(raw?: string): string | undefined {
  if (!raw) {
    return undefined;
  }

  let token = raw.trim().replace(/^["']|["']$/g, "").trim();
  token = token.replace(/^Bearer\s+/i, "").trim();
  return token || undefined;
}

function decodeJwtPayload(token: string): JwtPayload | null {
  const parts = token.split(".");
  if (parts.length < 2) {
    return null;
  }

  try {
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(base64.length + (4 - (base64.length % 4)) % 4, "=");
    return JSON.parse(atob(padded)) as JwtPayload;
  } catch {
    return null;
  }
}

export function getEnvAccessToken(): string | undefined {
  return sanitizeAccessToken(env.VITE_ACCESS_TOKEN);
}

export function isEnvJwtAuth(): boolean {
  return Boolean(getEnvAccessToken());
}

export function userFromEnvAccessToken(): User | null {
  const token = getEnvAccessToken();
  if (!token) {
    return null;
  }

  const payload = decodeJwtPayload(token);
  if (!payload) {
    return null;
  }

  const fullName = String(payload.subjectName ?? "").trim() || "JWT user";
  const [firstName, ...rest] = fullName.split(/\s+/);
  const lastName = rest.join(" ");
  const organizationId = payload.organization?.id ?? "";
  const email = payload.subjectEmail ?? "";

  return {
    id: payload.subjectId ?? payload.userId ?? payload.sub ?? "env-jwt",
    name: firstName || "JWT",
    lastName,
    fullName,
    email,
    avatar: "",
    lang: "es",
    organizationId,
    allowedProducts: ["adamo_pay"],
    roles: [],
    permissions: Object.values(PERMISSIONS),
    organization: {
      id: organizationId,
      name: payload.organization?.name ?? "",
      type: "",
      plan: "",
      allowedProducts: ["adamo_pay"],
    },
    organizationSubscriptions: [],
  };
}
