import type {
  BankAccountListItemDTO,
  BeneficiaryDetailDTO,
  BeneficiaryListItemDTO,
  CardMovementDTO,
} from "@/features/beneficiaries/api/dtos/beneficiary.dto";
import type {
  BankAccount,
  Beneficiary,
  BeneficiaryDetail,
  BeneficiaryTransaction,
  CardMovement,
} from "@/features/beneficiaries/application/entities/beneficiary.entity";
import type { PaymentListItemDTO } from "@/features/transactions/api/dtos/payment.dto";
import {
  getCurrencyUpperForCountry,
  getStoredCountryCodeAlpha3,
} from "@/lib/country/country-code";
import { formatCurrencyDisplay } from "@/lib/utils/currency.utils";
import { formatDisplayDate } from "@/lib/utils/date.utils";
import { canonicalizeDocumentType } from "@/lib/document-type";

function mapListStatus(flags: BeneficiaryListItemDTO["flags"]): "warning" | "success" {
  if (flags.hasComplianceIssues || flags.hasPendingPayments || flags.hasUpdates) {
    return "warning";
  }
  return "success";
}

const ACCOUNT_TYPE_LABELS: Record<string, string> = {
  savings: "Ahorros",
  checking: "Corriente",
};

function mapPaymentStatus(status: string): BeneficiaryTransaction["status"] {
  if (status === "paid" || status === "validated") return "completed";
  if (status === "rejected" || status === "returned") return "failed";
  return "pending";
}

export class BeneficiaryMapper {
  public static toDomain(dto: BeneficiaryListItemDTO): Beneficiary {
    return {
      id: dto.id,
      name: dto.fullName,
      idNumber: dto.identificationDocument?.numberFormatted
        ?? dto.identificationDocument?.number
        ?? "",
      account: dto.totalPaid
        ? formatCurrencyDisplay(dto.totalPaid.amount, dto.totalPaid.currency)
        : "$0,00",
      status: mapListStatus(dto.flags),
    };
  }

  public static toDomainList(dtos: BeneficiaryListItemDTO[]): Beneficiary[] {
    return dtos.map(BeneficiaryMapper.toDomain);
  }

  public static toDetail(dto: BeneficiaryDetailDTO, bankAccount?: BankAccountListItemDTO): BeneficiaryDetail {
    return {
      fullName: dto.fullName,
      hasUpdates: dto.flags.hasUpdates ?? false,
      hasPendingPayments: dto.flags.hasPendingPayments ?? false,
      identificationDocument: {
        type: canonicalizeDocumentType(dto.identificationDocument?.type) ?? "CC",
        number: dto.identificationDocument?.numberFormatted
          ?? dto.identificationDocument?.number
          ?? "",
      },
      bankAccount: bankAccount
        ? {
          type: ACCOUNT_TYPE_LABELS[bankAccount.accountType] ?? bankAccount.accountType,
          bank: bankAccount.bankName,
          number: bankAccount.accountNumberFormatted ?? bankAccount.accountNumber,
        }
        : {
          type: "",
          bank: "",
          number: "",
        },
      totalPaid: dto.totalPaid ?? {
        amount: 0,
        currency: getCurrencyUpperForCountry(getStoredCountryCodeAlpha3()),
        countryCode: getStoredCountryCodeAlpha3(),
      },
    };
  }
}

export class BankAccountMapper {
  public static toDomain(dto: BankAccountListItemDTO): BankAccount {
    return {
      id: dto.id,
      bank: dto.bankName,
      accountType: ACCOUNT_TYPE_LABELS[dto.accountType] ?? dto.accountType,
      accountNumber: dto.accountNumberFormatted ?? dto.accountNumber,
      isPrimary: dto.isPrimary,
    };
  }

  public static toDomainList(dtos: BankAccountListItemDTO[]): BankAccount[] {
    return dtos.map(BankAccountMapper.toDomain);
  }
}

export class BeneficiaryTransactionMapper {
  public static toDomain(dto: PaymentListItemDTO): BeneficiaryTransaction {
    return {
      id: dto.id,
      date: formatDisplayDate(dto.createdAt),
      amount: formatCurrencyDisplay(dto.amount, dto.currency),
      reference: dto.reference,
      status: mapPaymentStatus(dto.status),
    };
  }

  public static toDomainList(dtos: PaymentListItemDTO[]): BeneficiaryTransaction[] {
    return dtos.map(BeneficiaryTransactionMapper.toDomain);
  }
}

export class CardMovementMapper {
  public static toDomain(dto: CardMovementDTO): CardMovement {
    return {
      id: dto.id,
      date: formatDisplayDate(dto.createdAt),
      amount: formatCurrencyDisplay(dto.amount, dto.currency),
      type: dto.type,
    };
  }

  public static toDomainList(dtos: CardMovementDTO[]): CardMovement[] {
    return dtos.map(CardMovementMapper.toDomain);
  }
}
