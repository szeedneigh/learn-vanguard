import * as React from "react"
import * as SeparatorPrimitive from "@radix-ui/react-separator"
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils"

const separatorVariants = cva(
  "shrink-0",
  {
    variants: {
      variant: {
        default: "bg-border",
        dashed: "bg-border border-dashed",
        dotted: "bg-border border-dotted",
        thick: "bg-border",
      },
      orientation: {
        horizontal: "h-[1px] w-full",
        vertical: "h-full w-[1px]",
      },
    },
    defaultVariants: {
      variant: "default",
      orientation: "horizontal",
    },
  }
)

const Separator = React.forwardRef((
  { className, orientation = "horizontal", decorative = true, variant = "default", ...props },
  ref
) => (
  <SeparatorPrimitive.Root
    ref={ref}
    decorative={decorative}
    orientation={orientation}
    className={cn(
      separatorVariants({ variant, orientation }),
      variant === "thick" && (orientation === "horizontal" ? "h-[2px]" : "w-[2px]"),
      className
    )}
    {...props} />
))
Separator.displayName = SeparatorPrimitive.Root.displayName

export { Separator }
