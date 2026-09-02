/**
 * Canonical Adamo Pay permissions.
 * Keep this file homologous across core, beneficiaries, analytics, and the v2 frontend.
 * Identity /auth/authorize returns permission names; UUIDs are accepted as aliases.
 */

export const PERMISSIONS = {
  DASHBOARD_VIEW: "adamo_pay:dashboard:view",
  SCOPE_COUNTRIES_ALL: "adamo_pay:scope:countries_all:read",
  SCOPE_COUNTRIES_ASSIGNED: "adamo_pay:scope:countries_assigned:read",
  SCOPE_ACCOUNTS_COUNTRY_ALL: "adamo_pay:scope:accounts_country_all:read",
  SCOPE_ACCOUNTS_ASSIGNED: "adamo_pay:scope:accounts_assigned:read",
  BALANCE_COUNTRY_TOTAL: "adamo_pay:balance:country_total:read",
  BALANCE_ASSIGNED_ACCOUNT: "adamo_pay:balance:assigned_account:read",
  PAYMENTS_INDIVIDUAL_LIST: "adamo_pay:payments_individual:list:read",
  PAYMENTS_INDIVIDUAL_CREATE: "adamo_pay:payments_individual:create",
  PAYMENTS_INDIVIDUAL_SEND: "adamo_pay:payments_individual:send",
  PAYMENTS_INDIVIDUAL_APPROVE_SEND:
    "adamo_pay:payments_individual:pending:approve_send",
  PAYMENTS_BATCH_LIST: "adamo_pay:payments_batch:list:read",
  PAYMENTS_BATCH_CREATE: "adamo_pay:payments_batch:create",
  PAYMENTS_BATCH_SEND: "adamo_pay:payments_batch:send",
  PAYMENTS_BATCH_APPROVE_SEND: "adamo_pay:payments_batch:pending:approve_send",
  TRANSACTIONS_LIST: "adamo_pay:transactions:list:read",
  TRANSACTIONS_DETAIL: "adamo_pay:transactions:detail:read",
  TRANSACTIONS_TIMELINE: "adamo_pay:transactions:timeline:read",
  TRANSACTIONS_RECEIPT_DOWNLOAD: "adamo_pay:transactions:receipt:download",
  PAYMENTS_COMMENT: "adamo_pay:payments:comment",
  BENEFICIARIES_LIST: "adamo_pay:beneficiaries:list:read",
  BENEFICIARIES_CREATE: "adamo_pay:beneficiaries:create",
  METRICS_COUNTRY: "adamo_pay:metrics:country:read",
  METRICS_FUNDINGS: "adamo_pay:metrics:fundings_list:read",
  COLLECTIONS_LIST: "adamo_pay:collections:list:read",
  COLLECTIONS_CREATE: "adamo_pay:collections:create",
  ACCOUNTS_LIST: "adamo_pay:accounts:list:read",
  ACCOUNTS_TRANSFER: "adamo_pay:accounts:transfer_between",
  ACCOUNTS_UPDATE: "adamo_pay:accounts:update",
  ACCOUNTS_REQUEST_CREATE: "adamo_pay:accounts:request_create",
  REPORTS_OWN: "adamo_pay:reports:own:read",
  USERS_GLOBAL_MANAGE: "adamo_pay:users:global:manage",
  USERS_ASSIGNED_MANAGE: "adamo_pay:users:assigned_accounts:manage",
  COMPLIANCE_PENDING_LIST: "adamo_pay:payments_compliance:pending:list:read",
  COMPLIANCE_RESOLVE: "adamo_pay:payments_compliance:pending:resolve",
  COMPLIANCE_APPROVE: "adamo_pay:payments_compliance:pending:approve",
  COMPLIANCE_REJECT: "adamo_pay:payments_compliance:pending:reject",
  COMPLIANCE_APPROVE_REJECT:
    "adamo_pay:payments_compliance:pending:approve_reject",
} as const;

export type PermissionName = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

