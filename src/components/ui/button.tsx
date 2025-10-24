import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-full border border-transparent px-5 py-2 text-sm font-semibold tracking-wide transition-all duration-300 ease-out transform-gpu focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-60 shadow-sm shadow-black/5",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-r from-primary/80 via-primary to-primary/90 text-primary-foreground shadow-lg shadow-primary/25 hover:-translate-y-0.5 hover:shadow-xl",
        destructive:
          "bg-destructive text-destructive-foreground shadow-lg shadow-destructive/30 hover:-translate-y-0.5 hover:bg-destructive/90",
        outline:
          "border border-primary/30 bg-white/60 text-primary hover:-translate-y-0.5 hover:border-primary/60 hover:bg-primary/10",
        secondary:
          "bg-secondary text-secondary-foreground shadow-md hover:-translate-y-0.5 hover:shadow-lg",
        ghost: "text-primary hover:bg-primary/10",
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
