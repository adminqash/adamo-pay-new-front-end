import { Icon } from "@adamosuiteservices/ui/icon";
import { cn } from "@adamosuiteservices/ui/lib";
import { Popover, PopoverContent, PopoverTrigger } from "@adamosuiteservices/ui/popover";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { env } from "@/lib/env";

type SuiteProductKey = "id" | "pay" | "sign" | "check";

type SuiteProduct = {
  key: SuiteProductKey
  name: string
  dotClass: string
  href: string
};

// The product this frontend belongs to. Its row is marked as active.
const CURRENT_PRODUCT: SuiteProductKey = "pay";

// Order matches the Figma design: ID, Pay, Sign, Check.
const SUITE_PRODUCTS: SuiteProduct[] = [
  {
    key: "id",
    name: "ID",
    dotClass: "bg-id-600",
    href: env.VITE_ID_FRONT_BASE_URL || "#",
  },
  {
    key: "pay",
    name: "Pay",
    dotClass: "bg-pay-600",
    href: "/",
  },
  {
    key: "sign",
    name: "Sign",
    dotClass: "bg-sign-600",
    href: env.VITE_SIGN_FRONT_BASE_URL || "#",
  },
  {
    key: "check",
    name: "Check",
    dotClass: "bg-check-600",
    href: env.VITE_CHECK_FRONT_BASE_URL || "#",
  },
];

export function ProductSwitcher() {
  const { t } = useTranslation("suite-header");

  const [isOpen, setIsOpen] = useState(false);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={t("apps_label")}
          className={`
            flex h-14 items-center justify-center px-2 text-white/90
            transition-opacity
            hover:text-white
            focus-visible:ring-2 focus-visible:ring-white/40
            focus-visible:outline-none
          `}
        >
          <Icon symbol="apps" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-72 p-0">
        {SUITE_PRODUCTS.map((product) => {
          const isActive = product.key === CURRENT_PRODUCT;

          return (
            <a
              key={product.key}
              href={product.href}
              onClick={() => setIsOpen(false)}
              className={`
                flex items-center gap-3 border-b px-4 py-3 transition-colors
                last:border-0
                hover:bg-neutrals-50
              `}
            >
              <span className={`
                flex size-5 shrink-0 items-center justify-center
              `}
              >
                <span className={cn("size-2.5 rounded-full", product.dotClass)} />
              </span>
              <div className="flex flex-1 flex-col gap-1">
                <span className="text-sm leading-5 text-neutrals-700">
                  {product.name}
                </span>
                <span className="text-sm leading-5 text-neutrals-400">
                  {t(`products.${product.key}`)}
                </span>
              </div>
              {isActive && (
                <Icon symbol="check" className="shrink-0 text-neutrals-700" />
              )}
            </a>
          );
        })}
      </PopoverContent>
    </Popover>
  );
}
