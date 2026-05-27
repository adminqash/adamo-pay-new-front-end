import { type ReactNode } from "react";
import { useElementRect } from "@/features/common/hooks/use-element-rect";
import { cn } from "@adamosuiteservices/ui/lib";

interface StickyFilterHeaderProps {
  /**
   * content to display in the sticky header
   */
  children: ReactNode;
  /**
   * additional CSS classes for the container
   */
  className?: string;
  /**
   * spacing offset from the top (in pixels)
   * defaults to 24px which is the standard card padding
   */
  topSpacing?: number;
}

/**
 * sticky filter header component
 * 
 * makes the header section sticky at the top of the viewport while scrolling,
 * maintaining proper spacing and visual consistency with the container
 * 
 * @example
 * ```tsx
 * <Card className="p-6 border overflow-visible">
 *   <StickyFilterHeader>
 *     <div>Your header content</div>
 *     <div>Your filters</div>
 *   </StickyFilterHeader>
 *   
 *   <div>Your scrollable content</div>
 * </Card>
 * ```
 */
export function StickyFilterHeader({ 
  children, 
  className,
  topSpacing = 24 
}: StickyFilterHeaderProps) {
  const sidebarTopBarRect = useElementRect("[data-slot='sidebar-top-bar']");
  
  // calculate sticky top offset (sidebar height + spacing)
  const stickyTopOffset = (sidebarTopBarRect?.height ?? 64) + topSpacing;

  return (
    <>
      <style>{`
        .sticky-filter-header {
          position: sticky;
          z-index: 10;
          background-color: white;
          margin-left: -1.5rem;
          margin-right: -1.5rem;
          padding-left: 1.5rem;
          padding-right: 1.5rem;
        }
        .sticky-filter-header::before {
          content: '';
          position: absolute;
          top: -24px;
          left: 0;
          right: 0;
          height: 24px;
          background-color: white;
          pointer-events: none;
          border-radius: 1.5rem 1.5rem 0 0;
        }
        .sticky-filter-header::after {
          content: '';
          position: absolute;
          bottom: -24px;
          left: 0;
          right: 0;
          height: 24px;
          background-color: white;
          pointer-events: none;
          z-index: 1;
        }
      `}</style>
      <div 
        className={cn("sticky-filter-header", className)}
        style={{ top: `${stickyTopOffset}px` }}
      >
        {children}
      </div>
    </>
  );
}
