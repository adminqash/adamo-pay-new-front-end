import { Badge } from "@adamosuiteservices/ui/badge";
import { Icon } from "@adamosuiteservices/ui/icon";
import { Button } from "@adamosuiteservices/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@adamosuiteservices/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@adamosuiteservices/ui/dialog";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@adamosuiteservices/ui/input-otp";
import { ToastManager } from "@adamosuiteservices/ui/toaster";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { RechargeBalanceDialog } from "./recharge-balance-dialog";
import { FreezeCardDialog } from "./freeze-card-dialog";
import { UnfreezeCardDialog } from "./unfreeze-card-dialog";
import { ReportReplacementDialog } from "./report-replacement-dialog";
import { PermissionGate } from "@/features/auth/application/components/permission-gate";
import { PERMISSIONS } from "@/features/auth/domain/permissions";

export interface CreditCardData {
  id: string;
  name: string;
  type: "physical" | "virtual";
  balance: number;
  currency: string;
  cardNumber: string;
  status: "active" | "blocked" | "reported" | "expired" | "frozen";
  gradient: string;
}

interface CompactCreditCardProps {
  card: CreditCardData;
  onUpdateCardStatus?: (cardId: string, newStatus: CreditCardData["status"]) => void;
}

/**
 * compact credit card header component
 * 
 * condensed version of credit card for page headers
 */
