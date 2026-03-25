import { Badge } from "@adamosuiteservices/ui/badge";
import { Icon } from "@adamosuiteservices/ui/icon";
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
import { Button } from "@adamosuiteservices/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@adamosuiteservices/ui/input-otp";
import { ToastManager } from "@adamosuiteservices/ui/toaster";
import { useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import { RechargeBalanceDialog } from "./recharge-balance-dialog";
import { FreezeCardDialog } from "./freeze-card-dialog";
import { UnfreezeCardDialog } from "./unfreeze-card-dialog";
import { ReportReplacementDialog } from "./report-replacement-dialog";

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

interface CreditCardProps {
  card: CreditCardData;
  beneficiaryId: string;
  onUpdateCardStatus?: (cardId: string, newStatus: CreditCardData["status"]) => void;
}

export function CreditCard({ card, beneficiaryId, onUpdateCardStatus }: CreditCardProps) {
  const { t } = useTranslation("beneficiaries");
  const navigate = useNavigate();
  const [showCardNumber, setShowCardNumber] = useState(false);
  const [rechargeDialogOpen, setRechargeDialogOpen] = useState(false);
  const [freezeDialogOpen, setFreezeDialogOpen] = useState(false);
  const [unfreezeDialogOpen, setUnfreezeDialogOpen] = useState(false);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [otpDialogOpen, setOtpDialogOpen] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [otpAction, setOtpAction] = useState<"freeze" | "unfreeze" | "report" | null>(null);
  const dialogJustClosedRef = useRef(false);

  const handleDialogOpenChange = (open: boolean, dialogType: 'recharge' | 'freeze' | 'unfreeze' | 'report') => {
    if (dialogType === 'recharge') {
      setRechargeDialogOpen(open);
    } else if (dialogType === 'freeze') {
      setFreezeDialogOpen(open);
    } else if (dialogType === 'unfreeze') {
      setUnfreezeDialogOpen(open);
    } else if (dialogType === 'report') {
      setReportDialogOpen(open);
    }
    // If closing, mark as just closed and clear after a short delay
    if (!open) {
      dialogJustClosedRef.current = true;
      setTimeout(() => {
        dialogJustClosedRef.current = false;
      }, 300);
    }
  };

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

  const getStatusVariant = (status: CreditCardData["status"]) => {
    switch (status) {
      case "reported":
        return "destructive";
      case "blocked":
        return "warning";
      case "active":
        return "success";
      default:
        return "default";
    }
  };

  const getStatusLabel = (status: CreditCardData["status"]) => {
    switch (status) {
      case "reported":
        return t("beneficiaries.detail.card_status_reported");
      case "blocked":
        return t("beneficiaries.detail.card_status_blocked");
      case "active":
        return t("beneficiaries.detail.card_status_active");
      case "expired":
        return t("beneficiaries.detail.card_status_expired");
      case "frozen":
        return t("beneficiaries.detail.card_status_frozen");
      default:
        return "";
    }
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

  // Card background based on status and type (following Figma design)
  const getCardBackground = () => {
    if (card.status === "expired") {
      // Expired cards have solid gray background
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

  return (
    <div
      className="group/card relative flex shrink-0 cursor-pointer flex-col items-start overflow-clip rounded-3xl p-6 shadow-[0px_2px_6px_0px_rgba(0,0,0,0.08)] transition-all duration-300"
      style={{ background: getCardBackground() }}
      onClick={() => {
        if (!rechargeDialogOpen && !dialogJustClosedRef.current) {
          navigate(`/beneficiaries/${beneficiaryId}/cards/${card.id}/movements`, { state: { card } });
        }
      }}
    >
      {/* Hover overlay */}
      <div className="pointer-events-none absolute inset-0 bg-white opacity-0 transition-opacity duration-300 group-hover/card:opacity-10" />
      
      <div className="relative flex h-[184px] w-[318px] shrink-0 flex-col items-start justify-between">
        {/* Header */}
        <div className="w-full">
          <div className="flex w-full flex-col gap-6">
            {/* Name + Type Badge + Menu */}
            <div className="flex w-full items-center justify-between">
              <p className="text-sm text-white">{card.name}</p>
              <div className="flex items-center gap-3">
                <Badge variant="default" className="h-7 rounded-full bg-white/10 text-white">
                  {card.type === "physical"
                    ? t("beneficiaries.detail.card_type_physical")
                    : t("beneficiaries.detail.card_type_virtual")}
                </Badge>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button 
                      className="border-none bg-transparent p-0 text-white hover:bg-transparent focus:outline-none focus-visible:outline-none active:bg-transparent"
                      style={{ WebkitTapHighlightColor: 'transparent' }}
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                    >
                      <Icon symbol="more_vert" weight={200} className="text-2xl" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/beneficiaries/${beneficiaryId}/cards/${card.id}/movements`, { state: { card } });
                      }}
                    >
                      {t("beneficiaries.detail.card_menu_view_movements")}
                    </DropdownMenuItem>
                    {/* Hide recharge option for reported and expired cards */}
                    {card.status !== "reported" && card.status !== "expired" && (
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          setRechargeDialogOpen(true);
                        }}
                      >
                        {t("beneficiaries.detail.card_menu_recharge_balance")}
                      </DropdownMenuItem>
                    )}
                    {/* Hide freeze option for reported, frozen, and expired cards */}
                    {card.status !== "reported" && card.status !== "frozen" && card.status !== "expired" && (
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          setFreezeDialogOpen(true);
                        }}
                      >
                        {t("beneficiaries.detail.card_menu_freeze_card")}
                      </DropdownMenuItem>
                    )}
                    {/* Show unfreeze option only for frozen cards */}
                    {card.status === "frozen" && (
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          setUnfreezeDialogOpen(true);
                        }}
                      >
                        {t("beneficiaries.detail.card_menu_unfreeze_card")}
                      </DropdownMenuItem>
                    )}
                    {/* Hide report option for reported and expired cards */}
                    {card.status !== "reported" && card.status !== "expired" && (
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          setReportDialogOpen(true);
                        }}
                      >
                        {t("beneficiaries.detail.card_menu_report_replacement")}
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem
                      variant="destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        // TODO: Implement delete card
                      }}
                    >
                      {t("beneficiaries.detail.card_menu_delete_card")}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Balance + Status Badge */}
            <div className="flex w-full items-center justify-between">
              <p className="text-xl font-bold leading-8 text-white">
                {formatBalance(card.balance)}
              </p>
              {card.status !== "active" && (
                <Badge 
                  variant={card.status === "expired" || card.status === "frozen" ? "default" : getStatusVariant(card.status)} 
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
            </div>
          </div>
        </div>

        {/* Footer: Card Number + Logo */}
        <div className="flex h-[52px] w-full items-center justify-between">
          <div className="flex h-[52px] flex-col gap-2">
            <p className="text-sm text-white">
              {t("beneficiaries.detail.card_number_label")}
            </p>
            <div className="flex items-center gap-3">
              <p className="text-base text-white">
                {formatCardNumber(card.cardNumber, showCardNumber)}
              </p>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowCardNumber(!showCardNumber);
                }}
                className="flex items-center text-white"
              >
                <Icon
                  symbol={showCardNumber ? "visibility" : "visibility_off"}
                  weight={200}
                  className="text-2xl"
                />
              </button>
            </div>
          </div>

          {/* Mastercard Logo */}
          <div className="relative flex h-[43px] w-[66px] items-center justify-center">
            <svg width="66" height="43" viewBox="0 0 66 43" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <clipPath id="intersectionClip">
                  <circle cx="21.5" cy="21.5" r="21.5" />
                </clipPath>
              </defs>
              {/* Left circle (red) */}
              <circle cx="21.5" cy="21.5" r="21.5" fill="#D40101" />
              {/* Right circle (orange) */}
              <circle cx="44.5" cy="21.5" r="21.5" fill="#FE9701" />
              {/* Intersection (orange-red) - right circle clipped by left circle */}
              <circle cx="44.5" cy="21.5" r="21.5" fill="#FE3C00" clipPath="url(#intersectionClip)" />
            </svg>
          </div>
        </div>
      </div>

      {/* Recharge Balance Dialog */}
      <RechargeBalanceDialog
        open={rechargeDialogOpen}
        onOpenChange={(open) => handleDialogOpenChange(open, 'recharge')}
        cardNumber={card.cardNumber}
      />

      {/* Freeze Card Dialog */}
      <FreezeCardDialog
        open={freezeDialogOpen}
        onOpenChange={(open) => handleDialogOpenChange(open, 'freeze')}
        cardNumber={card.cardNumber}
        onConfirm={handleFreezeConfirm}
      />

      {/* Unfreeze Card Dialog */}
      <UnfreezeCardDialog
        open={unfreezeDialogOpen}
        onOpenChange={(open) => handleDialogOpenChange(open, 'unfreeze')}
        cardNumber={card.cardNumber}
        onConfirm={handleUnfreezeConfirm}
      />

      {/* Report and Replacement Dialog */}
      <ReportReplacementDialog
        open={reportDialogOpen}
        onOpenChange={(open) => handleDialogOpenChange(open, 'report')}
        cardNumber={card.cardNumber}
        onConfirm={handleReportConfirm}
      />

      {/* OTP confirmation dialog */}
      <Dialog open={otpDialogOpen} onOpenChange={setOtpDialogOpen}>
        <DialogContent 
          className="max-w-[610px] gap-12"
          onClick={(e) => e.stopPropagation()}
        >
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
