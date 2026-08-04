import { useState } from "react"
import { ChevronDown, Check } from "lucide-react"
import { Popover as PopoverPrimitive } from "radix-ui"
import { cn } from "@/lib/utils"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select"

export interface DropdownOption {
  label: string
  value: string
}

interface BaseProps {
  label?: string
  options: DropdownOption[]
  placeholder?: string
  className?: string
  disabled?: boolean
  hideBorder?: boolean
  error?: string
  onBlur?: () => void
  required?: boolean
}

interface SingleProps extends BaseProps {
  multiple?: false
  value?: string
  onChange?: (value: string) => void
}

interface MultiProps extends BaseProps {
  multiple: true
  value?: string[]
  onChange?: (value: string[]) => void
  disabledValues?: string[]
}

export type DropdownProps = SingleProps | MultiProps

export default function Dropdown(props: DropdownProps) {
  if (props.multiple) return <MultiDropdown {...props} />
  return <SingleDropdown {...props} />
}

// ── Single select ───────────────────────────────────────────────────────────────

function SingleDropdown({
  label,
  options,
  value,
  onChange,
  placeholder = "Select an option",
  className,
  disabled,
  hideBorder,
  error,
  onBlur,
  required,
}: SingleProps) {
  return (
    <div className={cn("flex w-full flex-col gap-1.5", className)}>
      {label && (
        <label className="font-jakarta text-brand text-xs font-semibold">
          {label}
          {required && <span className="text-destructive ml-0.5">*</span>}
        </label>
      )}
      <Select value={value} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger
          aria-invalid={!!error || undefined}
          onBlur={onBlur}
          className={cn(hideBorder && "border-transparent!")}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && <p className="font-jakarta text-destructive text-xs">{error}</p>}
    </div>
  )
}

// ── Multi select ────────────────────────────────────────────────────────────────

function MultiDropdown({
  label,
  options,
  value = [],
  onChange,
  placeholder = "Select options",
  className,
  disabled,
  hideBorder,
  error,
  onBlur,
  disabledValues = [],
  required,
}: MultiProps) {
  const [open, setOpen] = useState(false)

  const toggle = (optValue: string) => {
    const next = value.includes(optValue)
      ? value.filter((v) => v !== optValue)
      : [...value, optValue]
    onChange?.(next)
  }

  const displayText = (() => {
    if (!value.length) return null
    const labels = options.filter((o) => value.includes(o.value)).map((o) => o.label)
    if (value.length <= 2) return labels.join(", ")
    return `${value.length} selected`
  })()

  return (
    <div className={cn("flex w-full flex-col gap-1.5", className)}>
      {label && (
        <label className="font-jakarta text-brand text-xs font-semibold">
          {label}
          {required && <span className="text-destructive ml-0.5">*</span>}
        </label>
      )}
      <PopoverPrimitive.Root open={open} onOpenChange={setOpen}>
        <PopoverPrimitive.Trigger asChild>
          <button
            type="button"
            disabled={disabled}
            onBlur={onBlur}
            aria-invalid={!!error || undefined}
            className={cn(
              "border-input focus-visible:border-ring focus-visible:ring-ring/50",
              "data-[state=open]:border-ring data-[state=open]:ring-ring/50 data-[state=open]:ring-[3px]",
              "aria-invalid:border-destructive aria-invalid:ring-destructive/20",
              "flex h-10 w-full items-center justify-between gap-2 rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs transition-[color,box-shadow] outline-none",
              "disabled:cursor-not-allowed disabled:opacity-50",
              hideBorder && "border-transparent!",
            )}
          >
            <span className={cn("truncate text-left", !displayText && "text-muted-foreground")}>
              {displayText ?? placeholder}
            </span>
            <ChevronDown className="size-4 shrink-0 opacity-50" />
          </button>
        </PopoverPrimitive.Trigger>

        <PopoverPrimitive.Portal>
          <PopoverPrimitive.Content
            align="start"
            sideOffset={4}
            style={{ minWidth: "var(--radix-popover-trigger-width)" }}
            onWheelCapture={(e) => e.stopPropagation()}
            className={cn(
              "border-border bg-popover z-50 max-h-60 overflow-y-auto rounded-md border p-1 shadow-md",
              "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95",
              "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
            )}
          >
            {options.map((opt, i) => {
              const selected = value.includes(opt.value)
              const isDisabled = disabledValues.includes(opt.value)
              return (
                <button
                  key={String(opt.value) + i.toString()}
                  type="button"
                  disabled={isDisabled}
                  onClick={() => !isDisabled && toggle(opt.value)}
                  className={cn(
                    "flex w-full cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm transition-colors outline-none",
                    isDisabled
                      ? "cursor-not-allowed opacity-40"
                      : "hover:bg-accent focus:bg-accent",
                  )}
                >
                  <div
                    className={cn(
                      "flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border transition-colors",
                      selected
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-input",
                    )}
                  >
                    {selected && <Check className="size-3" />}
                  </div>
                  <span className="font-jakarta text-sm">{opt.label}</span>
                </button>
              )
            })}
          </PopoverPrimitive.Content>
        </PopoverPrimitive.Portal>
      </PopoverPrimitive.Root>

      {error && <p className="font-jakarta text-destructive text-xs">{error}</p>}
    </div>
  )
}
