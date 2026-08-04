import { Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface DeleteButtonProps {
  onClick: () => void
  variant?: "bordered" | "ghost"
  size?: "sm" | "md"
  className?: string
}

export default function DeleteButton({
  onClick,
  variant = "bordered",
  size = "md",
  className,
}: DeleteButtonProps) {
  return (
    <button
      onClick={onClick}
      aria-label="Remove item"
      className={cn(
        "text-danger shrink-0 transition-colors hover:text-red-600",
        variant === "bordered" && "border-blush rounded-full border",
        variant === "ghost" && "text-red-400",
        size === "md" && variant === "bordered" && "p-1.5",
        size === "sm" && variant === "bordered" && "p-1",
        className,
      )}
    >
      <Trash2 className={cn(size === "sm" ? "size-3.5" : "size-4")} />
    </button>
  )
}
