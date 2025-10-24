/* eslint-disable react-refresh/only-export-components */
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-full text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-transparent disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-r from-primary via-sky-500 to-sky-400 text-primary-foreground shadow-lg shadow-sky-200/70 hover:shadow-sky-200/90 hover:-translate-y-0.5",
        destructive:
          "bg-destructive text-destructive-foreground shadow-md shadow-rose-200/60 hover:bg-destructive/90",
        outline:
          "border border-border bg-white/70 text-foreground shadow-sm shadow-slate-200/60 hover:bg-white/90",
        secondary:
          "bg-secondary text-secondary-foreground shadow shadow-slate-200/70 hover:shadow-lg hover:-translate-y-0.5",
        ghost: "hover:bg-white/60 hover:text-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-11 px-6",
        sm: "h-9 rounded-full px-4 text-xs",
        lg: "h-12 rounded-full px-10 text-base",
        icon: "h-11 w-11",
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
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
