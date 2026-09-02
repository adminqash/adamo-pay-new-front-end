/**
 * Base React Query keys.
 * Country-scoped data queries should wrap these with `withCountryScope(...)`
 * so caches never collide across countries. Auth keys stay global.
 */
export const queryKeys = {
  auth: {
    all: ["auth"] as const,
    profile: ["auth", "profile"] as const,
    authorize: ["auth", "authorize"] as const,
    access: ["auth", "access"] as const,
    operatingCountries: ["auth", "operating-countries"] as const,
  },
  organizations: {
    countries: ["organizations", "countries"] as const,
  },
  dashboard: {
    summary: ["dashboard", "summary"] as const,
    balance: ["dashboard", "balance"] as const,
    transactions: ["dashboard", "transactions"] as const,
  },
  accounts: {
    all: (params?: unknown) => ["accounts", params] as const,
    detail: (id: string) => ["accounts", id] as const,
    movements: (id: string, params?: unknown) => ["accounts", id, "movements", params] as const,
    balanceSummary: ["accounts", "balance-summary"] as const,
  },
  payments: {
    all: (params?: unknown) => ["payments", params] as const,
    summary: ["payments", "summary"] as const,
    detail: (id: string) => ["payments", id] as const,
    timeline: (id: string) => ["payments", id, "timeline"] as const,
  },
  batches: {
    all: (params?: unknown) => ["batches", params] as const,
    detail: (id: string) => ["batches", id] as const,
    transactions: (id: string, params?: unknown) => ["batches", id, "transactions", params] as const,
    timeline: (id: string) => ["batches", id, "timeline"] as const,
    template: ["batches", "template"] as const,
    transactionDetail: (batchId: string, transactionId: string) =>
      ["batches", batchId, "transactions", transactionId] as const,
  },
  documents: {
    all: (params?: unknown) => ["documents", params] as const,
    detail: (id: string) => ["documents", id] as const,
  },
  beneficiaries: {
    all: (params?: unknown) => ["beneficiaries", params] as const,
    recent: (params?: unknown) => ["beneficiaries", "recent", params] as const,
    detail: (id: string) => ["beneficiaries", id] as const,
    transactions: (id: string, params?: unknown) => ["beneficiaries", id, "transactions", params] as const,
    bankAccounts: (id: string, params?: unknown) => ["beneficiaries", id, "bank-accounts", params] as const,
    cards: (id: string, params?: unknown) => ["beneficiaries", id, "cards", params] as const,
    cardDetail: (beneficiaryId: string, cardId: string) =>
      ["beneficiaries", beneficiaryId, "cards", cardId] as const,
    cardMovements: (beneficiaryId: string, cardId: string, params?: unknown) =>
      ["beneficiaries", beneficiaryId, "cards", cardId, "movements", params] as const,
  },
  metrics: {
    dashboard: (params?: unknown) => ["metrics", "dashboard", params] as const,
    overview: (params?: unknown) => ["metrics", "overview", params] as const,
    paymentFrequency: (params?: unknown) => ["metrics", "payment-frequency", params] as const,
    transactionStatus: (params?: unknown) => ["metrics", "transaction-status", params] as const,
    rejectionReasons: (params?: unknown) => ["metrics", "rejection-reasons", params] as const,
    topBanks: (params?: unknown) => ["metrics", "top-banks", params] as const,
    topBeneficiaries: (params?: unknown) => ["metrics", "top-beneficiaries", params] as const,
    batchStats: (params?: unknown) => ["metrics", "batch-stats", params] as const,
    amlCompliance: (params?: unknown) => ["metrics", "aml-compliance", params] as const,
    accountBreakdown: (params?: unknown) => ["metrics", "account-breakdown", params] as const,
    recurringFailures: (params?: unknown) => ["metrics", "recurring-failures", params] as const,
    transactions: (params?: unknown) => ["metrics", "transactions", params] as const,
    beneficiaries: (params?: unknown) => ["metrics", "beneficiaries", params] as const,
    batches: (params?: unknown) => ["metrics", "batches", params] as const,
    accounts: (params?: unknown) => ["metrics", "accounts", params] as const,
  },
  reports: {
    all: (params?: unknown) => ["reports", params] as const,
    detail: (id: string) => ["reports", id] as const,
    download: (id: string) => ["reports", id, "download"] as const,
  },
  compliance: {
    checks: (params?: unknown) => ["compliance", "checks", params] as const,
    case: (subjectId: string) => ["compliance", "case", subjectId] as const,
    screening: (subjectId: string) => ["compliance", "screening", subjectId] as const,
  },
  source: {
    catalog: (key?: string) => ["source", key ?? "base"] as const,
  },
} as const;
