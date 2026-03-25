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
import { useNavigate, useBlocker, useLocation } from "react-router";
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
  const sidebarTopBarPortal = usePortalContainer("[data-slot='sidebar-top-bar-portal']");

  // Get file from navigation state if coming from home
  const fileFromNavigation = (location.state as { file?: File })?.file;
  
  const [file, setFile] = useState<File | null>(fileFromNavigation || null);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [isOtpDialogOpen, setIsOtpDialogOpen] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  
  // Track if we're processing the batch to avoid blocker interference
  const isProcessingRef = useRef(false);

  // Clear navigation state after reading the file to avoid reloading on refresh
  useEffect(() => {
    if (fileFromNavigation) {
      window.history.replaceState({}, document.title);
    }
  }, [fileFromNavigation]);

  // Block navigation when there's unsaved data
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      !isProcessingRef.current && file !== null && currentLocation.pathname !== nextLocation.pathname
  );

  // mock balance data - replace with actual API call
  const balance = "$190.034.500,59";
  const currency = "COP";
  const countryCode = "CO";

  // file upload configuration
  const acceptedExtensions = [".xlsx", ".numbers"];
  const maxSizeInMB = 50;

  // mock batch summary data - replace with actual API data processing
  const batchSummary = file ? {
    totalBeneficiaries: 239,
    totalToPay: 123331690.32,
    balanceAfter: 39304771.03,
  } : null;

  /**
   * format currency amount
   */
  const formatAmount = (amount: number): string => {
    return new Intl.NumberFormat("es-CO", {
      style: "decimal",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
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
    // TODO: Implement template download
    console.log("Download template");
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
  const handleProcessBatch = () => {
    // TODO: Implement batch processing with OTP validation
    console.log("Processing batch with OTP:", otpCode);
    
    // Set processing flag to prevent blocker from intercepting
    isProcessingRef.current = true;
    
    // Close dialogs and clear state
    setIsOtpDialogOpen(false);
    setOtpCode("");
    
    // Navigate to batches page with success state
    navigate("/batches", { state: { showSuccessToast: true } });
  };

  return (
    <>
      {sidebarTopBarPortal && createPortal(
        <Breadcrumb>
          <BreadcrumbList className="flex-nowrap">
            <BreadcrumbItem className="hidden md:block">
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
              <button onClick={(e) => {
                e.preventDefault();
                handleNavigationAttempt("/batches");
              }} className="flex h-9 w-9 items-center justify-center">
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
        <Card className="p-6 border-[#e2e3e5] flex flex-col gap-4">
          {/* content section: wallet + file upload */}
          <div className="flex flex-col gap-4">
            {/* wallet card with gradient */}
            <div className="bg-gradient-to-r from-[#e5f3fa] to-white rounded-3xl p-6">
              <div className="flex flex-col gap-4">
                <div className="text-sm text-foreground font-bold leading-5">
                  {t("batches.create_batch.balance_title")}
                </div>
                
                <div className="flex items-center justify-between">
                  {/* balance amount */}
                  <div className="inline-flex items-center gap-3 bg-white rounded-full px-4 py-4 h-14">
                    <CountryFlag countryCode={countryCode} />
                    <span className="text-sm font-bold text-foreground">
                      {balance}
                    </span>
                    <span className="text-sm text-foreground">
                      {currency}
                    </span>
                  </div>

                  {/* manage accounts link */}
                  <Button 
                    variant="link" 
                    className="p-0 h-6 text-pay-500"
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
                  className="h-6 text-pay-500 px-0"
                  onClick={handleDownloadTemplate}
                >
                  {t("batches.create_batch.template_download")}
                </Button>
              </div>
            )}
          </div>

          {/* batch summary - only show when file is uploaded */}
          {batchSummary && (
            <Card className="p-6 bg-[#f9fafb] border-0 flex flex-col gap-6">
              {/* title */}
              <p className="text-sm text-[#384250]">
                {t("batches.create_batch.batch_summary.title")}
              </p>

              {/* summary cards */}
              <div className="flex flex-wrap gap-4">
                {/* total beneficiaries */}
                <Card className="flex-1 min-w-[230px] p-4 bg-white border-0">
                  <div className="flex flex-col gap-2">
                    <p className="text-xs text-[#6c737f]">
                      {t("batches.create_batch.batch_summary.total_beneficiaries")}
                    </p>
                    <div className="flex items-center gap-2 pl-2">
                      <Icon symbol="person" weight={200} className="text-[#384250]" />
                      <p className="text-sm font-semibold text-[#384250]">
                        {batchSummary.totalBeneficiaries}
                      </p>
                    </div>
                  </div>
                </Card>

                {/* total to pay */}
                <Card className="flex-1 min-w-[230px] p-4 bg-white border-0">
                  <div className="flex flex-col gap-2">
                    <p className="text-xs text-[#6c737f]">
                      {t("batches.create_batch.batch_summary.total_to_pay")}
                    </p>
                    <div className="flex items-center gap-2 pl-2">
                      <Icon symbol="paid" weight={200} className="text-[#384250]" />
                      <p className="text-sm font-semibold text-[#384250]">
                        {formatAmount(batchSummary.totalToPay)} {currency}
                      </p>
                    </div>
                  </div>
                </Card>

                {/* balance after transaction */}
                <Card className="flex-1 min-w-[230px] p-4 bg-white border-0">
                  <div className="flex flex-col gap-2">
                    <p className="text-xs text-[#6c737f]">
                      {t("batches.create_batch.batch_summary.balance_after")}
                    </p>
                    <div className="flex items-center gap-2 pl-2">
                      <Icon symbol="paid" weight={200} className="text-[#384250]" />
                      <p className="text-sm font-semibold text-[#384250]">
                        {formatAmount(batchSummary.balanceAfter)} {currency}
                      </p>
                    </div>
                  </div>
                </Card>
              </div>
            </Card>
          )}

          {/* action buttons - only show when file is uploaded */}
          {batchSummary && (
            <div className="flex gap-6 mt-8">
              <Button variant="secondary" onClick={handleCancelBatch}>
                {t("batches.create_batch.actions.cancel")}
              </Button>
              <Button variant="default" onClick={handleConfirmBatch}>
                <Icon symbol="check" weight={200} />
                {t("batches.create_batch.actions.confirm")}
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
              className="bg-[#fdecec] text-[#bf3636] hover:bg-[#fcd9d9]"
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
      <Dialog open={isOtpDialogOpen} onOpenChange={(open) => {
        setIsOtpDialogOpen(open);
        if (!open) {
          isProcessingRef.current = false;
          setOtpCode("");
        }
      }}>
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
              <InputOTPSlot index={0} className="flex-1 h-10" />
              <InputOTPSlot index={1} className="flex-1 h-10" />
              <InputOTPSlot index={2} className="flex-1 h-10" />
              <InputOTPSlot index={3} className="flex-1 h-10" />
              <InputOTPSlot index={4} className="flex-1 h-10" />
              <InputOTPSlot index={5} className="flex-1 h-10" />
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
