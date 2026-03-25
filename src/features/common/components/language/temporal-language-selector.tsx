import { useTranslation } from "react-i18next";
import { AVAILABLE_LANGUAGES } from "@/lib/i18n/i18n.config";
import { Icon } from "@adamosuiteservices/ui/icon";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@adamosuiteservices/ui/dropdown-menu";

export function TemporalLanguageSelector() {
  const { i18n } = useTranslation();

  const changeLanguage = (value: string): void => {
    i18n.changeLanguage(value);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex h-10 items-center gap-1 rounded-[32px] bg-transparent text-sm font-semibold text-foreground focus:outline-none focus-visible:outline-none"
        >
          <span>{i18n.language.toUpperCase()}</span>
          <Icon symbol="arrow_drop_down" weight={200} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="center" className="w-auto min-w-[100px] p-0">
        {AVAILABLE_LANGUAGES.map((lang, index) => (
          <div key={lang}>
            <DropdownMenuItem
              onClick={() => changeLanguage(lang)}
              className="h-11 cursor-pointer px-4 py-0 focus:bg-muted focus:outline-none focus-visible:ring-0"
            >
              <span className="flex-1">{lang.toUpperCase()}</span>
              {i18n.language === lang && (
                <Icon symbol="check" weight={200} className="ml-auto text-pay-500" />
              )}
            </DropdownMenuItem>
            {index < AVAILABLE_LANGUAGES.length - 1 && (
              <DropdownMenuSeparator className="bg-neutral-100" />
            )}
          </div>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
