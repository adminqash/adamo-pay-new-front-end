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
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, NavLink, Outlet } from "react-router";
import type { JSX } from "react";
import { Logo } from "@/features/common/components/brand/logo";
import { CountryFlag } from "@/features/common/components/flags/country-flag";

export type SidebarMenuItem = {
  id: string
  label: string
  path: string
  icon?: JSX.Element
  menu?: SidebarMenuItem[]
};

export function MainSidebar() {
  const { t } = useTranslation(["sidebar"]);
  const [selectedCountry, setSelectedCountry] = useState("CO");

  const countries: Record<string, string> = {
    AR: "Argentina",
    BR: "Brasil",
    CO: "Colombia",
    MX: "México",
  };

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
                return (
                  <Collapsible key={item.id}>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuItem key={item.id} className="w-[stretch]">
                        {item.icon}
                        {item.label}
                        <Icon symbol="arrow_drop_down" className="ml-auto" />
                      </SidebarMenuItem>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="mt-1 pl-4">
                      <SidebarMenu className="my-0">{item.menu.map((item) => (
                        <SidebarMenuItem key={item.id} asChild>
                          <NavLink
                            to={item.path}
                          >
                            {item.icon}
                            {item.label}
                          </NavLink>
                        </SidebarMenuItem>
                      ))}
                      </SidebarMenu>
                    </CollapsibleContent>
                  </Collapsible>
                );
              }

              return (
                <SidebarMenuItem key={item.id} asChild>
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
                  <CountryFlag countryCode={selectedCountry} />
                  <span className={`
                    hidden text-sm font-semibold text-foreground
                    xl:inline
                  `}
                  >
                    {countries[selectedCountry]}
                  </span>
                  <Icon symbol="arrow_drop_down" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[200px] p-0">
                <DropdownMenuItem
                  onClick={() => {
                    setSelectedCountry("AR");
                    ToastManager.show({
                      message: "País cambiado a Argentina",
                      variant: "success",
                    });
                  }}
                  className={`
                    h-11 cursor-pointer gap-3 px-4 py-0
                    focus:bg-muted focus:outline-none
                    focus-visible:ring-0
                  `}
                >
                  <CountryFlag countryCode="AR" className="size-5" />
                  <span className="flex-1">Argentina</span>
                  {selectedCountry === "AR" && (
                    <Icon symbol="check" className="ml-auto text-pay-500" />
                  )}
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-neutral-100" />
                <DropdownMenuItem
                  onClick={() => {
                    setSelectedCountry("BR");
                    ToastManager.show({
                      message: "País cambiado a Brasil",
                      variant: "success",
                    });
                  }}
                  className={`
                    h-11 cursor-pointer gap-3 px-4 py-0
                    focus:bg-muted focus:outline-none
                    focus-visible:ring-0
                  `}
                >
                  <CountryFlag countryCode="BR" className="size-5" />
                  <span className="flex-1">Brasil</span>
                  {selectedCountry === "BR" && (
                    <Icon symbol="check" className="ml-auto text-pay-500" />
                  )}
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-neutral-100" />
                <DropdownMenuItem
                  onClick={() => {
                    setSelectedCountry("CO");
                    ToastManager.show({
                      message: "País cambiado a Colombia",
                      variant: "success",
                    });
                  }}
                  className={`
                    h-11 cursor-pointer gap-3 px-4 py-0
                    focus:bg-muted focus:outline-none
                    focus-visible:ring-0
                  `}
                >
                  <CountryFlag countryCode="CO" className="size-5" />
                  <span className="flex-1">Colombia</span>
                  {selectedCountry === "CO" && (
                    <Icon symbol="check" className="ml-auto text-pay-500" />
                  )}
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-neutral-100" />
                <DropdownMenuItem
                  onClick={() => {
                    setSelectedCountry("MX");
                    ToastManager.show({
                      message: "País cambiado a México",
                      variant: "success",
                    });
                  }}
                  className={`
                    h-11 cursor-pointer gap-3 px-4 py-0
                    focus:bg-muted focus:outline-none
                    focus-visible:ring-0
                  `}
                >
                  <CountryFlag countryCode="MX" className="size-5" />
                  <span className="flex-1">México</span>
                  {selectedCountry === "MX" && (
                    <Icon symbol="check" className="ml-auto text-pay-500" />
                  )}
                </DropdownMenuItem>
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
