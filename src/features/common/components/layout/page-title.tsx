import { cn } from "@adamosuiteservices/ui/lib";
import { Typography } from "@adamosuiteservices/ui/typography";
import type { ComponentProps } from "react";

export type PageTitleProps = Readonly<ComponentProps<typeof Typography>>;

export function PageTitle({ className, children, ...props }: PageTitleProps) {
  return (
    <Typography
      asChild
      className={cn(className, "font-bold")}
      {...props}
    >
      <h1>{children}</h1>
    </Typography>
  );
}
