import { Icon } from "@adamosuiteservices/ui/icon";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import adamoServicesMarkUrl from "@/assets/adamo-services-mark.svg";
import { NotificationsPopover } from "@/features/common/components/suite-header/notifications-popover";
import { ProductSwitcher } from "@/features/common/components/suite-header/product-switcher";
import { ProfileMenu } from "@/features/common/components/suite-header/profile-menu";
import { env } from "@/lib/env";

const SUPPORT_WHATSAPP_URL = "https://wa.me/+573216265361";

const iconButtonClass = `
  flex h-14 items-center justify-center px-2 text-white/90
  transition-opacity
  hover:text-white
  focus-visible:ring-2 focus-visible:ring-white/40
  focus-visible:outline-none
`;

export function SuiteHeader() {
  const { t } = useTranslation("suite-header");

  const brand = (
    <>
      <img
        src={adamoServicesMarkUrl}
        alt=""
        width={36}
        height={32}
        className="block h-8 w-auto shrink-0"
      />
      <span className={`
        hidden text-sm leading-5 font-bold whitespace-nowrap
        sm:inline
      `}
      >
        {t("brand")}
      </span>
    </>
  );

  return (
    <header
      className={`
        fixed top-0 right-0 left-0 z-50 flex h-14 items-center justify-between
        gap-4 bg-[#1f2a37] px-6 text-white
      `}
    >
      {env.VITE_ADAMO_LANDING_BASE_URL
        ? (
            <a
              href={`${env.VITE_ADAMO_LANDING_BASE_URL}/my-services`}
              className="flex items-center gap-4"
            >
              {brand}
            </a>
          )
        : (
            <Link to="/" className="flex items-center gap-4">
              {brand}
            </Link>
          )}
      <div className="flex items-center gap-2">
        <ProductSwitcher />
        <a
          href={SUPPORT_WHATSAPP_URL}
          target="_blank"
          rel="noreferrer"
          aria-label={t("help_label")}
          className={iconButtonClass}
        >
          <Icon symbol="help" />
        </a>
        <NotificationsPopover />
        <ProfileMenu />
      </div>
    </header>
  );
}
