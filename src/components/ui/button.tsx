import * as React from "react"
import { type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"
import { Loader2 } from "lucide-react"

import { cn } from "@/lib/utils"
import { useIsMobile } from "@/hooks/useIsMobile"
import { buttonVariants } from "./button-variants"

type ButtonVariant = VariantProps<typeof buttonVariants>["variant"]
type ButtonSize = VariantProps<typeof buttonVariants>["size"]

interface ButtonProps extends React.ComponentProps<"button"> {
  asChild?: boolean
  variant?: ButtonVariant
  theme?: ButtonVariant
  size?: ButtonSize
  label?: string
  beforeIcon?: React.ReactNode
  afterIcon?: React.ReactNode
  loading?: boolean
}

function Button({
  className,
  variant,
  theme,
  size = "default",
  asChild = false,
  label,
  beforeIcon,
  afterIcon,
  loading,
  children,
  disabled,
  ...props
}: ButtonProps) {
  const isMobile = useIsMobile()
  const Comp = asChild ? Slot.Root : "button"
  const resolvedVariant = theme ?? variant ?? "default"
  const resolvedSize = size ?? (isMobile ? "sm" : "default")
  const content = label ?? children

  return (
    <Comp
      data-slot="button"
      data-variant={resolvedVariant}
      data-size={resolvedSize}
      disabled={disabled ?? loading}
      className={cn(
        buttonVariants({
          variant: resolvedVariant,
          size: resolvedSize,
          className,
        }),
        loading && "animate-pulse",
      )}
      {...props}
    >
      {loading ? <Loader2 className="animate-spin" /> : beforeIcon}
      {content}
      {loading ? null : afterIcon}
    </Comp>
  )
}

export { Button }
