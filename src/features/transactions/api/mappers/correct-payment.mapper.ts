import type { PaymentDetailDTO } from "@/features/transactions/api/dtos/payment-detail.dto";
import type { BatchTransactionDetail } from "@/features/batches/application/entities/batch-transaction-detail.entity";
import type { CorrectPaymentCommand } from "@/features/transactions/application/commands/payment.commands";
import { documentTypeFromLabel, documentTypeLabel } from "@/lib/document-type";

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

function formatIdType(value: string): string {
  return documentTypeLabel(value);
}

function formatAccountType(value: string): string {
  const normalized = value.trim().toLowerCase();
  return ACCOUNT_TYPE_LABELS[normalized] ?? value;
}

export class CorrectPaymentMapper {
  public static toViewModel(detail: PaymentDetailDTO): BatchTransactionDetail {
    return {
      id: detail.id,
      status:
        detail.status === "rejected"
          ? "rejected"
          : detail.status === "returned"
            ? "returned"
            : "pending",
      beneficiary: {
        fullName: detail.beneficiary.fullName,
        idType: formatIdType(detail.beneficiary.idType),
        idNumber: detail.beneficiary.idNumber,
        hasIssues: false,
      },
      payment: {
        amount: detail.amount,
        accountType: formatAccountType(detail.destination.accountType),
        bank: detail.destination.bank,
        accountNumber: detail.destination.accountNumber,
        accountMismatch: false,
      },
      reference: {
        number: detail.reference || null,
        notFound: !detail.reference,
      },
      restrictiveList: null,
      screening: null,
    };
  }

  public static toCorrectPayload(
    paymentId: string,
    transaction: BatchTransactionDetail,
    totp?: string,
  ): CorrectPaymentCommand {
    return {
      paymentId,
      reference: transaction.reference.number ?? undefined,
      beneficiarySnapshot: {
        fullName: transaction.beneficiary.fullName,
        idType: mapDocumentTypeToCode(transaction.beneficiary.idType),
        idNumber: transaction.beneficiary.idNumber.replace(/\./g, ""),
      },
      destinationSnapshot: {
        accountType: transaction.payment.accountType,
        bank: transaction.payment.bank,
        accountNumber: transaction.payment.accountNumber,
      },
      amount: transaction.payment.amount,
      totp: totp,
    };
  }
}

function mapDocumentTypeToCode(displayType: string): string {
  return documentTypeFromLabel(displayType);
}
