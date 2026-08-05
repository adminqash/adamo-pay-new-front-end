import { format } from "date-fns";
import { es } from "date-fns/locale";
import type { BatchTimelineDTO } from "@/features/batches/api/dtos/batch-timeline.dto";
import type { TransactionTimelineItem } from "@/features/transactions/application/entities/transaction-detail.entity";

function formatTimelineTime(value: string): string {
  const date = new Date(value);
  return format(date, "dd MMMM. hh:mm a", { locale: es });
}

function mapTimelineTitle(status: string, type: string): string {
  const titles: Record<string, string> = {
    uploaded: "Lote creado",
    validated: "Validación completada",
    saved_pending: "Lote guardado como pendiente",
    confirmed: "Lote confirmado",
    processing: type === "item" ? "Transacción en proceso" : "Lote en proceso",
    completed: "Lote enviado exitosamente",
    cancelled: "Lote cancelado",
    failed: "Lote fallido",
    paid: "Pago completado",
    rejected: "Pago rechazado",
    returned: "Pago retornado",
    parsed: "Transacción procesada",
    queued: "Transacción en cola",
    processed: "Transacción procesada",
  };

  return titles[status] ?? "Actualización de lote";
}

function mapTimelineDescription(
  status: string,
  metadata?: Record<string, unknown>,
): string | undefined {
  if (status === "completed") {
    return "El lote ha sido procesado y enviado al banco para su ejecución.";
  }

  if (status === "validated") {
    return "Todas las transacciones del lote han sido validadas correctamente.";
  }

  if (status === "processing" && metadata?.rowNumber) {
    return `Procesando fila ${String(metadata.rowNumber)} del lote.`;
  }

  if (status === "uploaded") {
    return "El lote de pagos ha sido creado.";
  }

  return undefined;
}

export class BatchTimelineMapper {
  public static toDomain(timeline: BatchTimelineDTO): TransactionTimelineItem[] {
    if (!timeline.events?.length) {
      return [];
    }

    return timeline.events.map((event, index, events) => ({
      id: `${event.type}-${event.status}-${event.at}`,
      title: mapTimelineTitle(event.status, event.type),
      description: mapTimelineDescription(event.status, event.metadata),
      time: formatTimelineTime(event.at),
      status: index === 0 ? "complete" : index === 1 && events.length > 2 ? "active" : "pending",
    }));
  }
}
