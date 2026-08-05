import { Icon } from "@adamosuiteservices/ui/icon";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import { useRealtimeToastNotifications } from "@/features/common/hooks/use-realtime-toast-notifications";

const STATUS_ICON: Record<string, string> = {
  paid: "check_circle",
  completed: "check_circle",
  rejected: "cancel",
  returned: "undo",
};

/**
 * Small, non-intrusive stack of live-event popups shown regardless of which
 * page the user is on (mounted once in MainLayout). Each card auto-dismisses
 * on its own; "Ver más" deep-links into the relevant payment/batch detail.
 */
export function RealtimeToastStack() {
  const { t } = useTranslation("common");
  const { notifications, dismiss } = useRealtimeToastNotifications();

  if (notifications.length === 0) {
    return null;
  }

  return (
    <div
      className={`
        fixed bottom-4 right-4 z-50 flex w-[320px] flex-col gap-2
      `}
    >
      {notifications.map((notification) => (
        <div
          key={notification.id}
          role="status"
          className={`
            flex items-start gap-3 rounded-lg border border-neutrals-100
            bg-background p-3 shadow-lg
          `}
        >
          <Icon
            symbol={STATUS_ICON[notification.status] ?? "notifications"}
            className="mt-0.5 shrink-0 text-pay-500"
          />
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <p className="text-sm font-semibold text-neutrals-700">
              {t(`realtime.toast.${notification.kind}.title`)}
            </p>
            <p className="text-xs text-neutrals-400">
              {t(`realtime.toast.status.${notification.status}`, {
                defaultValue: notification.status,
              })}
            </p>
            <Link
              to={notification.href}
              onClick={() => dismiss(notification.id)}
              className="text-xs font-semibold text-pay-500 hover:underline"
            >
              {t("realtime.toast.view_more")}
            </Link>
          </div>
          <button
            type="button"
            aria-label={t("realtime.toast.dismiss")}
            onClick={() => dismiss(notification.id)}
            className="shrink-0 text-neutrals-400 hover:text-neutrals-700"
          >
            <Icon symbol="close" />
          </button>
        </div>
      ))}
    </div>
  );
}
