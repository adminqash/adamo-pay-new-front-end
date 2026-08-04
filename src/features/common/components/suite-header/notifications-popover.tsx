import { Button } from "@adamosuiteservices/ui/button";
import { Icon } from "@adamosuiteservices/ui/icon";
import { Popover, PopoverContent, PopoverTrigger } from "@adamosuiteservices/ui/popover";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";

const NOTIFICATION_ITEMS = [
  "payment_received",
  "batch_processed",
  "document_approved",
] as const;

export function NotificationsPopover() {
  const { t } = useTranslation(["suite-header"]);

  const [isOpen, setIsOpen] = useState(false);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={t("notifications_label")}
          className={`
            flex h-14 items-center justify-center px-2 text-white/90
            transition-opacity
            hover:text-white
            focus-visible:ring-2 focus-visible:ring-white/40
            focus-visible:outline-none
          `}
        >
          <Icon symbol="notifications" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[400px] p-0">
        <div className="max-h-[400px] overflow-x-hidden overflow-y-auto">
          {NOTIFICATION_ITEMS.map((item, index) => (
            <div key={item}>
              <div className="flex flex-col items-start gap-1 px-4 py-3">
                <p className={`
                  w-full text-sm font-semibold break-words text-neutrals-700
                `}
                >
                  {t(`notifications.items.${item}.title`)}
                </p>
                <p className="w-full text-sm break-words text-neutrals-400">
                  {t(`notifications.items.${item}.description`)}
                </p>
                <p className="w-full text-xs text-neutrals-400">
                  {t(`notifications.items.${item}.time`)}
                </p>
              </div>
              {index < NOTIFICATION_ITEMS.length - 1 && (
                <div className="h-px bg-neutrals-100" />
              )}
            </div>
          ))}
        </div>
        <div className="border-t border-neutrals-100 p-3">
          <Button
            asChild
            variant="link"
            size="sm"
            className="h-auto p-0 text-pay-500"
          >
            <Link to="/notifications" onClick={() => setIsOpen(false)}>
              {t("notifications.view_all")}
            </Link>
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
