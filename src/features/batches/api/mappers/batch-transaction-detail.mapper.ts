import type {
  BatchTransactionDTO,
  BatchTransactionValidationErrorDTO,
} from "@/features/batches/api/dtos/batch-transaction.dto";
import type { BatchTransactionDetail } from "@/features/batches/application/entities/batch-transaction-detail.entity";
import type { TransactionStatus } from "@/features/transactions/application/entities/transaction.entity";
import { normalizeBatchItemStatus } from "@/features/transactions/application/utils/transaction-status";
import { minorToMajor } from "@/lib/money/money";
import { documentTypeLabel } from "@/lib/document-type";

const ACCOUNT_TYPE_LABELS: Record<string, string> = {
  savings: "Ahorros",
  checking: "Corriente",
  ahorros: "Ahorros",
  corriente: "Corriente",
  "37": "Ahorros",
  "27": "Corriente",
  breb: "BreB",
  pix: "PIX",
  clabe: "Clabe Account",
  spei_card: "Spei Card Number",
};

function mapStatus(status: string): TransactionStatus {
  return normalizeBatchItemStatus(status);
}

function formatIdType(value?: string): string {
  return documentTypeLabel(value);
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

function mapRestrictiveList(
  errors: BatchTransactionValidationErrorDTO[],
  screening?: BatchTransactionDTO["screening"] & {
    findings?: Array<{
      codigoLista?: string
      nombreLista?: string
      riskLevel?: number
    }>
    maxRiskLevel?: number
  },
) {
  const findings = screening?.findings ?? [];
  if (findings.length > 0) {
    const primary = findings[0];
    const level = screening?.maxRiskLevel ?? primary.riskLevel ?? 0;
    return {
      listName: primary.nombreLista || primary.codigoLista || "Lista restrictiva",
      riskLevel: (level >= 4 ? "high" : level >= 3 ? "medium" : "low") as "low" | "medium" | "high",
    };
  }

  if (screening?.verdict && screening.verdict !== "allow") {
    const firstReason = screening.reasons?.[0];
    const riskLevel
      = screening.verdict === "blocked"
        ? "high"
        : screening.verdict === "review" || screening.verdict === "client-review"
          ? "medium"
          : "low";

    return {
      listName: firstReason?.detail || firstReason?.code || screening.verdict,
      riskLevel: riskLevel as "low" | "medium" | "high",
    };
  }

  const complianceError = errors.find((error) => {
    const field = error.field.toLowerCase();
    const code = error.code.toLowerCase();
    return (
      field.includes("compliance")
      || field.includes("restrictive")
      || field.includes("screening")
      || code.includes("compliance")
      || code.includes("restrictive")
      || code.includes("blocked")
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
      restrictiveList: mapRestrictiveList(validationErrors, dto.screening),
      screening: dto.screening
        ? {
            verdict: dto.screening.verdict,
            sendable: dto.screening.sendable === true || dto.status === "valid",
            detail:
              dto.screening.reasons?.[0]?.detail
              ?? dto.screening.reasons?.[0]?.code
              ?? validationErrors.find((error) => error.field === "screening")?.message,
            findingsResolved: dto.screening.findingsResolved === true,
            resolution: dto.screening.resolution,
          }
        : null,
    };
  }
}
