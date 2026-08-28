import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import {
  BatchUploadService,
  type BatchUploadStatusDTO,
  type UploadBatchFileCommand,
} from "@/features/batches/api/services/batch-upload.service";
import { BatchesService } from "@/features/batches/api/services/batches.service";
import {
  subscribeToBatchUploadEvents,
  type BatchUploadProgressState,
} from "@/lib/realtime/batch-upload.realtime";
import { queryKeys } from "@/lib/query/query-keys";

const INITIAL_PROGRESS: BatchUploadProgressState = {
  status: "idle",
  progress: 0,
};

function mergeUploadProgressState(
  previous: BatchUploadProgressState,
  next: Partial<BatchUploadProgressState>,
): BatchUploadProgressState {
  const nextAmount = next.summary?.totalAmount ?? 0;
  const previousAmount = previous.summary?.totalAmount ?? 0;
  return {
    ...previous,
    ...next,
    summary: next.summary
      ? {
          ...next.summary,
          totalAmount: nextAmount > 0 ? nextAmount : previousAmount,
          invalidRows: next.summary.invalidRows ?? previous.summary?.invalidRows,
        }
      : previous.summary,
    errorMessage: next.errorMessage ?? previous.errorMessage,
  };
}

function mapStatusDtoToProgress(dto: BatchUploadStatusDTO): BatchUploadProgressState {
  return {
    status: dto.status,
    progress: dto.progress,
    uploadId: dto.uploadId,
    fileName: dto.fileName,
    summary: dto.summary ?? undefined,
    errorMessage: dto.errorMessage ?? undefined,
  };
}

export function useBatchUploadProgress(
  batchId: string | null,
  uploadId: string | null,
) {
  const queryClient = useQueryClient();
  const [progress, setProgress] = useState<BatchUploadProgressState>(INITIAL_PROGRESS);

  useEffect(() => {
    if (!batchId) {
      setProgress(INITIAL_PROGRESS);
    }
  }, [batchId]);

  useEffect(() => {
    if (!uploadId) {
      return;
    }

    setProgress((previous) => ({
      ...previous,
      uploadId,
      status: previous.status === "idle" ? "accepted" : previous.status,
      progress: previous.progress > 0 ? previous.progress : 5,
    }));
  }, [uploadId]);

  useEffect(() => {
    if (!batchId) {
      return;
    }

    return subscribeToBatchUploadEvents(batchId, (nextState) => {
      setProgress((previous) => mergeUploadProgressState(previous, nextState));

      if (nextState.status === "completed") {
        void queryClient.invalidateQueries({
          queryKey: queryKeys.batches.detail(batchId),
        });
        void queryClient.invalidateQueries({ queryKey: ["batches"] });
      }
    });
  }, [batchId, queryClient]);

  useEffect(() => {
    if (!uploadId) {
      return;
    }

    let disposed = false;
    let timer: ReturnType<typeof setInterval> | null = null;

    const poll = async() => {
      try {
        const result = await BatchUploadService.getUploadStatus(uploadId);
        if (disposed || !result.data) {
          return;
        }

        setProgress((previous) =>
          mergeUploadProgressState(previous, mapStatusDtoToProgress(result.data!)),
        );

        if (result.data.status === "completed" || result.data.status === "failed") {
          if (timer) {
            clearInterval(timer);
            timer = null;
          }

          if (result.data.status === "completed" && batchId) {
            void queryClient.invalidateQueries({
              queryKey: queryKeys.batches.detail(batchId),
            });
            void queryClient.invalidateQueries({ queryKey: ["batches"] });
          }
        }
      } catch {
        // polling is best-effort when websocket is unavailable
      }
    };

    void poll();
    timer = setInterval(() => {
      void poll();
    }, 1500);

    return () => {
      disposed = true;
      if (timer) {
        clearInterval(timer);
      }
    };
  }, [uploadId, batchId, queryClient]);

  return progress;
}

export function useUploadBatchFile() {
  const { t } = useTranslation(["batches"]);

  return useMutation({
    mutationKey: [BatchUploadService.UPLOAD_BATCH_FILE_KEY],
    mutationFn: (command: UploadBatchFileCommand) => BatchUploadService.upload(command),
    meta: {
      showMessageOnSuccess: false,
      errorMessage: t("batches:errors.upload_failed", {
        defaultValue: "Error al subir el archivo del lote",
      }),
    },
  });
}

export function useDownloadBatchTemplate() {
  const { t } = useTranslation(["batches"]);

  return useMutation({
    mutationKey: [BatchesService.GET_BATCH_TEMPLATE_KEY],
    mutationFn: () => BatchesService.downloadTemplate(),
    meta: {
      successMessage: t("batches:messages.template_downloaded", {
        defaultValue: "Plantilla descargada correctamente",
      }),
      errorMessage: t("batches:errors.template_download_failed", {
        defaultValue: "Error al descargar la plantilla",
      }),
    },
  });
}
