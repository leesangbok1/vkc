import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold transition-normal focus:outline-none focus:ring-2 focus:ring-primary-blue focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary-blue text-white hover:bg-primary-700",
        secondary: "border-transparent bg-secondary text-primary hover:bg-tertiary",
        destructive: "border-transparent bg-error text-white hover:bg-error/90",
        outline: "border-light text-secondary hover:bg-secondary",
        success: "border-transparent bg-trust text-white hover:bg-secondary-600",
        warning: "border-transparent bg-warning-500 text-primary hover:bg-warning-600",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }