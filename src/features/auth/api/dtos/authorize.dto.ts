import type { ProfileRoleDto } from "@/features/auth/api/dtos/user-profile.dto";

export type AuthorizeUserDto = {
  uuid: string
  email: string
  name: string
  surname: string
  fullName: string
  userType: string
  isActive: boolean
  twoFactorAuthEnabled: boolean
  roles: ProfileRoleDto[]
  additionalPermissions?: string[]
  permissions: string[]
  organizationId: string
};

export type AuthorizeSessionDto = {
  sessionId: string
  isActive: boolean
  createdAt: string
  lastActivityAt: string
};

export type AuthorizeTokenInfoDto = {
  isValid: boolean
  expiresAt: string
  source: string
  typ: string
};

export type AuthorizeDto = {
  success: boolean
  data: {
    authorized: boolean
    authType: string
    user: AuthorizeUserDto
    session: AuthorizeSessionDto
    tokenInfo: AuthorizeTokenInfoDto
  }
  message: string
};
