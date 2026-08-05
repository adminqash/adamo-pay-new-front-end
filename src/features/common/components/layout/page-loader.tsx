import { Spinner } from "@adamosuiteservices/ui/spinner";
import { useElementRect } from "@/features/common/hooks/use-element-rect";

export function PageLoader() {
  const sidebarTopBarRect = useElementRect("[data-slot='sidebar-top-bar']");

  const topOffset = sidebarTopBarRect?.bottom ?? 112;

  return (
    <div
      style={{ minHeight: `calc(100vh - ${topOffset}px)` }}
      className="grid w-full place-content-center"
    >
      <Spinner className="text-4xl text-primary" />
    </div>
  );
}
