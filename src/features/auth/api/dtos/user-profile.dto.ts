export type ProfileRoleDto = {
  role?: string
  organizationId?: string
  roleId?: string
  roleName?: string
  product?: string
  roleKey?: string
  displayName?: string
  scope?: string
  isActive?: boolean
  permissions?: string[]
};

export type SubscriptionFeatureDto = {
  key: string
  limit: number
  product: string
  description: string
  unit: string
  resetPeriod: string
  requiresContact: boolean
};

export type OrganizationSubscriptionDto = {
  uuid: string
  planSlug: string
  planName: string
  planVersion: number
  status: string
  currentPeriodStart: string
  currentPeriodEnd: string
  features: SubscriptionFeatureDto[]
};

export type OrganizationDto = {
  uuid: string
  name: string
  type: string
  plan: string
  allowedProducts: string[]
};

export type SessionInfoDto = {
  sessionId: string
  timestamp: string
};

export type ProfileDto = {
  uuid: string
  name: string
  surname: string
  email: string
  fullName: string
  userType: string
  language: string
  photo: string
  isActive: boolean
  twoFactorAuthEnabled: boolean
  roles: ProfileRoleDto[]
  permissions: string[]
  organizationId: string
  allowedProducts: string[]
  availableProducts: string[]
  organization: OrganizationDto
  organizationSubscriptions: OrganizationSubscriptionDto[]
  sessionInfo: SessionInfoDto
};
