import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-full text-sm font-medium tracking-wide transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-r from-primary via-primary/90 to-primary/75 text-primary-foreground shadow-[0_20px_45px_-20px_rgba(71,85,105,0.85)] hover:-translate-y-[1px] hover:shadow-[0_28px_60px_-25px_rgba(71,85,105,0.75)]",
        destructive:
          "bg-destructive text-destructive-foreground shadow-[0_20px_45px_-20px_rgba(248,113,113,0.65)] hover:bg-destructive/90",
        outline:
          "border border-border/70 bg-transparent text-foreground shadow-[0_18px_45px_-30px_rgba(71,85,105,0.6)] hover:border-primary/40 hover:bg-white/70",
        secondary:
          "bg-secondary text-secondary-foreground shadow-[0_18px_45px_-28px_rgba(148,163,184,0.55)] hover:bg-secondary/80",
        ghost: "text-muted-foreground hover:bg-white/70 hover:text-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-11 px-6",
        sm: "h-9 rounded-full px-4 text-xs",
        lg: "h-12 rounded-full px-9 text-base",
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