export const PERMISSION_BY_UUID: Record<string, PermissionName> = {
  "1bc89509-6c72-43e6-bafa-d0cdf4440849": PERMISSIONS.DASHBOARD_VIEW,
  "7be1f2b6-e46b-4fcc-aa20-208e5c157f5c": PERMISSIONS.SCOPE_COUNTRIES_ALL,
  "f8c9e236-2141-4ca0-90f3-5c6ea73cf8c8": PERMISSIONS.SCOPE_COUNTRIES_ASSIGNED,
  "050d3d1e-7136-4a19-bf2b-1673590f4b6b": PERMISSIONS.SCOPE_ACCOUNTS_COUNTRY_ALL,
  "20ce5270-93cc-4825-9654-785ad1b43c19": PERMISSIONS.SCOPE_ACCOUNTS_ASSIGNED,
  "3af2224a-5dac-4ee4-ac6b-5ba172ee1139": PERMISSIONS.BALANCE_COUNTRY_TOTAL,
  "a73a0dd4-9ee7-413a-afed-bda174075ac0": PERMISSIONS.BALANCE_ASSIGNED_ACCOUNT,
  "e8975c65-f904-4f35-99f0-f9aa5670b2e0": PERMISSIONS.PAYMENTS_INDIVIDUAL_LIST,
  "9ea11b45-776e-4319-8a7e-d754ca96018a": PERMISSIONS.PAYMENTS_INDIVIDUAL_CREATE,
  "c08debd0-5326-4f64-b349-b8b77ee8c69c": PERMISSIONS.PAYMENTS_INDIVIDUAL_SEND,
  "7b23b5f1-53dc-44e3-8fec-70125bfd0491":
    PERMISSIONS.PAYMENTS_INDIVIDUAL_APPROVE_SEND,
  "d13cb77f-cb4a-402b-879a-4f7df5345cfa": PERMISSIONS.PAYMENTS_BATCH_LIST,
  "e2c1d838-a0fc-4f80-b619-3b325f7410ba": PERMISSIONS.PAYMENTS_BATCH_CREATE,
  "2c688313-fffe-496c-8316-ea7d5021d73c": PERMISSIONS.PAYMENTS_BATCH_SEND,
  "52e00ee8-a93c-4c05-9633-350ad3c6d0ff": PERMISSIONS.PAYMENTS_BATCH_APPROVE_SEND,
  "e79c557b-74b5-4d80-b11a-27374d6dd2e7": PERMISSIONS.TRANSACTIONS_LIST,
  "e062f8eb-ce37-4cd6-87d1-49876aaa003e": PERMISSIONS.TRANSACTIONS_DETAIL,
  "603021b2-da3e-4a88-8891-185db7e4117a": PERMISSIONS.TRANSACTIONS_TIMELINE,
  "4a49651b-1bbb-4d53-accb-a30fdaa020ad":
    PERMISSIONS.TRANSACTIONS_RECEIPT_DOWNLOAD,
  "65e138d7-07a7-4f06-aa9d-64eb24201654": PERMISSIONS.PAYMENTS_COMMENT,
  "a38a5c79-837c-4e1a-a4fa-46fa5970bf03": PERMISSIONS.BENEFICIARIES_LIST,
  "3f9469b6-efba-409f-bba5-5661715a588c": PERMISSIONS.BENEFICIARIES_CREATE,
  "9d7584cf-eb13-4109-b631-04a8cda68635": PERMISSIONS.METRICS_COUNTRY,
  "e624fdf6-b0d9-475f-a2ff-0b70b3c4200b": PERMISSIONS.METRICS_FUNDINGS,
  "a48ffb5e-eb00-48b0-9bb7-7dac941473bc": PERMISSIONS.COLLECTIONS_LIST,
  "05843f20-db65-4e85-9fec-67436aeecbe0": PERMISSIONS.ACCOUNTS_LIST,
  "d2736b36-5d5a-4b29-816d-00be86732ccc": PERMISSIONS.ACCOUNTS_TRANSFER,
  "ce21bf74-354f-4bf6-bbc8-dc05753423ce": PERMISSIONS.ACCOUNTS_UPDATE,
  "fca34b84-d160-43aa-9d07-9674973848e7": PERMISSIONS.ACCOUNTS_REQUEST_CREATE,
  "7a016055-d984-4585-97e1-baec66337fc8": PERMISSIONS.REPORTS_OWN,
  "74087933-5244-4f94-8d6c-d0defc97ed27": PERMISSIONS.USERS_GLOBAL_MANAGE,
  "3c088a1d-e65c-4f2a-9687-8e6456c00e3f": PERMISSIONS.USERS_ASSIGNED_MANAGE,
  "0ec66f6a-1f75-4ac8-b5aa-43ef3d6f027f": PERMISSIONS.COMPLIANCE_PENDING_LIST,
  "7f3a2d91-8c45-4b6e-a127-5d9e3f681c42": PERMISSIONS.COMPLIANCE_RESOLVE,
  "c4e8b715-2f63-49da-9b81-7a305e6d24f9": PERMISSIONS.COMPLIANCE_APPROVE,
  "1a96d4e8-73b2-4f05-8c61-e29d7a354fb0": PERMISSIONS.COMPLIANCE_REJECT,
  "8531df65-afb8-4e24-a618-1192076a7bb1": PERMISSIONS.COMPLIANCE_APPROVE_REJECT,
};

