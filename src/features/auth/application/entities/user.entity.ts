export type SubscriptionFeature = {
  key: string
  limit: number
  product: string
  description: string
  unit: string
  resetPeriod: string
  requiresContact: boolean
};

export type OrganizationSubscription = {
  uuid: string
  planSlug: string
  planName: string
  planVersion: number
  status: string
  currentPeriodStart: string
  currentPeriodEnd: string
  features: SubscriptionFeature[]
};

export type Organization = {
  id: string
  name: string
  type: string
  plan: string
  allowedProducts: string[]
};

export type User = {
  id: string
  name: string
  lastName: string
  fullName: string
  email: string
  avatar: string
  lang: string
  organizationId: string
  allowedProducts: string[]
  roles: string[]
  permissions: string[]
  organization: Organization
  organizationSubscriptions: OrganizationSubscription[]
};
