import { useMemo } from "react";
import type { Batch } from "../entities/batch.entity";

/**
 * hook to get batch details by id
 * 
 * @param id - batch id
 * @returns batch details
 */
export const useBatchDetail = (id: string) => {
  // Mock batch data - in real implementation this would fetch from API
  const batch: Batch | null = useMemo(() => {
    // Sample batches data
    const batches: Batch[] = [
      {
        id: "1",
        date: "12/02/2026",
        name: "Pago_nómina_15_marzo",
        transactions: 719,
        amount: 39304771.03,
        batchId: "KJSD-2339",
        status: "pending"
      },
      // Add more sample data if needed
    ];

    return batches.find(b => b.id === id) || batches[0];
  }, [id]);

  return { batch };
};
