import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { subscribeToBatchStatusEvents } from "@/lib/realtime/batch-status.realtime";

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