export const ORGANIZATION_OPERATING_COUNTRIES = [
  "ARG",
  "BRA",
  "CHL",
  "COL",
  "MEX",
  "PER",
] as const;

export type PermissionMode = "all" | "any";
export type CountryScope = "all" | "assigned" | "none";
export type AccountScope = "all" | "assigned" | "none";
export type BalanceScope = "country_total" | "assigned" | "none";

export type AccessCapabilities = {
  countryScope: CountryScope
  accountScope: AccountScope
  balanceScope: BalanceScope
  canChooseDebitAccount: boolean
  canViewBalance: boolean
  canViewDashboard: boolean
  canListIndividualPayments: boolean
  canCreateIndividualPayment: boolean
  canSendIndividualPayment: boolean
  canApproveSendIndividualPayment: boolean
  canDispatchIndividualPayment: boolean
  canListBatchPayments: boolean
  canCreateBatch: boolean
  canSendBatch: boolean
  canApproveSendBatch: boolean
  canDispatchBatch: boolean
  canListTransactions: boolean
  canViewTransactionDetail: boolean
  canViewTransactionTimeline: boolean
  canDownloadReceipt: boolean
  canCommentPayment: boolean
  canListBeneficiaries: boolean
  canCreateBeneficiary: boolean
  canViewMetrics: boolean
  canViewFundings: boolean
  canViewCollections: boolean
  canListAccounts: boolean
  canTransferBetweenAccounts: boolean
  canUpdateAccount: boolean
  canRequestCreateAccount: boolean
  canViewOwnReports: boolean
  canManageUsersGlobal: boolean
  canManageUsersAssigned: boolean
  canManageUsers: boolean
  canListCompliancePending: boolean
  canResolveCompliance: boolean
  canApproveCompliance: boolean
  canRejectCompliance: boolean
  canApproveRejectCompliance: boolean
};

export function normalizePermission(value: string): string {
  const trimmed = value.trim();
  return PERMISSION_BY_UUID[trimmed] ?? trimmed;
}

export function normalizePermissions(values: string[]): string[] {
  return [...new Set(values.map(normalizePermission).filter(Boolean))];
}

export function hasPermission(
  userPermissions: string[],
  required: string | string[],
  mode: PermissionMode = "all",
): boolean {
  const granted = new Set(normalizePermissions(userPermissions));
  const needed = (Array.isArray(required) ? required : [required]).map(
    normalizePermission,
  );

  if (needed.length === 0) {
    return true;
  }

  if (mode === "any") {
    return needed.some((permission) => granted.has(permission));
  }

  return needed.every((permission) => granted.has(permission));
}

