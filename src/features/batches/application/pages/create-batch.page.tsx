import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { usePortalContainer } from "@adamosuiteservices/ui/use-portal-container";
import { createPortal } from "react-dom";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
} from "@adamosuiteservices/ui/breadcrumb";
import { PageContainer } from "@/features/common/components/layout/page-container";
import { Card } from "@adamosuiteservices/ui/card";
import { Button } from "@adamosuiteservices/ui/button";
import { Icon } from "@adamosuiteservices/ui/icon";
import { FileUpload } from "@adamosuiteservices/ui/file-upload";
import { CountryFlag } from "@/features/common/components/flags/country-flag";
import { useCountry } from "@/features/common/contexts/use-country";
import { majorToMinor, minorToMajor, toMinorInt } from "@/lib/money/money";
import { useNavigate, useBlocker, useLocation } from "react-router";
import { useAccounts } from "@/features/accounts/application/hooks/use-accounts";
import { DebitAccountPicker } from "@/features/accounts/application/components/debit-account-picker";
import { useAutoSelectDebitAccount } from "@/features/auth/application/hooks/use-auto-select-debit-account";
import { usePermissions } from "@/features/auth/application/hooks/use-permissions";
import { PermissionGate } from "@/features/auth/application/components/permission-gate";
import {
  useCreateBatch,
  useProcessBatch,
  useUpdateBatch,
} from "@/features/batches/application/hooks/use-batch-mutations";
import { useBatchesRealtime, useBatchScreeningLive } from "@/features/batches/application/hooks/use-batches-realtime";
import {
  useBatchUploadProgress,
  useDownloadBatchTemplate,
  useUploadBatchFile,
} from "@/features/batches/application/hooks/use-batch-upload";
import { useBatchDetail } from "@/features/batches/application/hooks/use-batch-detail";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@adamosuiteservices/ui/dialog";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@adamosuiteservices/ui/input-otp";

/**
 * create batch page
 * 
 * allows users to upload a file to create a new batch of payments
 */
