import { Avatar, AvatarFallback, AvatarImage } from "@adamosuiteservices/ui/avatar";
import { Button } from "@adamosuiteservices/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@adamosuiteservices/ui/collapsible";
import { Icon } from "@adamosuiteservices/ui/icon";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarFooter,
  SidebarInset,
  SidebarTopBar,
} from "@adamosuiteservices/ui/sidebar";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";
import { useTranslation } from "react-i18next";
import { Link, NavLink, Outlet } from "react-router";
import type { JSX } from "react";
import { Logo } from "@/features/common/components/brand/logo";
import { TemporalLanguageSelector } from "@/features/common/components/language/temporal-language-selector";

export type SidebarMenuItem = {
  id: string
  label: string
  path: string
  icon?: JSX.Element
  menu?: SidebarMenuItem[]
};

export function MainSidebar() {
  const { t } = useTranslation(["sidebar"]);

  const menu: SidebarMenuItem[] = [
    { id: "home",
      label: t("sidebar:menu.home"),
      icon: <Icon symbol="home" weight={200} />,
      path: "/",
    },
    {
      id: "transactions",
      label: t("sidebar:menu.transactions"),
      icon: <Icon symbol="swap_horiz" weight={200} />,
      path: "/transactions",
    },
    {
      id: "batches",
      label: t("sidebar:menu.batches"),
      icon: <Icon symbol="folder_copy" weight={200} />,
      path: "/batches",
    },
    {
      id: "accounts",
      label: t("sidebar:menu.accounts"),
      icon: <Icon symbol="account_balance_wallet" weight={200} />,
      path: "/accounts",
    },
    {
      id: "beneficiaries",
      label: t("sidebar:menu.beneficiaries"),
      icon: <Icon symbol="account_circle" weight={200} />,
      path: "/beneficiaries",
    },
    {
      id: "metrics",
      label: t("sidebar:menu.metrics"),
      icon: <Icon symbol="query_stats" weight={200} />,
      path: "/metrics",
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
        <SidebarFooter className="gap-4 pt-4">
          <SidebarMenuItem asChild>
            <NavLink to="/profile">
              <Avatar className="size-10 rounded-lg">
                <AvatarImage
                  src=""
                  alt=""
                />
                <AvatarFallback className="rounded-lg text-sm text-foreground">
                  LI
                </AvatarFallback>
              </Avatar>
              {t("footer.profile")}
            </NavLink>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <Icon symbol="logout" />
            {t("footer.logout")}
          </SidebarMenuItem>
        </SidebarFooter>
      </SidebarContent>
      <SidebarInset>
        <SidebarTopBar className={`
          px-4
          md:px-8
          lg:px-14
        `}
        >
          <div data-slot="sidebar-top-bar-portal"></div>
          <TemporalLanguageSelector />
          <Button variant="secondary">
            <Icon symbol="notifications" weight={200} />
          </Button>
        </SidebarTopBar>
        <Outlet />
      </SidebarInset>
    </Sidebar>

  );
}