export function resolveAccessCapabilities(
  userPermissions: string[],
): AccessCapabilities {
  const can = (permission: string) => hasPermission(userPermissions, permission);

  const countryScope: CountryScope = can(PERMISSIONS.SCOPE_COUNTRIES_ALL)
    ? "all"
    : can(PERMISSIONS.SCOPE_COUNTRIES_ASSIGNED)
      ? "assigned"
      : "none";

  const accountScope: AccountScope = can(PERMISSIONS.SCOPE_ACCOUNTS_COUNTRY_ALL)
    ? "all"
    : can(PERMISSIONS.SCOPE_ACCOUNTS_ASSIGNED)
      ? "assigned"
      : "none";

  const balanceScope: BalanceScope = can(PERMISSIONS.BALANCE_COUNTRY_TOTAL)
    ? "country_total"
    : can(PERMISSIONS.BALANCE_ASSIGNED_ACCOUNT)
      ? "assigned"
      : "none";

  const canSendIndividualPayment = can(PERMISSIONS.PAYMENTS_INDIVIDUAL_SEND);
  const canApproveSendIndividualPayment = can(
    PERMISSIONS.PAYMENTS_INDIVIDUAL_APPROVE_SEND,
  );
  const canSendBatch = can(PERMISSIONS.PAYMENTS_BATCH_SEND);
  const canApproveSendBatch = can(PERMISSIONS.PAYMENTS_BATCH_APPROVE_SEND);
  const canManageUsersGlobal = can(PERMISSIONS.USERS_GLOBAL_MANAGE);
  const canManageUsersAssigned = can(PERMISSIONS.USERS_ASSIGNED_MANAGE);

  return {
    countryScope,
    accountScope,
    balanceScope,
    canChooseDebitAccount: accountScope === "all",
    canViewBalance: balanceScope !== "none",
    canViewDashboard: can(PERMISSIONS.DASHBOARD_VIEW),
    canListIndividualPayments: can(PERMISSIONS.PAYMENTS_INDIVIDUAL_LIST),
    canCreateIndividualPayment: can(PERMISSIONS.PAYMENTS_INDIVIDUAL_CREATE),
    canSendIndividualPayment,
    canApproveSendIndividualPayment,
    canDispatchIndividualPayment:
      canSendIndividualPayment || canApproveSendIndividualPayment,
    canListBatchPayments: can(PERMISSIONS.PAYMENTS_BATCH_LIST),
    canCreateBatch: can(PERMISSIONS.PAYMENTS_BATCH_CREATE),
    canSendBatch,
    canApproveSendBatch,
    canDispatchBatch: canSendBatch || canApproveSendBatch,
    canListTransactions: can(PERMISSIONS.TRANSACTIONS_LIST),
    canViewTransactionDetail: can(PERMISSIONS.TRANSACTIONS_DETAIL),
    canViewTransactionTimeline: can(PERMISSIONS.TRANSACTIONS_TIMELINE),
    canDownloadReceipt: can(PERMISSIONS.TRANSACTIONS_RECEIPT_DOWNLOAD),
    canCommentPayment: can(PERMISSIONS.PAYMENTS_COMMENT),
    canListBeneficiaries: can(PERMISSIONS.BENEFICIARIES_LIST),
    canCreateBeneficiary: can(PERMISSIONS.BENEFICIARIES_CREATE),
    canViewMetrics: can(PERMISSIONS.METRICS_COUNTRY),
    canViewFundings: can(PERMISSIONS.METRICS_FUNDINGS),
    canViewCollections: can(PERMISSIONS.COLLECTIONS_LIST),
    canListAccounts: can(PERMISSIONS.ACCOUNTS_LIST),
    canTransferBetweenAccounts: can(PERMISSIONS.ACCOUNTS_TRANSFER),
    canUpdateAccount: can(PERMISSIONS.ACCOUNTS_UPDATE),
    canRequestCreateAccount: can(PERMISSIONS.ACCOUNTS_REQUEST_CREATE),
    canViewOwnReports: can(PERMISSIONS.REPORTS_OWN),
    canManageUsersGlobal,
    canManageUsersAssigned,
    canManageUsers: canManageUsersGlobal || canManageUsersAssigned,
    canListCompliancePending: can(PERMISSIONS.COMPLIANCE_PENDING_LIST),
    canResolveCompliance: can(PERMISSIONS.COMPLIANCE_RESOLVE),
    canApproveCompliance: can(PERMISSIONS.COMPLIANCE_APPROVE),
    canRejectCompliance: can(PERMISSIONS.COMPLIANCE_REJECT),
    canApproveRejectCompliance:
      can(PERMISSIONS.COMPLIANCE_APPROVE)
      || can(PERMISSIONS.COMPLIANCE_REJECT)
      || can(PERMISSIONS.COMPLIANCE_APPROVE_REJECT),
  };
}
