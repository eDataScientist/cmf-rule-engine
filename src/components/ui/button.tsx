import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-r from-blue-500 via-sky-500 to-cyan-400 text-white shadow-[0_18px_45px_-25px_rgba(14,116,144,0.65)] hover:shadow-[0_22px_55px_-25px_rgba(14,116,144,0.75)] hover:translate-y-[-1px]",
        destructive:
          "bg-destructive text-destructive-foreground shadow hover:bg-destructive/85",
        outline:
          "border border-white/60 bg-white/60 text-slate-600 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] hover:border-slate-300 hover:text-slate-900",
        secondary:
          "bg-secondary text-secondary-foreground shadow hover:bg-secondary/70",
        ghost:
          "hover:bg-white/60 hover:text-slate-900",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-lg px-3 text-xs",
        lg: "h-11 rounded-2xl px-8",
        icon: "h-9 w-9 rounded-xl",
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
