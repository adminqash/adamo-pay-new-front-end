import { Avatar, AvatarFallback, AvatarImage } from "@adamosuiteservices/ui/avatar";
import { Button } from "@adamosuiteservices/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@adamosuiteservices/ui/collapsible";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@adamosuiteservices/ui/dialog";
import { Icon } from "@adamosuiteservices/ui/icon";
import { Input } from "@adamosuiteservices/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@adamosuiteservices/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@adamosuiteservices/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarFooter,
  SidebarInset,
  SidebarTopBar,
  SidebarTrigger,
} from "@adamosuiteservices/ui/sidebar";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";
import { useTranslation } from "react-i18next";
import { Link, NavLink, Outlet } from "react-router";
import { useState } from "react";
import type { JSX } from "react";
import { Logo } from "@/features/common/components/brand/logo";
import { CountryFlag } from "@/features/common/components/flags/country-flag";
import { useAvatar } from "@/features/common/contexts/avatar-context";
import { ToastManager } from "@adamosuiteservices/ui/toaster";

export type SidebarMenuItem = {
  id: string
  label: string
  path: string
  icon?: JSX.Element
  menu?: SidebarMenuItem[]
};

export function MainSidebar() {
  const { t } = useTranslation(["sidebar"]);
  const { avatarUrl, userInitials } = useAvatar();
  const [selectedCountry, setSelectedCountry] = useState("CO");
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
  const [reportTopic, setReportTopic] = useState("");
  const [reportMessage, setReportMessage] = useState("");
  const [isNotificationsDropdownOpen, setIsNotificationsDropdownOpen] = useState(false);
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);

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
        <SidebarFooter className="gap-4 pt-4">
          <SidebarMenuItem asChild>
            <NavLink to="/profile">
              <Avatar className="size-10 rounded-lg">
                <AvatarImage
                  src={avatarUrl}
                  alt=""
                />
                <AvatarFallback className="rounded-lg text-sm text-primary bg-primary-100">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
              {t("footer.profile")}
            </NavLink>
          </SidebarMenuItem>
          <SidebarMenuItem onClick={() => setIsLogoutDialogOpen(true)}>
            <Icon symbol="logout" />
            {t("footer.logout")}
          </SidebarMenuItem>
        </SidebarFooter>
      </SidebarContent>
      <SidebarInset>
        <SidebarTopBar className="h-14 px-4 md:px-8 lg:px-14">
          <div data-slot="sidebar-top-bar-portal" className="flex-1 min-w-0 overflow-hidden"></div>

          {/* Right - Country Selector + Help + Notifications */}
          <div className="flex items-center gap-6">
            {/* Country selector - DropdownMenu matching Figma */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="flex h-10 items-center gap-2 rounded-[32px] bg-transparent border-0 focus:outline-none focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 active:outline-none"
                >
                  <CountryFlag countryCode={selectedCountry} />
                  <span className="text-sm font-semibold text-foreground hidden xl:inline">
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
                      message: `País cambiado a Argentina`,
                      variant: "success",
                    });
                  }}
                  className="h-11 cursor-pointer gap-3 px-4 py-0 focus:bg-muted focus:outline-none focus-visible:ring-0"
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
                      message: `País cambiado a Brasil`,
                      variant: "success",
                    });
                  }}
                  className="h-11 cursor-pointer gap-3 px-4 py-0 focus:bg-muted focus:outline-none focus-visible:ring-0"
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
                      message: `País cambiado a Colombia`,
                      variant: "success",
                    });
                  }}
                  className="h-11 cursor-pointer gap-3 px-4 py-0 focus:bg-muted focus:outline-none focus-visible:ring-0"
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
                      message: `País cambiado a México`,
                      variant: "success",
                    });
                  }}
                  className="h-11 cursor-pointer gap-3 px-4 py-0 focus:bg-muted focus:outline-none focus-visible:ring-0"
                >
                  <CountryFlag countryCode="MX" className="size-5" />
                  <span className="flex-1">México</span>
                  {selectedCountry === "MX" && (
                    <Icon symbol="check" className="ml-auto text-pay-500" />
                  )}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Help dropdown - WhatsApp and report */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="flex size-6 items-center justify-center text-pay-500 hover:text-pay-600 hover:bg-transparent focus:outline-none focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 active:outline-none border-none bg-transparent p-0"
                >
                  <Icon symbol="help" className="size-6" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-auto min-w-[240px]">
                <DropdownMenuItem
                  className="h-11 cursor-pointer px-4 py-0 focus:bg-muted focus:outline-none focus-visible:ring-0"
                >
                  <span>{t("help.request_whatsapp")}</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-neutral-100" />
                <DropdownMenuItem
                  onClick={() => setIsReportDialogOpen(true)}
                  className="h-11 cursor-pointer px-4 py-0 focus:bg-muted focus:outline-none focus-visible:ring-0"
                >
                  <span>{t("help.report_idea")}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Notifications dropdown */}
            <DropdownMenu open={isNotificationsDropdownOpen} onOpenChange={setIsNotificationsDropdownOpen}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="secondary"
                  aria-label="Notifications"
                  className="h-10 px-3 rounded-[12px] bg-primary-100 hover:bg-primary-200 focus:outline-none focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 active:outline-none border-0 focus:border-0 focus-visible:border-0"
                >
                  <Icon symbol="notifications" className="text-2xl text-secondary-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[360px] p-0">
                <div className="max-h-[400px] overflow-y-auto overflow-x-hidden">
                  <DropdownMenuItem
                    className="h-auto cursor-pointer px-4 py-3 focus:bg-muted focus:outline-none focus-visible:ring-0 flex flex-col items-start gap-1"
                  >
                    <p className="w-full text-sm font-semibold text-neutral-700 break-words">{t("notifications.items.payment_received.title")}</p>
                    <p className="w-full text-sm text-muted-foreground break-words">
                      {t("notifications.items.payment_received.description")}
                    </p>
                    <p className="w-full text-xs text-muted-foreground">{t("notifications.items.payment_received.time")}</p>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-neutral-100" />
                  <DropdownMenuItem
                    className="h-auto cursor-pointer px-4 py-3 focus:bg-muted focus:outline-none focus-visible:ring-0 flex flex-col items-start gap-1"
                  >
                    <p className="w-full text-sm font-semibold text-neutral-700 break-words">{t("notifications.items.batch_processed.title")}</p>
                    <p className="w-full text-sm text-muted-foreground break-words">
                      {t("notifications.items.batch_processed.description")}
                    </p>
                    <p className="w-full text-xs text-muted-foreground">{t("notifications.items.batch_processed.time")}</p>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-neutral-100" />
                  <DropdownMenuItem
                    className="h-auto cursor-pointer px-4 py-3 focus:bg-muted focus:outline-none focus-visible:ring-0 flex flex-col items-start gap-1"
                  >
                    <p className="w-full text-sm font-semibold text-neutral-700 break-words">{t("notifications.items.document_approved.title")}</p>
                    <p className="w-full text-sm text-muted-foreground break-words">
                      {t("notifications.items.document_approved.description")}
                    </p>
                    <p className="w-full text-xs text-muted-foreground">{t("notifications.items.document_approved.time")}</p>
                  </DropdownMenuItem>
                </div>
                <DropdownMenuSeparator className="bg-neutral-100" />
                <div className="p-3">
                  <Button
                    asChild
                    variant="link"
                    size="sm"
                    className="h-auto p-0 text-pay-500"
                  >
                    <Link to="/notifications" onClick={() => setIsNotificationsDropdownOpen(false)}>
                      {t("notifications.view_all")}
                    </Link>
                  </Button>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Hamburger menu button - mobile/tablet only */}
            <SidebarTrigger className="xl:hidden h-10 w-12 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center justify-center [&_span]:text-2xl" />
          </div>
        </SidebarTopBar>
        <Outlet />
      </SidebarInset>

      {/* Report Dialog */}
      <Dialog open={isReportDialogOpen} onOpenChange={setIsReportDialogOpen}>
        <DialogContent className="max-w-[610px] gap-12">
          <DialogHeader className="gap-2">
            <DialogTitle className="text-sm font-semibold">
              {t("help.dialog.title")}
            </DialogTitle>
            <DialogDescription className="text-sm text-foreground">
              {t("help.dialog.description")}
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4">
            <Select value={reportTopic} onValueChange={setReportTopic}>
              <SelectTrigger className="h-10 w-full">
                <SelectValue placeholder={t("help.dialog.topic_placeholder")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bug">{t("help.dialog.topics.bug")}</SelectItem>
                <SelectItem value="feature">{t("help.dialog.topics.feature")}</SelectItem>
                <SelectItem value="question">{t("help.dialog.topics.question")}</SelectItem>
                <SelectItem value="other">{t("help.dialog.topics.other")}</SelectItem>
              </SelectContent>
            </Select>

            <Input
              placeholder={t("help.dialog.message_placeholder")}
              value={reportMessage}
              onChange={(e) => setReportMessage(e.target.value)}
              className="h-10"
            />
          </div>

          <DialogFooter className="gap-6">
            <Button
              variant="secondary"
              onClick={() => {
                setIsReportDialogOpen(false);
                setReportTopic("");
                setReportMessage("");
              }}
            >
              {t("help.dialog.cancel")}
            </Button>
            <Button
              variant="default"
              disabled={!reportTopic || !reportMessage.trim()}
              onClick={() => {
                // Handle send message logic here
                console.log({ reportTopic, reportMessage });
                setIsReportDialogOpen(false);
                setReportTopic("");
                setReportMessage("");
              }}
            >
              {t("help.dialog.send")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Logout Confirmation Dialog */}
      <Dialog open={isLogoutDialogOpen} onOpenChange={setIsLogoutDialogOpen}>
        <DialogContent className="sm:max-w-[600px] gap-12">
          <DialogHeader>
            <DialogTitle>{t("logout_dialog.title")}</DialogTitle>
            <DialogDescription>
              {t("logout_dialog.description")}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setIsLogoutDialogOpen(false)}>
              {t("logout_dialog.cancel")}
            </Button>
            <Button 
              variant="default" 
              onClick={() => {
                // TODO: Implement logout logic
                console.log("Logout confirmed");
                setIsLogoutDialogOpen(false);
              }}
            >
              {t("logout_dialog.confirm")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Sidebar>

  );
}
