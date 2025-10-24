import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-full text-sm font-semibold tracking-tight transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-60",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-r from-primary via-sky-500/80 to-primary/70 text-primary-foreground shadow-[0_18px_45px_-25px_rgba(59,130,246,0.95)] hover:shadow-[0_20px_50px_-20px_rgba(56,189,248,0.9)] hover:brightness-110",
        destructive:
          "bg-destructive text-destructive-foreground shadow-[0_15px_40px_-25px_rgba(248,113,113,0.8)] hover:bg-destructive/90",
        outline:
          "border border-white/15 bg-white/[0.04] text-foreground shadow-[0_12px_35px_-28px_rgba(148,163,184,0.65)] hover:border-white/25 hover:bg-white/[0.08]",
        secondary:
          "bg-secondary text-secondary-foreground shadow-[0_12px_35px_-28px_rgba(56,189,248,0.45)] hover:bg-secondary/80",
        ghost: "text-foreground hover:bg-white/10",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-11 px-6",
        sm: "h-9 rounded-full px-4 text-xs",
        lg: "h-12 rounded-full px-8 text-base",
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