export function CompactCreditCard({ card, onUpdateCardStatus }: CompactCreditCardProps) {
  const { t } = useTranslation("beneficiaries");
  const [showCardNumber, setShowCardNumber] = useState(false);
  const [rechargeDialogOpen, setRechargeDialogOpen] = useState(false);
  const [freezeDialogOpen, setFreezeDialogOpen] = useState(false);
  const [unfreezeDialogOpen, setUnfreezeDialogOpen] = useState(false);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [otpDialogOpen, setOtpDialogOpen] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [otpAction, setOtpAction] = useState<"freeze" | "unfreeze" | "report" | null>(null);

  /**
   * handle freeze card confirmation - opens OTP dialog
   */
  const handleFreezeConfirm = () => {
    setOtpAction("freeze");
    setOtpDialogOpen(true);
  };

  /**
   * handle unfreeze card confirmation - opens OTP dialog
   */
  const handleUnfreezeConfirm = () => {
    setOtpAction("unfreeze");
    setOtpDialogOpen(true);
  };

  /**
   * handle report card confirmation - opens OTP dialog
   */
  const handleReportConfirm = () => {
    setOtpAction("report");
    setOtpDialogOpen(true);
  };

  /**
   * handle OTP confirmation
   */
  const handleOtpConfirm = () => {
    if (otpAction === "freeze") {
      // Update card status to frozen
      if (onUpdateCardStatus) {
        onUpdateCardStatus(card.id, "frozen");
      }
      // Show success toast
      ToastManager.show({
        message: t("beneficiaries.detail.messages.card_frozen"),
        variant: "success",
      });
    } else if (otpAction === "unfreeze") {
      // Update card status to active
      if (onUpdateCardStatus) {
        onUpdateCardStatus(card.id, "active");
      }
      // Show success toast
      ToastManager.show({
        message: t("beneficiaries.detail.messages.card_unfrozen"),
        variant: "success",
      });
    } else if (otpAction === "report") {
      // Update card status to reported
      if (onUpdateCardStatus) {
        onUpdateCardStatus(card.id, "reported");
      }
      // Show success toast
      ToastManager.show({
        message: t("beneficiaries.detail.messages.card_reported"),
        variant: "success",
      });
    }
    
    setOtpDialogOpen(false);
    setOtpCode("");
    setOtpAction(null);
  };

  const formatCardNumber = (number: string, show: boolean) => {
    if (show) {
      return number.replace(/(.{4})/g, "$1 ").trim();
    }
    const lastFour = number.slice(-4);
    return `•••• •••• •••• ${lastFour}`;
  };

  const formatBalance = (amount: number) => {
    return `$${amount.toLocaleString("es-CO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const getStatusBadgeVariant = (status: CreditCardData["status"]) => {
    switch (status) {
      case "reported":
        return "destructive";
      case "blocked":
        return "warning";
      default:
        return "default";
    }
  };

  const getStatusLabel = (status: CreditCardData["status"]) => {
    switch (status) {
      case "reported":
        return t("beneficiaries.detail.card_status_reported");
      case "frozen":
        return t("beneficiaries.detail.card_status_frozen");
      case "expired":
        return t("beneficiaries.detail.card_status_expired");
      default:
        return "";
    }
  };

  // Card background based on status
  const getCardBackground = () => {
    if (card.status === "expired") {
      return "#9da4ae";
    }
    if (card.status === "frozen") {
      // Frozen cards have special blue gradient
      return "linear-gradient(147.63deg, rgb(0, 134, 201) 0%, rgb(159, 212, 206) 100%)";
    }
    // Physical cards use green gradient
    if (card.type === "physical") {
      return "linear-gradient(147.63deg, rgb(14, 147, 132) 0%, rgb(159, 212, 206) 100%)";
    }
    // Virtual cards use dark teal gradient from Figma
    return "linear-gradient(147.63deg, rgb(6, 59, 53) 0%, rgb(62, 169, 157) 100%)";
  };

  // Show recharge button only for active, blocked, and frozen cards
  const showRechargeButton = card.status !== "reported" && card.status !== "expired";

  return (
    <div
      className="flex h-[72px] w-full items-center justify-center overflow-clip rounded-2xl px-6 shadow-[0px_2px_6px_0px_rgba(0,0,0,0.08)]"
      style={{ background: getCardBackground() }}
    >
      <div className="flex h-10 w-full items-center justify-between">
        {/* Left content */}
        <div className="flex items-center gap-6">
          {/* Card name */}
          <p className="text-sm text-white">{card.name}</p>

          {/* Card number + toggle */}
          <div className="flex items-center gap-3">
            {/* Mobile: only last 4 digits */}
            <p className="text-base text-white md:hidden">
              •••• {card.cardNumber.slice(-4)}
            </p>
            {/* Desktop: full number with toggle */}
            <p className="hidden text-base text-white md:block">{formatCardNumber(card.cardNumber, showCardNumber)}</p>
            <button
              onClick={() => setShowCardNumber(!showCardNumber)}
              className="hidden items-center text-white md:flex"
            >
              <Icon
                symbol={showCardNumber ? "visibility" : "visibility_off"}
                weight={200}
                className="text-2xl"
              />
            </button>
          </div>

          {/* Balance */}
          <p className="text-sm text-white">
            {t("beneficiaries.credit_card_movements.balance_label")}: {formatBalance(card.balance)}
          </p>

          {/* Recharge button - only show for active, blocked, and frozen - hidden on mobile */}
          {showRechargeButton && (
            <PermissionGate permission={PERMISSIONS.BENEFICIARIES_CREATE}>
            <Button 
              variant="secondary" 
              size="default" 
              className="hidden md:flex"
              onClick={() => setRechargeDialogOpen(true)}
            >
              {t("beneficiaries.credit_card_movements.recharge_button")}
            </Button>
            </PermissionGate>
          )}
        </div>

        {/* Right content: Status Badge + Type Badge + Menu */}
        <div className="flex items-center gap-6">
          {/* Status badge - only show for non-active cards */}
          {card.status !== "active" && (
            <Badge 
              variant={getStatusBadgeVariant(card.status)}
              className={
                card.status === "frozen"
                  ? "h-7 rounded-full bg-[#0086C9] text-white"
                  : card.status === "expired"
                    ? "h-7 rounded-full bg-[#6c737f] text-white"
                    : "h-7 rounded-full"
              }
            >
              {getStatusLabel(card.status)}
            </Badge>
          )}

          {/* Type badge - hidden on mobile */}
          <Badge variant="default" className="hidden h-7 rounded-full bg-white/10 text-white md:flex">
            {card.type === "physical"
              ? t("beneficiaries.detail.card_type_physical")
              : t("beneficiaries.detail.card_type_virtual")}
          </Badge>

          {/* Menu */}
          <PermissionGate permission={PERMISSIONS.BENEFICIARIES_CREATE}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button 
                className="border-none bg-transparent p-0 text-white hover:bg-transparent focus:outline-none focus-visible:outline-none active:bg-transparent"
                style={{ WebkitTapHighlightColor: 'transparent' }}
              >
                <Icon symbol="more_vert" weight={200} className="text-2xl" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {/* Hide recharge option for reported and expired cards */}
              {card.status !== "reported" && card.status !== "expired" && (
                <DropdownMenuItem onClick={() => setRechargeDialogOpen(true)}>
                  {t("beneficiaries.detail.card_menu_recharge_balance")}
                </DropdownMenuItem>
              )}
              {/* Hide freeze option for reported, frozen, and expired cards */}
              {card.status !== "reported" && card.status !== "frozen" && card.status !== "expired" && (
                <DropdownMenuItem onClick={() => setFreezeDialogOpen(true)}>
                  {t("beneficiaries.detail.card_menu_freeze_card")}
                </DropdownMenuItem>
              )}
              {/* Show unfreeze option only for frozen cards */}
              {card.status === "frozen" && (
                <DropdownMenuItem onClick={() => setUnfreezeDialogOpen(true)}>
                  {t("beneficiaries.detail.card_menu_unfreeze_card")}
                </DropdownMenuItem>
              )}
              {/* Hide report option for reported and expired cards */}
              {card.status !== "reported" && card.status !== "expired" && (
                <DropdownMenuItem onClick={() => setReportDialogOpen(true)}>
                  {t("beneficiaries.detail.card_menu_report_replacement")}
                </DropdownMenuItem>
              )}
              <DropdownMenuItem variant="destructive">
                {t("beneficiaries.detail.card_menu_delete_card")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          </PermissionGate>
        </div>
      </div>

      {/* Recharge Balance Dialog */}
      <RechargeBalanceDialog
        open={rechargeDialogOpen}
        onOpenChange={setRechargeDialogOpen}
        cardNumber={card.cardNumber}
      />

      {/* Freeze Card Dialog */}
      <FreezeCardDialog
        open={freezeDialogOpen}
        onOpenChange={setFreezeDialogOpen}
        cardNumber={card.cardNumber}
        onConfirm={handleFreezeConfirm}
      />

      {/* Unfreeze Card Dialog */}
      <UnfreezeCardDialog
        open={unfreezeDialogOpen}
        onOpenChange={setUnfreezeDialogOpen}
        cardNumber={card.cardNumber}
        onConfirm={handleUnfreezeConfirm}
      />

      {/* Report and Replacement Dialog */}
      <ReportReplacementDialog
        open={reportDialogOpen}
        onOpenChange={setReportDialogOpen}
        cardNumber={card.cardNumber}
        onConfirm={handleReportConfirm}
      />

      {/* OTP confirmation dialog */}
      <Dialog open={otpDialogOpen} onOpenChange={setOtpDialogOpen}>
        <DialogContent className="max-w-[610px] gap-12">
          <DialogHeader className="gap-2">
            <DialogTitle>{t("beneficiaries.detail.otp_dialog.title")}</DialogTitle>
            <DialogDescription>
              {t("beneficiaries.detail.otp_dialog.description")}
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
                setOtpDialogOpen(false);
                setOtpCode("");
                setOtpAction(null);
              }}
            >
              {t("beneficiaries.detail.otp_dialog.cancel")}
            </Button>
            <Button 
              variant="default" 
              onClick={handleOtpConfirm}
              disabled={otpCode.length !== 6}
            >
              {t("beneficiaries.detail.otp_dialog.confirm")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
