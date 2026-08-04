import { useState, useEffect } from "react"
import { Minus, Plus } from "lucide-react"
import { cn } from "@/lib/utils"

interface QuantityControlProps {
  quantity: number
  onDecrement: () => void
  onIncrement: () => void
  onQuantityChange?: (value: number) => void
  size?: "sm" | "md"
  className?: string
}

export default function QuantityControl({
  quantity,
  onDecrement,
  onIncrement,
  onQuantityChange,
  size = "md",
  className,
}: QuantityControlProps) {
  const [inputValue, setInputValue] = useState(String(quantity))

  useEffect(() => {
    setInputValue(String(quantity))
  }, [quantity])

  const commit = (raw: string) => {
    const parsed = parseInt(raw, 10)
    if (!isNaN(parsed) && parsed > 0) {
      onQuantityChange?.(parsed)
    } else {
      setInputValue(String(quantity))
    }
  }

  return (
    <div
      className={cn(
        "border-blur flex w-fit items-center gap-3 rounded border",
        size === "md" && "px-1 py-1.5",
        size === "sm" && "px-0.5 py-1",
        className,
      )}
    >
      <button
        onClick={onDecrement}
        className={cn(
          "border-blur text-brand/50 hover:text-brand flex items-center justify-center rounded border transition-colors",
          size === "md" && "size-7",
          size === "sm" && "size-5",
        )}
      >
        <Minus className="size-3" />
      </button>
      <input
        type="text"
        inputMode="numeric"
        value={inputValue}
        onChange={(e) => {
          const val = e.target.value
          if (/^\d*$/.test(val)) setInputValue(val)
        }}
        onBlur={() => commit(inputValue)}
        onKeyDown={(e) => {
          if (e.key === "Enter") e.currentTarget.blur()
        }}
        className={cn(
          "font-jakarta text-brand w-6 bg-transparent text-center font-medium outline-none",
          size === "md" && "text-sm",
          size === "sm" && "text-xs",
        )}
      />
      <button
        onClick={onIncrement}
        className={cn(
          "border-blur text-brand/50 hover:text-brand flex items-center justify-center rounded border transition-colors",
          size === "md" && "size-7",
          size === "sm" && "size-5",
        )}
      >
        <Plus className="size-3" />
      </button>
    </div>
  )
}
