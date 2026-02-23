import { Badge } from "@adamosuiteservices/ui/badge";
import { Icon } from "@adamosuiteservices/ui/icon";
import { useState } from "react";
import { useTranslation } from "react-i18next";

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
}

export function CreditCard({ card }: CreditCardProps) {
  const { t } = useTranslation("beneficiaries");
  const [showCardNumber, setShowCardNumber] = useState(false);

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
      // Frozen cards have blue-to-green gradient
      return "linear-gradient(147.63deg, rgb(0, 134, 201) 0%, rgb(159, 212, 206) 100%)";
    }
    // Physical cards (active, reported, blocked) use green gradient
    if (card.type === "physical") {
      return "linear-gradient(147.63deg, rgb(14, 147, 132) 0%, rgb(159, 212, 206) 100%)";
    }
    // Virtual cards use custom gradient
    return card.gradient;
  };

  return (
    <div
      className="flex shrink-0 cursor-pointer flex-col items-start overflow-clip rounded-3xl p-6 shadow-[0px_2px_6px_0px_rgba(0,0,0,0.08)] transition-all duration-300 hover:shadow-[0px_8px_16px_0px_rgba(0,0,0,0.16)]"
      style={{ background: getCardBackground() }}
    >
      <div className="flex h-[184px] w-[318px] shrink-0 flex-col items-start justify-between">
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
                <button className="text-white">
                  <Icon symbol="more_vert" weight={200} className="text-2xl" />
                </button>
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
            <div className="absolute left-0 h-[43px] w-[43px] rounded-full bg-[#EB001B]" />
            <div className="absolute left-[23px] h-[43px] w-[43px] rounded-full bg-[#FF5F00]" />
          </div>
        </div>
      </div>
    </div>
  );
}
