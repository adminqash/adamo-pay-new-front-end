import { cn } from "@adamosuiteservices/ui/lib";
import type { ComponentProps } from "react";
import { useElementRect } from "@/features/common/hooks/use-element-rect";

export function PageContainer({ children, className }: ComponentProps<"main">) {
  const sidebarTopBarRect = useElementRect("[data-slot='sidebar-top-bar']");

  const topOffset = sidebarTopBarRect?.height ?? 64;

  return (
    <main
      style={{ minHeight: `calc(100vh - ${topOffset}px)` }}
      className={cn(`
        bg-neutrals-25 px-4 py-4
        md:px-8
        lg:px-14
      `, className)}
    >
      {children}
    </main>
  );
}
