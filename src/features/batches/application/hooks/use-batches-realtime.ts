import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { subscribeToBatchStatusEvents } from "@/lib/realtime/batch-status.realtime";

export type LiveScreeningRow = {
  rowNumber: number
  beneficiaryName?: string
  phase: "screening" | "screened"
  status?: string
  verdict?: string
  currentIndex?: number
  totalItems?: number
};

/**
 * Keeps batch data live without a manual reload. Call with no `batchId` on
 * the /batches list page (org-wide feed); pass a `batchId` on the batch
 * detail page to also pick up per-batch updates while the connection is
 * scoped there. Any `batch.status.updated` push invalidates every query
 * under the "batches" key — list, detail, transactions and timeline all
 * share that prefix (see queryKeys.batches), so one invalidation refreshes
 * whichever of those is currently mounted. Same broad-invalidate pattern
 * already used by use-batch-upload.ts on upload completion.
 */
export function useBatchesRealtime(batchId?: string): void {
  const queryClient = useQueryClient();

  useEffect(() => {
    const unsubscribe = subscribeToBatchStatusEvents(() => {
      void queryClient.invalidateQueries({ queryKey: ["batches"] });
    }, batchId);

    return unsubscribe;
  }, [batchId, queryClient]);
}

export function useBatchScreeningLive(batchId?: string) {
  const [current, setCurrent] = useState<LiveScreeningRow | null>(null);
  const [rows, setRows] = useState<LiveScreeningRow[]>([]);

  useEffect(() => {
    setCurrent(null);
    setRows([]);

    if (!batchId) {
      return;
    }

    const unsubscribe = subscribeToBatchStatusEvents((event) => {
      if (event.batchId !== batchId) {
        return;
      }

      if (event.eventType === "batch.screening.completed") {
        setCurrent(null);
        return;
      }

      if (event.rowNumber == null) {
        return;
      }

      const nextRow: LiveScreeningRow = {
        rowNumber: event.rowNumber,
        beneficiaryName: event.beneficiaryName,
        phase: event.eventType === "batch.item.screened" ? "screened" : "screening",
        status: event.itemStatus,
        verdict: event.screeningVerdict,
        currentIndex: event.currentIndex,
        totalItems: event.totalItems,
      };

      if (event.eventType === "batch.item.screening") {
        setCurrent(nextRow);
      }

      if (event.eventType === "batch.item.screened") {
        setCurrent(nextRow);
      }

      setRows((previous) => {
        const withoutCurrent = previous.filter((row) => row.rowNumber !== nextRow.rowNumber);
        return [...withoutCurrent, nextRow].sort((left, right) => left.rowNumber - right.rowNumber);
      });
    });

    return unsubscribe;
  }, [batchId]);

  return { current, rows };
}
