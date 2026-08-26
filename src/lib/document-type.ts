export const DOCUMENT_TYPE_CODES = [
  "CC",
  "CE",
  "NIT",
  "PA",
  "PEP",
  "TI",
  "PPT",
  "DNI",
  "CUIT",
  "RUT",
  "CPF",
  "CNPJ",
  "RFC",
  "CURP",
  "RUC",
  "CED_EXT",
] as const;

export type DocumentTypeCode = (typeof DOCUMENT_TYPE_CODES)[number] | string;

export const DOCUMENT_TYPE_LABELS: Record<string, string> = {
  CC: "Cédula de ciudadanía",
  CE: "Cédula de extranjería",
  NIT: "Número de identificación tributaria",
  PA: "Pasaporte",
  PEP: "Permiso Especial de Permanencia",
  TI: "Tarjeta de identidad",
  PPT: "Permiso por Protección Temporal",
  DNI: "Documento Nacional de Identidad",
  CUIT: "CUIT",
  RUT: "RUT",
  CPF: "Cadastro de Pessoas Físicas",
  CNPJ: "Cadastro Nacional da Pessoa Jurídica",
  RFC: "Registro Federal de Contribuyentes",
  CURP: "Clave Única de Registro de Población",
  RUC: "Registro Único de Contribuyentes",
  CED_EXT: "Carné de Extranjería",
  cc: "Cédula de ciudadanía",
  ce: "Cédula de extranjería",
  nit: "NIT",
  passport: "Pasaporte",
  ti: "Tarjeta de identidad",
  ppt: "Permiso por Protección Temporal",
};

export function canonicalizeDocumentType(
  value: string | undefined | null,
): string | undefined {
  const raw = String(value ?? "").trim();
  if (!raw) {
    return undefined;
  }

  const compact = raw
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");

  const exact = DOCUMENT_TYPE_CODES.find(
    (code) => code.toUpperCase() === raw.toUpperCase() || code.toLowerCase().replace(/[^a-z0-9]+/g, "") === compact,
  );
  if (exact) {
    return exact;
  }

  const aliases: Record<string, string> = {
    c: "CC",
    cedula: "CC",
    cedulaciudadania: "CC",
    e: "CE",
    cedulaextranjeria: "CE",
    n: "NIT",
    p: "PA",
    pas: "PA",
    passport: "PA",
    pasaporte: "PA",
    pep: "PEP",
    tarjetadeidentidad: "TI",
    cuit: "CUIT",
    cuil: "CUIT",
    rut: "RUT",
    cpf: "CPF",
    cnpj: "CNPJ",
    rfc: "RFC",
    curp: "CURP",
    ruc: "RUC",
    cedext: "CED_EXT",
    carneextranjeria: "CED_EXT",
  };

  return aliases[compact];
}

export function documentTypeFromLabel(displayType: string): string {
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
  if (normalized.includes("cuit")) return "CUIT";
  if (normalized.includes("curp")) return "CURP";
  if (normalized.includes("rfc")) return "RFC";
  if (normalized.includes("cpf")) return "CPF";
  if (normalized.includes("cnpj")) return "CNPJ";
  if (normalized.includes("rut")) return "RUT";
  if (normalized.includes("ruc")) return "RUC";

  return displayType.trim().toUpperCase() || "CC";
}

export function documentTypeLabel(value: string | undefined | null): string {
  if (!value) {
    return "Documento";
  }

  const canonical = canonicalizeDocumentType(value);
  if (canonical && DOCUMENT_TYPE_LABELS[canonical]) {
    return DOCUMENT_TYPE_LABELS[canonical];
  }

  return DOCUMENT_TYPE_LABELS[value.trim()] ?? DOCUMENT_TYPE_LABELS[value.trim().toLowerCase()] ?? value;
}
