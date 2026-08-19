import type { AccessCapabilities } from "@/features/auth/domain/permissions";

export type AccessMeDto = {
  subjectId: string
  permissions: string[]
  capabilities: AccessCapabilities
  allowedAccountIds: string[] | null
  allowedCountries: string[]
  operatingCountries: string[]
};
