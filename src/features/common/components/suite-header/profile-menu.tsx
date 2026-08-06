import { Avatar, AvatarFallback, AvatarImage } from "@adamosuiteservices/ui/avatar";
import { Button } from "@adamosuiteservices/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@adamosuiteservices/ui/dialog";
import { Icon } from "@adamosuiteservices/ui/icon";
import { Popover, PopoverContent, PopoverTrigger } from "@adamosuiteservices/ui/popover";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import { useAuth } from "@/features/auth/application/contexts/auth.context";
import { ChangeLanguageDialog } from "@/features/common/components/language/change-language-dialog";
import { useAvatar } from "@/features/common/contexts/use-avatar";

const itemClass = `
  flex w-full items-center gap-3 px-4 py-3 text-left text-sm leading-5
  text-neutrals-700 transition-colors border-b border-b-neutrals-100
  hover:bg-neutrals-50
`;

export function ProfileMenu() {
  const { t } = useTranslation(["suite-header"]);
  const { signOut } = useAuth();
  const { avatarUrl, userInitials, userName, userEmail } = useAvatar();

  const [isOpen, setIsOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  return (
    <>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            aria-label={t("profile_menu_label")}
            className={`
              rounded-full ring-2 ring-white/20
              focus-visible:ring-2 focus-visible:ring-white/40
              focus-visible:outline-none
            `}
          >
            <Avatar className="size-10 rounded-full">
              <AvatarImage src={avatarUrl} alt={userName} />
              <AvatarFallback className={`
                rounded-full bg-white text-sm text-black
              `}
              >
                {userInitials}
              </AvatarFallback>
            </Avatar>
          </button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-72 p-0">
          <div className={`
            flex flex-col gap-1 border-b border-neutrals-100 px-4 py-3
          `}
          >
            <p className="text-sm leading-5 font-semibold text-neutrals-700">
              {userName}
            </p>
            <p className="truncate text-sm leading-5 text-neutrals-400">
              {userEmail}
            </p>
          </div>
          <Link to="/profile" className={itemClass} onClick={() => setIsOpen(false)}>
            <Icon symbol="account_circle" className="shrink-0" />
            {t("profile.myProfile")}
          </Link>
          <Link to="/profile" className={itemClass} onClick={() => setIsOpen(false)}>
            <Icon symbol="manage_accounts" className="shrink-0" />
            {t("profile.userManagement")}
          </Link>
          <button
            type="button"
            className={itemClass}
            onClick={() => {
              setIsOpen(false);
              setIsLangOpen(true);
            }}
          >
            <Icon symbol="language" className="shrink-0" />
            {t("profile.language")}
          </button>
          <button
            type="button"
            className={itemClass}
            onClick={() => {
              setIsOpen(false);
              setIsLogoutOpen(true);
            }}
          >
            <Icon symbol="logout" className="shrink-0" />
            {t("profile.logout")}
          </button>
        </PopoverContent>
      </Popover>
      <ChangeLanguageDialog open={isLangOpen} onOpenChange={setIsLangOpen} />
      <Dialog open={isLogoutOpen} onOpenChange={setIsLogoutOpen}>
        <DialogContent className={`
          gap-12
          sm:max-w-[600px]
        `}
        >
          <DialogHeader>
            <DialogTitle>{t("logout_dialog.title")}</DialogTitle>
            <DialogDescription>
              {t("logout_dialog.description")}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setIsLogoutOpen(false)}>
              {t("logout_dialog.cancel")}
            </Button>
            <Button
              variant="default"
              disabled={isLoggingOut}
              onClick={() => {
                setIsLoggingOut(true);
                void signOut();
              }}
            >
              {t("logout_dialog.confirm")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
