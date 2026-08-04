import { useState, useRef, useEffect } from "react"
import { Search, X, Check, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { useCustomerSearch } from "@/store/queries/customers"

interface CustomerOption {
  value: string | number
  label: string
  name: string
  email: string
}

interface CustomerSearchInputProps {
  label?: string
  value: string
  onChange: (value: string) => void
  onBlur?: () => void
  placeholder?: string
  error?: string
  className?: string
  /** When set, shows this as the active "selection" (guest mode) */
  guestLabel?: string
  onGuestClick?: () => void
  onClearGuest?: () => void
  /** Filter results to a specific customer type, e.g. "registered" */
  customerType?: string
}

export default function CustomerSearchInput({
  label,
  value,
  onChange,
  onBlur,
  placeholder = "Search customer…",
  error,
  className,
  guestLabel,
  onGuestClick,
  onClearGuest,
  customerType,
}: CustomerSearchInputProps) {
  const [query, setQuery] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const [internalLabel, setInternalLabel] = useState("")
  const containerRef = useRef<HTMLDivElement>(null)

  const { data: options = [], isLoading } = useCustomerSearch(query, customerType)
  const { data: resolverOptions = [] } = useCustomerSearch("", customerType)

  useEffect(() => {
    if (!value || internalLabel) return
    const opt = resolverOptions.find((o) => o.value === Number(value))
    if (opt) setInternalLabel(opt.label)
  }, [resolverOptions, value, internalLabel])

  useEffect(() => {
    if (!value) {
      setInternalLabel("")
      setQuery("")
    }
  }, [value])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (value) {
      onChange("")
      setInternalLabel("")
    }
    setQuery(e.target.value)
    setIsOpen(true)
  }

  const handleSelect = (option: CustomerOption) => {
    onChange(String(option.value))
    setInternalLabel(option.label)
    setQuery("")
    setIsOpen(false)
    onBlur?.()
  }

  const handleClear = () => {
    onChange("")
    setInternalLabel("")
    setQuery("")
    setIsOpen(false)
  }

  // Guest mode takes display priority over a selected customer
  const isGuestMode = !!guestLabel
  const inputText = isGuestMode ? guestLabel : value ? internalLabel : query

  return (
    <div ref={containerRef} className={cn("relative flex flex-col gap-1", className)}>
      {label && (
        <div className="flex items-center justify-between">
          <label className="font-jakarta text-brand text-xs font-semibold">{label}</label>
          {onGuestClick && (
            <button
              type="button"
              onClick={isGuestMode ? onClearGuest : onGuestClick}
              className="font-jakarta text-secondary text-xs font-semibold transition-opacity hover:opacity-80"
            >
              {isGuestMode ? "Remove guest" : "+ Guest customer"}
            </button>
          )}
        </div>
      )}

      <div
        className={cn(
          "border-borderSubtle flex h-10 items-center gap-2 rounded-lg border bg-white px-3 transition-colors",
          isOpen && "border-primary/50 ring-primary/20 ring-2",
          error && "border-danger",
          isGuestMode && "bg-brand/[0.02]",
        )}
      >
        <Search size={14} className="text-brand/40 shrink-0" />
        <input
          type="text"
          value={inputText ?? ""}
          onChange={isGuestMode ? undefined : handleInputChange}
          onFocus={isGuestMode ? undefined : () => setIsOpen(true)}
          onBlur={onBlur}
          readOnly={isGuestMode}
          placeholder={isGuestMode ? "" : placeholder}
          className={cn(
            "font-jakarta text-brand placeholder:text-brand/40 w-full bg-transparent text-sm focus:outline-none",
            isGuestMode && "text-brand/70 cursor-default",
          )}
        />
        {isLoading && !isGuestMode && (
          <Loader2 size={14} className="text-brand/40 shrink-0 animate-spin" />
        )}
        {!!inputText && !isLoading && !isGuestMode && (
          <button
            type="button"
            onClick={handleClear}
            className="text-brand/40 hover:text-brand/70 shrink-0 transition-colors"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {error && <p className="font-jakarta text-danger text-xs">{error}</p>}

      {isOpen && !isGuestMode && (
        <div className="border-borderSubtle absolute top-full right-0 left-0 z-50 mt-1 max-h-56 overflow-y-auto rounded-lg border bg-white shadow-lg">
          {isLoading ? (
            <div className="flex items-center justify-center py-6">
              <Loader2 size={16} className="text-brand/40 animate-spin" />
            </div>
          ) : options.length === 0 ? (
            <p className="font-jakarta text-brand/50 py-6 text-center text-sm">
              {query ? `No customers found for "${query}"` : "Search for a customer"}
            </p>
          ) : (
            options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleSelect(option)}
                className={cn(
                  "font-jakarta text-brand hover:bg-primary/5 flex w-full flex-col items-start px-3 py-2.5 text-left transition-colors",
                  value === String(option.value) && "bg-primary/5",
                )}
              >
                <span className="flex w-full items-center gap-2">
                  <span className="flex-1 truncate text-sm font-medium">{option.name}</span>
                  {value === String(option.value) && (
                    <Check size={14} className="text-primary shrink-0" />
                  )}
                </span>
                <span className="text-brand/50 text-xs">{option.email}</span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  )
}
