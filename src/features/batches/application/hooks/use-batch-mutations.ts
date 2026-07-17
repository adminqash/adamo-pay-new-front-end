import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { BatchesService } from "@/features/batches/api/services/batches.service";
import type {
  CreateBatchCommand,
  ProcessBatchCommand,
  UpdateBatchCommand,
  UpdateBatchTransactionCommand,
  UpdateBatchTransactionStatusCommand,
} from "@/features/batches/application/commands/batch.commands";
import { queryKeys } from "@/lib/query/query-keys";

function invalidateBatches(queryClient: ReturnType<typeof useQueryClient>) {
  void queryClient.invalidateQueries({ queryKey: ["batches"] });
}

export function useCreateBatch() {
  const queryClient = useQueryClient();
  const { t } = useTranslation(["batches"]);

  return useMutation({
    mutationKey: [BatchesService.CREATE_BATCH_KEY],
    mutationFn: (command: CreateBatchCommand) => BatchesService.create(command),
    meta: {
      errorMessage: t("batches:errors.create_failed", {
        defaultValue: "Error al crear el lote",
      }),
    },
    onSuccess: () => invalidateBatches(queryClient),
  });
}

export function useProcessBatch() {
  const queryClient = useQueryClient();
  const { t } = useTranslation(["batches"]);

  return useMutation({
    mutationKey: [BatchesService.PROCESS_BATCH_KEY],
    mutationFn: (command: ProcessBatchCommand) => BatchesService.process(command),
    meta: {
      successMessage: t("batches:messages.batch_processed", {
        defaultValue: "Lote procesado correctamente",
      }),
      errorMessage: t("batches:errors.process_failed", {
        defaultValue: "Error al procesar el lote",
      }),
    },
    onSuccess: (_data, variables) => {
      invalidateBatches(queryClient);
      void queryClient.invalidateQueries({
        queryKey: queryKeys.batches.detail(variables.batchId),
      });
    },
  });
}

export function useUpdateBatch() {
  const queryClient = useQueryClient();
  const { t } = useTranslation(["batches"]);

  return useMutation({
    mutationKey: [BatchesService.UPDATE_BATCH_KEY],
    mutationFn: (command: UpdateBatchCommand) => BatchesService.update(command),
    meta: {
      successMessage: t("batches:messages.batch_saved", {
        defaultValue: "Lote guardado para revisión posterior",
      }),
      errorMessage: t("batches:errors.update_failed", {
        defaultValue: "Error al actualizar el lote",
      }),
    },
    onSuccess: (_data, variables) => {
      invalidateBatches(queryClient);
      void queryClient.invalidateQueries({
        queryKey: queryKeys.batches.detail(variables.batchId),
      });
    },
  });
}

export function useUpdateBatchTransaction() {
  const queryClient = useQueryClient();
  const { t } = useTranslation(["batches"]);

  return useMutation({
    mutationKey: [BatchesService.UPDATE_BATCH_TRANSACTION_KEY],
    mutationFn: (command: UpdateBatchTransactionCommand) =>
      BatchesService.updateTransaction(command),
    meta: {
      showMessageOnSuccess: false,
      errorMessage: t("batches:errors.transaction_update_failed", {
        defaultValue: "Error al actualizar la transacción",
      }),
    },
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.batches.transactionDetail(
          variables.batchId,
          variables.transactionId,
        ),
      });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.batches.transactions(variables.batchId),
      });
    },
  });
}

export function useUpdateBatchTransactionStatus() {
  const queryClient = useQueryClient();
  const { t } = useTranslation(["batches"]);

  return useMutation({
    mutationKey: [BatchesService.UPDATE_BATCH_TRANSACTION_STATUS_KEY],
    mutationFn: (command: UpdateBatchTransactionStatusCommand) =>
      BatchesService.updateTransactionStatus(command),
    meta: {
      errorMessage: t("batches:errors.transaction_status_failed", {
        defaultValue: "Error al actualizar el estado de la transacción",
      }),
    },
    onSuccess: (_data, variables) => {
      invalidateBatches(queryClient);
      void queryClient.invalidateQueries({
        queryKey: queryKeys.batches.transactionDetail(
          variables.batchId,
          variables.transactionId,
        ),
      });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.batches.transactions(variables.batchId),
      });
    },
  });
}
