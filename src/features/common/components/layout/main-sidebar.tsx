import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@adamosuiteservices/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@adamosuiteservices/ui/dropdown-menu";
import { Icon } from "@adamosuiteservices/ui/icon";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarInset,
  SidebarTopBar,
  SidebarTrigger,
} from "@adamosuiteservices/ui/sidebar";
import { ToastManager } from "@adamosuiteservices/ui/toaster";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";
import { Fragment, type JSX } from "react";
import { useTranslation } from "react-i18next";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router";
import { Logo } from "@/features/common/components/brand/logo";
import { CountryFlag } from "@/features/common/components/flags/country-flag";
import { useCountry } from "@/features/common/contexts/use-country";
import {
  getCountrySwitchRedirect,
  SELECTABLE_COUNTRIES,
} from "@/lib/country/country-code";

export type SidebarMenuItem = {
  id: string
  label: string
  path: string
  icon?: JSX.Element
  menu?: SidebarMenuItem[]
};

function isPathActive(pathname: string, path: string) {
  if (path === "/") {
    return pathname === "/";
  }
  return pathname === path || pathname.startsWith(`${path}/`);
}

export function MainSidebar() {
  const { t } = useTranslation(["sidebar"]);
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { countryCodeAlpha2, setCountry } = useCountry();

  function selectCountry(alpha2: string, countryName: string) {
    const changed = setCountry(alpha2);
    if (!changed) {
      return;
    }

    const redirectTo = getCountrySwitchRedirect(pathname);
    if (redirectTo) {
      void navigate(redirectTo, { replace: true });
    }

    ToastManager.show({
      message: `País cambiado a ${countryName}`,
      variant: "success",
    });
  }

  const menu: SidebarMenuItem[] = [
    { id: "home",
      label: t("sidebar:menu.home"),
      icon: <Icon symbol="home" />,
      path: "/",
    },
    {
      id: "transactions",
      label: t("sidebar:menu.transactions"),
      icon: <Icon symbol="swap_horiz" />,
      path: "/transactions",
    },
    {
      id: "batches",
      label: t("sidebar:menu.batches"),
      icon: <Icon symbol="folder_copy" />,
      path: "/batches",
    },
    {
      id: "accounts",
      label: t("sidebar:menu.accounts"),
      icon: <Icon symbol="account_balance_wallet" />,
      path: "/accounts",
    },
    {
      id: "beneficiaries",
      label: t("sidebar:menu.beneficiaries"),
      icon: <Icon symbol="account_circle" />,
      path: "/beneficiaries",
    },
    {
      id: "metrics",
      label: t("sidebar:menu.metrics"),
      icon: <Icon symbol="query_stats" />,
      path: "/metrics",
    },
    {
      id: "reports",
      label: t("sidebar:menu.reports"),
      icon: <Icon symbol="table_chart_view" />,
      path: "/reports",
    },
  ];

  const selectedCountryName = SELECTABLE_COUNTRIES.find(
    (country) => country.alpha2 === countryCodeAlpha2,
  )?.name ?? countryCodeAlpha2;

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarHeader className="pb-4">
          <Link to="/" className="mx-auto">
            <Logo />
          </Link>
        </SidebarHeader>
        <OverlayScrollbarsComponent>
          <SidebarMenu>
            {menu.map((item) => {
              if (item.menu && item.menu.length > 0) {
                const isParentActive = item.menu.some((subItem) => isPathActive(pathname, subItem.path));

                return (
                  <Collapsible key={item.id}>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuItem key={item.id} className="w-[stretch]" isActive={isParentActive}>
                        {item.icon}
                        {item.label}
                        <Icon symbol="arrow_drop_down" className="ml-auto" />
                      </SidebarMenuItem>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="mt-1 pl-4">
                      <SidebarMenu className="my-0">{item.menu.map((subItem) => (
                        <SidebarMenuItem key={subItem.id} asChild isActive={isPathActive(pathname, subItem.path)}>
                          <NavLink
                            to={subItem.path}
                          >
                            {subItem.icon}
                            {subItem.label}
                          </NavLink>
                        </SidebarMenuItem>
                      ))}
                    </SidebarMenu>
                    </CollapsibleContent>
                  </Collapsible>
                );
              }

              return (
                <SidebarMenuItem key={item.id} asChild isActive={isPathActive(pathname, item.path)}>
                  <NavLink
                    to={item.path}
                  >
                    {item.icon}
                    {item.label}
                  </NavLink>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </OverlayScrollbarsComponent>
      </SidebarContent>
      <SidebarInset>
        <SidebarTopBar className={`
          h-14 px-4
          md:px-8
          lg:px-14
        `}
        >
          <div
            data-slot="sidebar-top-bar-portal"
            className="min-w-0 flex-1 overflow-hidden"
          >
          </div>
          {/* Right - Country Selector */}
          <div className="flex items-center gap-6">
            {/* Country selector - DropdownMenu matching Figma */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className={`
                    flex h-10 items-center gap-2 rounded-[32px] border-0
                    bg-transparent
                    focus:outline-none
                    focus-visible:ring-0 focus-visible:ring-offset-0
                    focus-visible:outline-none
                    active:outline-none
                  `}
                >
                  <CountryFlag countryCode={countryCodeAlpha2} />
                  <span className={`
                    hidden text-sm font-semibold text-foreground
                    xl:inline
                  `}
                  >
                    {selectedCountryName}
                  </span>
                  <Icon symbol="arrow_drop_down" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[200px] p-0">
                {SELECTABLE_COUNTRIES.map((country, index) => (
                  <Fragment key={country.alpha2}>
                    {index > 0 && <DropdownMenuSeparator className="bg-neutral-100" />}
                    <DropdownMenuItem
                      onClick={() => {
                        selectCountry(country.alpha2, country.name);
                      }}
                      className={`
                        h-11 cursor-pointer gap-3 px-4 py-0
                        focus:bg-muted focus:outline-none
                        focus-visible:ring-0
                      `}
                    >
                      <CountryFlag countryCode={country.alpha2} className="size-5" />
                      <span className="flex-1">{country.name}</span>
                      {countryCodeAlpha2 === country.alpha2 && (
                        <Icon symbol="check" className="ml-auto text-pay-500" />
                      )}
                    </DropdownMenuItem>
                  </Fragment>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            {/* Hamburger menu button - mobile/tablet only */}
            <SidebarTrigger className={`
              inline-flex h-10 w-12 items-center justify-center rounded-xl
              bg-primary text-primary-foreground
              hover:bg-primary/90
              xl:hidden
              [&_span]:text-2xl
            `}
            />
          </div>
        </SidebarTopBar>
        <Outlet />
      </SidebarInset>
    </Sidebar>
  );
}
