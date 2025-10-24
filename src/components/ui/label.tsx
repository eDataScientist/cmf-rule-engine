import * as React from "react"
import { cn } from "@/lib/utils"

type LabelProps = React.LabelHTMLAttributes<HTMLLabelElement>

const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, ...props }, ref) => (
    <label
      ref={ref}
      className={cn(
        "text-sm font-medium uppercase tracking-[0.3em] text-muted-foreground peer-disabled:cursor-not-allowed peer-disabled:opacity-60",
        className
      )}
      {...props}
    />
  )
)
Label.displayName = "Label"

export { Label }
