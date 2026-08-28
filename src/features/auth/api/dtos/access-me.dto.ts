import type { AccessCapabilities } from "@/features/auth/domain/permissions";

export type AccessMeRoleDto = {
  roleKey: string | null
  roleName: string | null
  displayName: string | null
  product: string | null
};

export type AccessMeProfileDto = {
  uuid: string | null
  name: string | null
  surname: string | null
  fullName: string | null
  email: string | null
  roles: AccessMeRoleDto[]
};

export type AccessMeDto = {
  subjectId: string
  profile: AccessMeProfileDto | null
  permissions: string[]
  capabilities: AccessCapabilities
  allowedAccountIds: string[] | null
  allowedCountries: string[]
  operatingCountries: string[]
};
