export const DOCUMENT_TYPE_CODES = [
  "CC",
  "CE",
  "NIT",
  "PA",
  "TI",
  "PPT",
] as const;

export type DocumentTypeCode = (typeof DOCUMENT_TYPE_CODES)[number];

export const DOCUMENT_TYPE_LABELS: Record<string, string> = {
  CC: "Cédula de ciudadanía",
  CE: "Cédula de extranjería",
  NIT: "NIT",
  PA: "Pasaporte",
  TI: "Tarjeta de identidad",
  PPT: "Permiso por protección temporal",
  cc: "Cédula de ciudadanía",
  ce: "Cédula de extranjería",
  nit: "NIT",
  passport: "Pasaporte",
  ti: "Tarjeta de identidad",
  ppt: "Permiso por protección temporal",
};

const DOCUMENT_TYPE_ALIASES: Record<string, DocumentTypeCode> = {
  c: "CC",
  cc: "CC",
  dni: "CC",
  ce: "CE",
  nit: "NIT",
  cuit: "NIT",
  cuil: "NIT",
  pa: "PA",
  passport: "PA",
  pasaporte: "PA",
  ti: "TI",
  ppt: "PPT",
};

export function canonicalizeDocumentType(
  value: string | undefined | null,
): DocumentTypeCode | undefined {
  const raw = String(value ?? "").trim();
  if (!raw) {
    return undefined;
  }

  const compact = raw
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");

  if (DOCUMENT_TYPE_ALIASES[compact]) {
    return DOCUMENT_TYPE_ALIASES[compact];
  }

  const upper = raw.toUpperCase();
  return (DOCUMENT_TYPE_CODES as readonly string[]).includes(upper)
    ? (upper as DocumentTypeCode)
    : undefined;
}

export function documentTypeFromLabel(displayType: string): DocumentTypeCode {
  const canonical = canonicalizeDocumentType(displayType);
  if (canonical) {
    return canonical;
  }

  const normalized = displayType.toLowerCase();
  if (normalized.includes("ciudadan")) return "CC";
  if (normalized.includes("extranjer")) return "CE";
  if (normalized.includes("pasaporte") || normalized.includes("passport")) return "PA";
  if (normalized.includes("nit")) return "NIT";
  if (normalized.includes("identidad")) return "TI";
  if (normalized.includes("ppt") || normalized.includes("proteccion") || normalized.includes("protección")) {
    return "PPT";
  }

  return "CC";
}

export function documentTypeLabel(value: string | undefined | null): string {
  if (!value) {
    return "Documento";
  }

  const canonical = canonicalizeDocumentType(value);
  if (canonical) {
    return DOCUMENT_TYPE_LABELS[canonical];
  }

  return DOCUMENT_TYPE_LABELS[value.trim().toLowerCase()] ?? value;
}
