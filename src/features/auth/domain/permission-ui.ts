import { PERMISSIONS } from "@/features/auth/domain/permissions";

/** Shared permission sets for UI gates. Keep checks homologous — do not copy arrays in pages. */
export const VIEW_TRANSACTIONS = [
  PERMISSIONS.TRANSACTIONS_LIST,
  PERMISSIONS.PAYMENTS_INDIVIDUAL_LIST,
] as const;

export const EXPORT_DATA = [
  PERMISSIONS.REPORTS_OWN,
  PERMISSIONS.TRANSACTIONS_RECEIPT_DOWNLOAD,
] as const;
