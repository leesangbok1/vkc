import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-normal focus:outline-none focus:ring-2 focus:ring-primary-blue focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary-blue text-white hover:bg-primary-700",
        destructive: "bg-error text-white hover:bg-error/90",
        outline: "border border-light bg-primary hover:bg-secondary text-secondary hover:text-primary",
        secondary: "bg-secondary text-primary hover:bg-tertiary",
        ghost: "hover:bg-secondary hover:text-primary",
        link: "text-primary-blue underline-offset-4 hover:underline",
        primary: "bg-primary-blue text-white hover:bg-primary-700 hover:scale-105 transition-normal",
        "primary-outline": "border-2 border-primary-blue text-primary-blue bg-transparent hover:bg-primary-blue hover:text-white transition-normal",
        "primary-green": "bg-trust text-white hover:bg-secondary-600 hover:scale-105 transition-normal",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-lg px-3",
        lg: "h-11 rounded-lg px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }