import { MoreVertical } from "lucide-react"
import { DropdownMenu as DropdownMenuPrimitive } from "radix-ui"
import { cn } from "@/lib/utils"

export interface DropdownMenuItem {
  label: string
  onClick: () => void
  variant?: "default" | "destructive" | "success"
}

interface RowActionsMenuProps {
  items: DropdownMenuItem[]
  trigger?: React.ReactNode
}

const DefaultTrigger = (
  <button className="text-brand/40 hover:bg-brand/5 hover:text-brand flex h-8 w-8 items-center justify-center rounded-lg transition-colors">
    <MoreVertical size={16} />
  </button>
)

export function RowActionsMenu({ items, trigger = DefaultTrigger }: RowActionsMenuProps) {
  return (
    <DropdownMenuPrimitive.Root>
      <DropdownMenuPrimitive.Trigger asChild>{trigger}</DropdownMenuPrimitive.Trigger>
      <DropdownMenuPrimitive.Portal>
        <DropdownMenuPrimitive.Content
          align="end"
          sideOffset={4}
          className="border-borderSubtle z-50 min-w-32.5 overflow-hidden rounded-lg border bg-white p-1 shadow-md"
          onClick={(e) => e.stopPropagation()}
        >
          {items.map((item) => (
            <DropdownMenuPrimitive.Item
              key={item.label}
              onClick={item.onClick}
              className={cn(
                "font-jakarta flex cursor-pointer items-center rounded-md px-3 py-2 text-sm font-medium transition-colors outline-none select-none",
                item.variant === "destructive"
                  ? "text-red-600 focus:bg-red-50"
                  : item.variant === "success"
                    ? "text-statusSuccess focus:bg-statusSuccessBg"
                    : "text-brand focus:bg-brand/5",
              )}
            >
              {item.label}
            </DropdownMenuPrimitive.Item>
          ))}
        </DropdownMenuPrimitive.Content>
      </DropdownMenuPrimitive.Portal>
    </DropdownMenuPrimitive.Root>
  )
}
