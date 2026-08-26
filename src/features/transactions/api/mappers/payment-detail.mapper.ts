import type {
  PaymentDetailDTO,
  PaymentTimelineDTO,
} from "@/features/transactions/api/dtos/payment-detail.dto";
import type { TransactionDetail, TransactionTimelineItem } from "@/features/transactions/application/entities/transaction-detail.entity";
import { normalizePaymentStatus } from "@/features/transactions/application/utils/transaction-status";
import { formatDisplayDate } from "@/lib/utils/date.utils";
import { documentTypeLabel } from "@/lib/document-type";
import { format } from "date-fns";
import { es } from "date-fns/locale";

const ACCOUNT_TYPE_LABELS: Record<string, string> = {
  savings: "Ahorros",
  checking: "Corriente",
  ahorros: "Ahorros",
  corriente: "Corriente",
};

function formatTimelineTime(value: string): string {
  const date = new Date(value);
  return format(date, "dd MMMM. hh:mm a", { locale: es });
}

function mapTimelineStatus(
  event: string,
  index: number,
  total: number,
): TransactionTimelineItem["status"] {
  if (index === 0) return "complete";
  if (index === 1 && total > 2) return "active";
  return "pending";
}

function mapTimelineTitle(event: string): string {
  const titles: Record<string, string> = {
    created: "Pago iniciado",
    validated: "Pago validado",
    paid: "Pago completado con éxito.",
    returned: "Pago retornado",
    rejected: "Pago rechazado",
    dispatched: "En proceso",
    "compliance-review": "En revisión de cumplimiento",
    "compliance-passed": "Cumplimiento aprobado",
    "compliance-failed": "Cumplimiento fallido",
    "funds-reserved": "Fondos reservados",
    "funds-released": "Fondos liberados",
    "funds-committed": "Fondos debitados",
    corrected: "Pago corregido",
    approved: "Pago aprobado",
    refunded: "Pago reembolsado",
  };

  return titles[event.replace(/_/g, "-")] ?? "Actualización de pago";
}

export class PaymentDetailMapper {
  public static toDomain(
    detail: PaymentDetailDTO,
    timeline?: PaymentTimelineDTO,
  ): TransactionDetail {
    const accountType = ACCOUNT_TYPE_LABELS[detail.destination.accountType.toLowerCase()]
      ?? detail.destination.accountType;

    return {
      id: detail.id,
      date: formatDisplayDate(detail.createdAt),
      beneficiary: detail.beneficiary.fullName,
      idNumber: detail.beneficiary.idNumber,
      amount: detail.amount,
      reference: detail.reference,
      status: normalizePaymentStatus(detail.status),
      idTypeLabel: documentTypeLabel(detail.beneficiary.idType),
      destinationAccountLabel: `${accountType}. ${detail.destination.bank} Nº ${detail.destination.accountNumber}`,
      sourceAccountName: detail.sourceAccountName ?? "Cuenta",
      statusReason: detail.returnReason ?? detail.rejectionReason,
      timeline: PaymentDetailMapper.toTimeline(timeline),
    };
  }

  public static toTimeline(timeline?: PaymentTimelineDTO): TransactionTimelineItem[] {
    if (!timeline?.events?.length) {
      return [];
    }

    return timeline.events.map((event, index, events) => ({
      id: event.id,
      title: event.message ?? mapTimelineTitle(event.event),
      description: event.message,
      time: formatTimelineTime(event.createdAt),
      status: mapTimelineStatus(event.event, index, events.length),
    }));
  }
}