export const CreateBatchPage = () => {
  const { t } = useTranslation("batches");
  const navigate = useNavigate();
  const location = useLocation();
  const { countryCode, currency, currencyUpper, locale } = useCountry();
  const sidebarTopBarPortal = usePortalContainer("[data-slot='sidebar-top-bar-portal']");

  // Get file from navigation state if coming from home
  const fileFromNavigation = (location.state as { file?: File })?.file;
  
  const [file, setFile] = useState<File | null>(fileFromNavigation || null);
  const [batchId, setBatchId] = useState<string | null>(null);
  const [uploadId, setUploadId] = useState<string | null>(null);
  const [uploadRequestId, setUploadRequestId] = useState<string | null>(null);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [isOtpDialogOpen, setIsOtpDialogOpen] = useState(false);
  const [otpCode, setOtpCode] = useState("");

  const createBatch = useCreateBatch();
  const uploadBatchFile = useUploadBatchFile();
  const downloadTemplate = useDownloadBatchTemplate();
  const processBatch = useProcessBatch();
  const updateBatch = useUpdateBatch();
  const { totalBalance, accounts, isLoading: isAccountsLoading } = useAccounts();
  const { capabilities } = usePermissions();
  const { batch } = useBatchDetail(batchId ?? "");
  useBatchesRealtime(batchId ?? undefined);
  const screeningLive = useBatchScreeningLive(batchId ?? undefined);
  const [sourceAccountId, setSourceAccountId] = useState<string>();
  useAutoSelectDebitAccount(accounts, sourceAccountId, setSourceAccountId);
  const uploadProgress = useBatchUploadProgress(batchId, uploadId);
  
  // Track if we're processing the batch to avoid blocker interference
  const isProcessingRef = useRef(false);
  const uploadStartedForBatchRef = useRef<string | null>(null);

  // Clear navigation state after reading the file to avoid reloading on refresh
  useEffect(() => {
    if (fileFromNavigation) {
      window.history.replaceState({}, document.title);
    }
  }, [fileFromNavigation]);

  // Block navigation when there's unsaved data
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      !isProcessingRef.current && file !== null && currentLocation.pathname !== nextLocation.pathname,
  );

  // balance from accounts summary
  const balance = totalBalance;
  const acceptedExtensions = [".xlsx", ".csv", ".numbers"];
  const maxSizeInMB = 50;

  useEffect(() => {
    if (uploadProgress.requestId && !uploadRequestId) {
      setUploadRequestId(uploadProgress.requestId);
    }
  }, [uploadProgress.requestId, uploadRequestId]);

  // Country switch invalidates the in-progress batch; start clean for the new country.
  useEffect(() => {
    setBatchId(null);
    setUploadId(null);
    setUploadRequestId(null);
    setSourceAccountId(undefined);
    uploadStartedForBatchRef.current = null;
  }, [countryCode]);

  useEffect(() => {
    setBatchId(null);
    setUploadId(null);
    setUploadRequestId(null);
    uploadStartedForBatchRef.current = null;
  }, [file]);

  useEffect(() => {
    if (!file || batchId || createBatch.isPending) {
      return;
    }

    void createBatch.mutateAsync({
      batchId: crypto.randomUUID(),
      name: file.name.replace(/\.[^.]+$/, ""),
      currency,
      countryCode,
    }).then((result) => {
      if (result.data?.id) {
        setBatchId(result.data.id);
      }
    });
  }, [file, batchId, createBatch, currency, countryCode]);

  useEffect(() => {
    if (!file || !batchId || uploadBatchFile.isPending) {
      return;
    }

    if (uploadStartedForBatchRef.current === batchId) {
      return;
    }

    uploadStartedForBatchRef.current = batchId;

    void uploadBatchFile.mutateAsync({
      batchId,
      file,
    }).then((result) => {
      if (result.data?.uploadId) {
        setUploadId(result.data.uploadId);
      }
      if (result.data?.requestId) {
        setUploadRequestId(result.data.requestId);
      }
    });
  }, [file, batchId, uploadBatchFile]);

  const uploadStatusKey
    = uploadProgress.status === "idle" && createBatch.isPending
      ? "creating"
      : uploadProgress.status === "idle" && uploadBatchFile.isPending
        ? "accepted"
        : uploadProgress.status;

  const uploadPhaseFallback: Record<string, string> = {
    idle: "Esperando archivo...",
    creating: "Creando lote...",
    accepted: "Archivo recibido, iniciando procesamiento...",
    uploading: "Subiendo archivo a almacenamiento...",
    parsing: "Leyendo filas del archivo...",
    ingesting: "Registrando beneficiarios en el lote...",
    completed: "Archivo procesado correctamente",
    failed: "No se pudo completar el procesamiento",
  };

  const uploadPhaseLabel = t(`batches.create_batch.upload_status.${uploadStatusKey}`, {
    defaultValue: uploadPhaseFallback[uploadStatusKey] ?? "Procesando...",
    progress: uploadProgress.progress,
  });

  const isUploadProcessing
    = uploadStatusKey === "creating"
      || uploadStatusKey === "accepted"
      || uploadStatusKey === "uploading"
      || uploadStatusKey === "parsing"
      || uploadStatusKey === "ingesting";

  const isUploadReady = uploadProgress.status === "completed";
  const screening = batch?.screening;
  const isScreening
    = isUploadReady
      && (batch?.lastAction === "screening"
        || (screening?.pending ?? 0) > 0);
  const sendableCount = screening?.allow ?? batch?.validItems ?? 0;
  const canConfirmProcess
    = isUploadReady
      && uploadProgress.status !== "failed"
      && Boolean(sourceAccountId)
      && !isScreening
      && sendableCount > 0;

  const uploadSummary = uploadProgress.summary;
  const resolvedTotalAmountMinor
    = uploadSummary?.totalAmount && uploadSummary.totalAmount > 0
      ? toMinorInt(uploadSummary.totalAmount)
      : batch?.amount && batch.amount > 0
        ? majorToMinor(String(batch.amount))
        : 0;
  const hasUploadSummary = Boolean(
    uploadSummary
    && uploadSummary.totalItems > 0
    && resolvedTotalAmountMinor > 0,
  );
  const batchSummary = file
    ? {
        totalBeneficiaries:
          uploadSummary?.totalItems
          ?? batch?.transactions
          ?? 0,
        totalToPay: resolvedTotalAmountMinor,
        balanceAfter: 0,
        isReady: isUploadReady || (batch?.transactions ?? 0) > 0,
        isCalculating: isUploadProcessing && !hasUploadSummary,
      }
    : null;

  /**
   * format currency amount
   */
  const formatAmount = (amountMinor: number): string => {
    const [whole, fraction = "00"] = minorToMajor(amountMinor).replace("-", "").split(".");
    const sign = amountMinor < 0 ? "-" : "";
    const wholeFormatted = new Intl.NumberFormat(locale, {
      maximumFractionDigits: 0,
    }).format(Number(whole));
    return `${sign}${wholeFormatted},${fraction}`;
  };

  /**
   * prevent navigation when there's unsaved data
   */
  useEffect(() => {
    if (!file) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [file]);

  /**
   * handle navigation with confirmation
   */
  const handleNavigationAttempt = (path: string) => {
    navigate(path);
  };

  /**
   * handle navigation blocker
   */
  useEffect(() => {
    if (blocker.state === "blocked") {
      setIsCancelDialogOpen(true);
    }
  }, [blocker.state]);

  /**
   * handle template download
   */
  const handleDownloadTemplate = () => {
    void downloadTemplate.mutateAsync();
  };

  /**
   * handle cancel batch button click
   */
  const handleCancelBatch = () => {
    setIsCancelDialogOpen(true);
  };

  /**
   * handle discard batch
   */
  const handleDiscardBatch = () => {
    setFile(null);
    setIsCancelDialogOpen(false);
    isProcessingRef.current = false;
    
    // Proceed with the blocked navigation
    if (blocker.state === "blocked") {
      blocker.proceed();
    }
  };

  /**
   * handle continue editing
   */
  const handleContinueEditing = () => {
    setIsCancelDialogOpen(false);
    isProcessingRef.current = false;
    
    // Reset the blocked navigation
    if (blocker.state === "blocked") {
      blocker.reset();
    }
  };

  /**
   * handle confirm batch
   */
  const handleConfirmBatch = () => {
    setIsOtpDialogOpen(true);
  };

  /**
   * handle process batch with OTP
   */
  const handleProcessBatch = async() => {
    if (!batchId || !sourceAccountId) {
      return;
    }

    try {
      await updateBatch.mutateAsync({
        batchId,
        sourceAccountId,
      });

      await processBatch.mutateAsync({
        batchId,
        totp: otpCode || undefined,
      });

      isProcessingRef.current = true;
      setIsOtpDialogOpen(false);
      setOtpCode("");
      navigate("/batches", { state: { showSuccessToast: true } });
    } catch {
      setIsOtpDialogOpen(false);
      setOtpCode("");
    }
  };

  /**
   * handle save batch for later processing
   */
  const handleSaveForLater = async() => {
    if (!batchId) {
      return;
    }

    try {
      await updateBatch.mutateAsync({
        batchId,
        lastAction: "saved_pending",
        ...(sourceAccountId ? { sourceAccountId } : {}),
      });

      isProcessingRef.current = true;
      navigate("/batches", { state: { showSavedToast: true } });
    } catch {
      // keep user on page to retry
    }
  };

  return (
    <>
      {sidebarTopBarPortal && createPortal(
        <Breadcrumb>
          <BreadcrumbList className="flex-nowrap">
            <BreadcrumbItem className={`
              hidden
              md:block
            `}
            >
              <BreadcrumbLink 
                onClick={(e) => {
                  e.preventDefault();
                  handleNavigationAttempt("/batches");
                }}
                className="cursor-pointer"
              >
                {t("batches.page_title")}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbItem className="md:hidden">
              <button
                onClick={(e) => {
                e.preventDefault();
                handleNavigationAttempt("/batches");
              }}
                className="flex h-9 w-9 items-center justify-center"
              >
                <BreadcrumbEllipsis />
              </button>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem className="min-w-0">
              <BreadcrumbPage className="truncate">{t("batches.create_batch.breadcrumb_title")}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>,
        sidebarTopBarPortal,
      )}
      
      <PageContainer>
        <Card className="flex flex-col gap-4 border-[#e2e3e5] p-6">
          {/* content section: wallet + file upload */}
          <div className="flex flex-col gap-4">
            <PermissionGate when={capabilities.canViewBalance}>
            <div className={`
              rounded-3xl bg-gradient-to-r from-[#e5f3fa] to-white p-6
            `}
            >
              <div className="flex flex-col gap-4">
                <div className="text-sm leading-5 font-bold text-foreground">
                  {t("batches.create_batch.balance_title")}
                </div>
                
                <div className="flex items-center justify-between">
                  {/* balance amount */}
                  <div className={`
                    inline-flex h-14 items-center gap-3 rounded-full bg-white
                    px-4 py-4
                  `}
                  >
                    <CountryFlag countryCode={countryCode} />
                    <span className="text-sm font-bold text-foreground">
                      {balance}
                    </span>
                    <span className="text-sm text-foreground">
                      {currencyUpper}
                    </span>
                  </div>

                  {/* manage accounts link */}
                  <Button 
                    variant="link" 
                    className="h-6 p-0 text-pay-500"
                    onClick={(e) => {
                      e.preventDefault();
                      handleNavigationAttempt("/accounts");
                    }}
                  >
                    {t("batches.create_batch.manage_accounts")}
                    <Icon symbol="chevron_forward" weight={200} />
                  </Button>
                </div>
              </div>
            </div>
            </PermissionGate>

            {/* file upload */}
            <FileUpload
              selectedFile={file}
              onFileSelect={setFile}
              acceptedExtensions={acceptedExtensions}
              maxSizeInMB={maxSizeInMB}
              labels={{
                dragDrop: t("batches.create_batch.file_upload.drag_drop"),
                selectFile: t("batches.create_batch.file_upload.select_file"),
                fileRequirements: t("batches.create_batch.file_upload.file_requirements", {
                  extensions: acceptedExtensions.join(", "),
                  size: maxSizeInMB,
                }),
              }}
            />

            {/* template download link - only show when no file is uploaded */}
            {!file && (
              <div className="flex items-center gap-3">
                <p className="text-sm text-foreground">
                  {t("batches.create_batch.template_question")}
                </p>
                <Button 
                  variant="link" 
                  className="h-6 px-0 text-pay-500"
                  onClick={handleDownloadTemplate}
                  disabled={downloadTemplate.isPending}
                >
                  {t("batches.create_batch.template_download")}
                </Button>
              </div>
            )}
          </div>

          {/* batch summary - only show when file is uploaded */}
          {batchSummary && (
            <Card className="flex flex-col gap-6 border-0 bg-[#f9fafb] p-6">
              <div className="flex flex-col gap-3 rounded-xl bg-white p-4">
                <div className="flex flex-wrap items-center gap-3">
                  <div className={`
                    inline-flex items-center gap-2 rounded-full bg-[#eef6fb]
                    px-3 py-1.5
                  `}
                  >
                    {isUploadProcessing && (
                      <Icon
                        symbol="progress_activity"
                        weight={200}
                        className="animate-spin text-[#384250]"
                      />
                    )}
                    {isUploadReady && isScreening && (
                      <Icon
                        symbol="progress_activity"
                        weight={200}
                        className="animate-spin text-[#384250]"
                      />
                    )}
                    {isUploadReady && !isScreening && (
                      <Icon
                        symbol="check_circle"
                        weight={200}
                        className="text-green-600"
                      />
                    )}
                    {uploadProgress.status === "failed" && (
                      <Icon
                        symbol="error"
                        weight={200}
                        className="text-[#bf3636]"
                      />
                    )}
                    <span className="text-sm font-semibold text-[#384250]">
                      {isScreening
                        ? t("batches.create_batch.upload_status.screening", {
                            defaultValue: "Validando cumplimiento de cada fila...",
                          })
                        : uploadPhaseLabel}
                    </span>
                    {isUploadProcessing && (
                      <span className="text-xs font-medium text-[#6c737f]">
                        {uploadProgress.progress}%
                      </span>
                    )}
                  </div>

                  {(uploadRequestId || uploadId) && (
                    <span className="text-xs text-[#6c737f]">
                      {uploadId ? `Upload ID: ${uploadId}` : null}
                      {uploadRequestId ? ` · Request ID: ${uploadRequestId}` : null}
                    </span>
                  )}
                </div>

                {isUploadProcessing && (
                  <div className={`
                    h-2 w-full overflow-hidden rounded-full bg-[#e5eef5]
                  `}
                  >
                    <div
                      className={`
                        h-full rounded-full bg-pay-500 transition-all
                        duration-500
                      `}
                      style={{ width: `${Math.max(uploadProgress.progress, 5)}%` }}
                    />
                  </div>
                )}

                {uploadProgress.status === "failed" && (
                  <p className="whitespace-pre-wrap text-sm text-[#bf3636]">
                    {uploadProgress.errorMessage
                      ?? t("batches.create_batch.upload_failed", {
                        defaultValue: "No se pudo procesar el archivo. Intenta subirlo de nuevo.",
                      })}
                  </p>
                )}
              </div>

              {/* title */}
              <p className="text-sm text-[#384250]">
                {t("batches.create_batch.batch_summary.title")}
              </p>

              {/* summary cards */}
              <div className="flex flex-wrap gap-4">
                {/* total beneficiaries */}
                <Card className="min-w-[230px] flex-1 border-0 bg-white p-4">
                  <div className="flex flex-col gap-2">
                    <p className="text-xs text-[#6c737f]">
                      {t("batches.create_batch.batch_summary.total_beneficiaries")}
                    </p>
                    <div className="flex items-center gap-2 pl-2">
                      <Icon
                        symbol="person"
                        weight={200}
                        className="text-[#384250]"
                      />
                      <p className="text-sm font-semibold text-[#384250]">
                        {batchSummary.isCalculating
                          ? t("batches.create_batch.batch_summary.calculating", {
                              defaultValue: "Calculando...",
                            })
                          : batchSummary.totalBeneficiaries}
                      </p>
                    </div>
                  </div>
                </Card>

                {/* total to pay */}
                <Card className="min-w-[230px] flex-1 border-0 bg-white p-4">
                  <div className="flex flex-col gap-2">
                    <p className="text-xs text-[#6c737f]">
                      {t("batches.create_batch.batch_summary.total_to_pay")}
                    </p>
                    <div className="flex items-center gap-2 pl-2">
                      <Icon
                        symbol="paid"
                        weight={200}
                        className="text-[#384250]"
                      />
                      <p className="text-sm font-semibold text-[#384250]">
                        {batchSummary.isCalculating
                          ? t("batches.create_batch.batch_summary.calculating", {
                              defaultValue: "Calculando...",
                            })
                          : `${formatAmount(batchSummary.totalToPay)} ${currencyUpper}`}
                      </p>
                    </div>
                  </div>
                </Card>

                {/* balance after transaction */}
                <Card className="min-w-[230px] flex-1 border-0 bg-white p-4">
                  <div className="flex flex-col gap-2">
                    <p className="text-xs text-[#6c737f]">
                      {t("batches.create_batch.batch_summary.balance_after")}
                    </p>
                    <div className="flex items-center gap-2 pl-2">
                      <Icon
                        symbol="paid"
                        weight={200}
                        className="text-[#384250]"
                      />
                      <p className="text-sm font-semibold text-[#384250]">
                        {formatAmount(batchSummary.balanceAfter)} {currencyUpper}
                      </p>
                    </div>
                  </div>
                </Card>
              </div>

              {isUploadReady && screening && (
                <div className="flex flex-col gap-4">
                  <div className="flex flex-wrap gap-4">
                    <Card className="min-w-[140px] flex-1 border-0 bg-white p-4">
                      <p className="text-xs text-[#6c737f]">{t("batches.screening.allow")}</p>
                      <p className="text-sm font-semibold text-[#384250]">{screening.allow}</p>
                    </Card>
                    <Card className="min-w-[140px] flex-1 border-0 bg-white p-4">
                      <p className="text-xs text-[#6c737f]">{t("batches.screening.blocked")}</p>
                      <p className="text-sm font-semibold text-[#384250]">{screening.blocked}</p>
                    </Card>
                    <Card className="min-w-[140px] flex-1 border-0 bg-white p-4">
                      <p className="text-xs text-[#6c737f]">{t("batches.screening.review")}</p>
                      <p className="text-sm font-semibold text-[#384250]">
                        {screening.review + screening.clientReview}
                      </p>
                    </Card>
                    <Card className="min-w-[140px] flex-1 border-0 bg-white p-4">
                      <p className="text-xs text-[#6c737f]">{t("batches.screening.pending")}</p>
                      <p className="text-sm font-semibold text-[#384250]">{screening.pending}</p>
                    </Card>
                  </div>

                  {isScreening && screeningLive.current && (
                    <p className="text-sm text-[#384250]">
                      {t("batches.screening.processing_row", {
                        row: screeningLive.current.currentIndex ?? screeningLive.current.rowNumber,
                        total: screeningLive.current.totalItems ?? batch?.transactions ?? screeningLive.rows.length,
                        name: screeningLive.current.beneficiaryName ?? `#${screeningLive.current.rowNumber}`,
                      })}
                    </p>
                  )}

                  {screeningLive.rows.length > 0 && (
                    <div className="max-h-48 overflow-y-auto rounded-xl bg-white p-4">
                      {screeningLive.rows.map((row) => (
                        <div
                          key={row.rowNumber}
                          className="flex items-center justify-between gap-3 py-1 text-sm text-[#384250]"
                        >
                          <span>
                            {t("batches.screening.row_label", {
                              row: row.rowNumber,
                              name: row.beneficiaryName ?? "",
                            })}
                          </span>
                          <span className="font-semibold">
                            {row.phase === "screening"
                              ? t("batches.screening.verdict.pending")
                              : t(`batches.screening.verdict.${row.verdict ?? "pending"}`)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </Card>
          )}

          {/* source account selection - only once the batch total is known */}
          {batchSummary && !batchSummary.isCalculating && (
            <Card className="flex flex-col gap-4 border-0 bg-[#f9fafb] p-6">
              <p className="text-sm text-[#384250]">
                {t("batches.create_batch.source_account.title", {
                  defaultValue: "Cuenta de origen",
                })}
              </p>
              <DebitAccountPicker
                accounts={accounts}
                value={sourceAccountId}
                onValueChange={setSourceAccountId}
                isLoading={isAccountsLoading}
                insufficientBalanceOf={batchSummary.totalToPay}
                insufficientLabel={t("batches.create_batch.source_account.insufficient_balance", {
                  defaultValue: "Saldo insuficiente",
                })}
              />
            </Card>
          )}

          {/* action buttons - only show when file is uploaded */}
          {batchSummary && (
            <div className="mt-8 flex flex-wrap items-center gap-6">
              <div className="flex gap-6">
                <Button variant="secondary" onClick={handleCancelBatch}>
                  {t("batches.create_batch.actions.cancel")}
                </Button>
                {capabilities.canDispatchBatch && (
                  <Button
                    variant="default"
                    onClick={handleConfirmBatch}
                    disabled={!canConfirmProcess}
                  >
                    <Icon symbol="check" weight={200} />
                    {t("batches.create_batch.actions.confirm")}
                  </Button>
                )}
              </div>
              <div className="flex-1" />
              <Button variant="link" onClick={handleSaveForLater}>
                {t("batches.create_batch.actions.save_for_later")}
              </Button>
            </div>
          )}
        </Card>
      </PageContainer>

      {/* cancel confirmation dialog */}
      <Dialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
        <DialogContent className="gap-12">
          <DialogHeader>
            <DialogTitle>{t("batches.create_batch.cancel_dialog.title")}</DialogTitle>
            <DialogDescription>
              {t("batches.create_batch.cancel_dialog.description")}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-6">
            <Button 
              variant="secondary" 
              className={`
                bg-[#fdecec] text-[#bf3636]
                hover:bg-[#fcd9d9]
              `}
              onClick={handleDiscardBatch}
            >
              {t("batches.create_batch.cancel_dialog.discard")}
            </Button>
            <Button 
              variant="default" 
              onClick={handleContinueEditing}
            >
              {t("batches.create_batch.cancel_dialog.continue_editing")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* OTP confirmation dialog */}
      <Dialog
        open={isOtpDialogOpen}
        onOpenChange={(open) => {
        setIsOtpDialogOpen(open);
        if (!open) {
          isProcessingRef.current = false;
          setOtpCode("");
        }
      }}
      >
        <DialogContent className="max-w-[610px] gap-12">
          <DialogHeader className="gap-2">
            <DialogTitle>{t("batches.create_batch.otp_dialog.title")}</DialogTitle>
            <DialogDescription>
              {t("batches.create_batch.otp_dialog.description")}
            </DialogDescription>
          </DialogHeader>

          <InputOTP
            maxLength={6}
            value={otpCode}
            onChange={setOtpCode}
          >
            <InputOTPGroup className="w-full gap-2">
              <InputOTPSlot index={0} className="h-10 flex-1" />
              <InputOTPSlot index={1} className="h-10 flex-1" />
              <InputOTPSlot index={2} className="h-10 flex-1" />
              <InputOTPSlot index={3} className="h-10 flex-1" />
              <InputOTPSlot index={4} className="h-10 flex-1" />
              <InputOTPSlot index={5} className="h-10 flex-1" />
            </InputOTPGroup>
          </InputOTP>

          <DialogFooter className="gap-6">
            <Button 
              variant="secondary" 
              onClick={() => {
                setIsOtpDialogOpen(false);
              }}
            >
              {t("batches.create_batch.otp_dialog.cancel")}
            </Button>
            <Button 
              variant="default" 
              onClick={handleProcessBatch}
              disabled={otpCode.length !== 6}
            >
              {t("batches.create_batch.otp_dialog.confirm")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
