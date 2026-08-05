const BANK_NAME_TO_SLUG: Record<string, string> = {
  "Banco Galicia": "galicia",
  "Banco Nación": "nacion",
  "Banco Santander": "santander",
  BBVA: "bbva",
  "Banco Macro": "macro",
  Bancolombia: "bancolombia",
  Davivienda: "davivienda",
  Cobre: "cobre",
};

const ACCOUNT_TYPE_TO_FORM: Record<string, string> = {
  savings: "ahorros",
  checking: "corriente",
  Ahorros: "ahorros",
  Corriente: "corriente",
};

export function mapBankNameToSlug(bankName: string): string {
  return BANK_NAME_TO_SLUG[bankName] ?? bankName.toLowerCase().replace(/\s+/g, "_");
}

export function mapAccountTypeToFormValue(accountType: string): string {
  return ACCOUNT_TYPE_TO_FORM[accountType] ?? accountType.toLowerCase();
}

export function mapFormAccountTypeToApi(accountType: string): string {
  if (accountType === "ahorros") return "savings";
  if (accountType === "corriente") return "checking";
  return accountType;
}
