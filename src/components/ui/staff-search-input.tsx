import { useState, useRef, useEffect } from "react"
import { Search, X, Check, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { useStaffSearch } from "@/store/queries/staff"

interface StaffOption {
  value: string
  label: string
}

interface StaffSearchInputProps {
  label?: string
  value: string
  onChange: (value: string) => void
  onBlur?: () => void
  placeholder?: string
  error?: string
  className?: string
  status?: string
}

export default function StaffSearchInput({
  label,
  value,
  onChange,
  onBlur,
  placeholder = "Search staff…",
  error,
  className,
  status,
}: StaffSearchInputProps) {
  const [query, setQuery] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const [internalLabel, setInternalLabel] = useState("")
  const containerRef = useRef<HTMLDivElement>(null)

  const { data: options = [], isLoading } = useStaffSearch({ search: query, pageSize: 100, status })
  const { data: resolverOptions = [] } = useStaffSearch({ search: "", pageSize: 100, status })

  useEffect(() => {
    if (!value || internalLabel) return
    const opt = resolverOptions.find((o) => o.value === value)
    if (opt) setInternalLabel(opt.label)
  }, [resolverOptions, value])

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

  const handleSelect = (option: StaffOption) => {
    onChange(option.value)
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

  const inputText = value ? internalLabel : query

  return (
    <div ref={containerRef} className={cn("relative flex flex-col gap-1", className)}>
      {label && <label className="font-jakarta text-brand text-xs font-semibold">{label}</label>}

      <div
        className={cn(
          "border-borderSubtle flex h-10 items-center gap-2 rounded-lg border bg-white px-3 transition-colors",
          isOpen && "border-primary/50 ring-primary/20 ring-2",
          error && "border-danger",
        )}
      >
        <Search size={14} className="text-brand/40 shrink-0" />
        <input
          type="text"
          value={inputText}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          onBlur={onBlur}
          placeholder={placeholder}
          className="font-jakarta text-brand placeholder:text-brand/40 w-full bg-transparent text-sm focus:outline-none"
        />
        {isLoading && <Loader2 size={14} className="text-brand/40 shrink-0 animate-spin" />}
        {!!inputText && !isLoading && (
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

      {isOpen && (
        <div className="border-borderSubtle absolute top-full right-0 left-0 z-50 mt-1 max-h-56 overflow-y-auto rounded-lg border bg-white shadow-lg">
          {isLoading ? (
            <div className="flex items-center justify-center py-6">
              <Loader2 size={16} className="text-brand/40 animate-spin" />
            </div>
          ) : options.length === 0 ? (
            <p className="font-jakarta text-brand/50 py-6 text-center text-sm">
              {query ? `No staff found for "${query}"` : "No staff found"}
            </p>
          ) : (
            options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleSelect(option)}
                className={cn(
                  "font-jakarta text-brand hover:bg-primary/5 flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm transition-colors",
                  value === option.value && "bg-primary/5",
                )}
              >
                <span className="flex-1 truncate">{option.label}</span>
                {value === option.value && <Check size={14} className="text-primary shrink-0" />}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  )
}
