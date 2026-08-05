import type {
  BatchTransactionDTO,
  BatchTransactionValidationErrorDTO,
} from "@/features/batches/api/dtos/batch-transaction.dto";
import type {
  BatchTransactionDetail,
  BatchTransactionDetailStatus,
} from "@/features/batches/application/entities/batch-transaction-detail.entity";
import { minorToMajor } from "@/lib/money/money";

const ID_TYPE_LABELS: Record<string, string> = {
  cc: "Cédula de ciudadanía",
  ce: "Cédula de extranjería",
  nit: "NIT",
  passport: "Pasaporte",
  ti: "Tarjeta de identidad",
  ppt: "PPT",
};

const ACCOUNT_TYPE_LABELS: Record<string, string> = {
  savings: "Ahorros",
  checking: "Corriente",
  ahorros: "Ahorros",
  corriente: "Corriente",
};

function mapStatus(status: string): BatchTransactionDetailStatus {
  switch (status) {
    case "paid":
      return "paid";
    case "returned":
      return "returned";
    case "rejected":
    case "invalid":
      return "rejected";
    case "valid":
      return "validated";
    case "pending":
    case "processing":
    case "skipped":
    default:
      return "pending";
  }
}

function formatIdType(value?: string): string {
  if (!value) {
    return "Documento";
  }

  const normalized = value.trim().toLowerCase();
  return ID_TYPE_LABELS[normalized] ?? value;
}

function formatAccountType(value?: string): string {
  if (!value) {
    return "Cuenta";
  }

  const normalized = value.trim().toLowerCase();
  return ACCOUNT_TYPE_LABELS[normalized] ?? value;
}

function hasAccountMismatch(errors: BatchTransactionValidationErrorDTO[]): boolean {
  return errors.some((error) => {
    const field = error.field.toLowerCase();
    const code = error.code.toLowerCase();
    return (
      field.includes("account")
      || code.includes("account")
      || code.includes("bank_account")
    );
  });
}

function hasReferenceIssue(errors: BatchTransactionValidationErrorDTO[]): boolean {
  return errors.some((error) => {
    const field = error.field.toLowerCase();
    const code = error.code.toLowerCase();
    return field.includes("reference") || code.includes("reference");
  });
}

function mapRestrictiveList(errors: BatchTransactionValidationErrorDTO[]) {
  const complianceError = errors.find((error) => {
    const field = error.field.toLowerCase();
    const code = error.code.toLowerCase();
    return (
      field.includes("compliance")
      || field.includes("restrictive")
      || code.includes("compliance")
      || code.includes("restrictive")
    );
  });

  if (!complianceError) {
    return null;
  }

  const riskLevel = complianceError.code.toLowerCase().includes("high")
    ? "high"
    : complianceError.code.toLowerCase().includes("low")
      ? "low"
      : "medium";

  return {
    listName: complianceError.message || "Lista restrictiva",
    riskLevel: riskLevel as "low" | "medium" | "high",
  };
}

export class BatchTransactionDetailMapper {
  public static toDomain(dto: BatchTransactionDTO): BatchTransactionDetail {
    const validationErrors = dto.validationErrors ?? [];
    const reference = dto.rawData.reference?.trim() ?? "";
    // API amounts are integer minor units; `payment.amount` is consumed as a
    // major-unit number by Intl.NumberFormat on the transaction detail page.
    const amount = Number(
      minorToMajor(dto.rawData.amount ?? dto.parsedData?.amount ?? 0),
    );

    return {
      id: dto.paymentId ?? dto.id,
      status: mapStatus(dto.status),
      beneficiary: {
        fullName: dto.rawData.beneficiaryName ?? "",
        idType: formatIdType(dto.rawData.idType),
        idNumber: dto.rawData.idNumber ?? "",
        hasIssues: validationErrors.length > 0 || dto.status === "invalid",
      },
      payment: {
        amount,
        accountType: formatAccountType(dto.rawData.accountType),
        bank: dto.rawData.bankName ?? "",
        accountNumber: dto.rawData.accountNumber ?? "",
        accountMismatch: hasAccountMismatch(validationErrors),
      },
      reference: {
        number: reference || null,
        notFound: !reference || hasReferenceIssue(validationErrors),
      },
      restrictiveList: mapRestrictiveList(validationErrors),
    };
  }
}
