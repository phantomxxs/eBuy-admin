import { useState } from "react"
import { CalendarIcon } from "lucide-react"
import { Popover } from "radix-ui"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"

interface Props {
  value?: string // ISO date string "YYYY-MM-DD"
  onChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
  minDate?: Date
  maxDate?: Date
  className?: string
}

function formatDisplay(iso: string): string {
  const d = new Date(iso + "T00:00:00")
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
}

export function DatePicker({
  value,
  onChange,
  placeholder = "Pick a date",
  disabled,
  minDate,
  maxDate,
  className,
}: Props) {
  const [open, setOpen] = useState(false)

  const selected = value ? new Date(value + "T00:00:00") : undefined

  return (
    <Popover.Root open={open} onOpenChange={(o) => !disabled && setOpen(o)}>
      <Popover.Trigger asChild>
        <button
          type="button"
          disabled={disabled}
          className={cn(
            "font-jakarta border-borderSubtle flex h-9 w-full items-center gap-2 rounded-lg border bg-white px-3 text-sm transition-colors",
            "focus:ring-primary/30 focus:ring-2 focus:outline-none",
            disabled ? "cursor-not-allowed opacity-40" : "hover:bg-gray-50",
            value ? "text-brand" : "text-brand/40",
            className,
          )}
        >
          <CalendarIcon size={14} className="text-brand/40 shrink-0" />
          <span className="flex-1 text-left">{value ? formatDisplay(value) : placeholder}</span>
        </button>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          align="start"
          sideOffset={6}
          className="border-borderSubtle z-50 rounded-xl border bg-white p-0 shadow-lg"
        >
          <Calendar
            mode="single"
            selected={selected}
            disabled={
              minDate && maxDate
                ? { before: minDate, after: maxDate }
                : minDate
                  ? { before: minDate }
                  : maxDate
                    ? { after: maxDate }
                    : undefined
            }
            defaultMonth={minDate ?? selected}
            onSelect={(date) => {
              if (date) {
                const y = date.getFullYear()
                const m = String(date.getMonth() + 1).padStart(2, "0")
                const d = String(date.getDate()).padStart(2, "0")
                onChange(`${y}-${m}-${d}`)
              } else {
                onChange("")
              }
              setOpen(false)
            }}
          />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}
