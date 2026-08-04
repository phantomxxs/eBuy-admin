import { Popover as PopoverPrimitive } from "radix-ui"

interface PopoverProps {
  trigger: React.ReactNode
  children: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
  align?: "start" | "center" | "end"
  sideOffset?: number
  contentClassName?: string
}

/**
 * Popover — wraps Radix PopoverPrimitive with a flat props API.
 * Never import or compose PopoverPrimitive sub-parts outside this file.
 */
export default function Popover({
  trigger,
  children,
  open,
  onOpenChange,
  align = "end",
  sideOffset = 8,
  contentClassName,
}: PopoverProps) {
  return (
    <PopoverPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <PopoverPrimitive.Trigger asChild>{trigger}</PopoverPrimitive.Trigger>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          align={align}
          sideOffset={sideOffset}
          className={[
            "z-50 outline-none",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
            "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
            "data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2",
            contentClassName,
          ]
            .filter(Boolean)
            .join(" ")}
        >
          {children}
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  )
}
