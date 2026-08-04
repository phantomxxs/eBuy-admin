import { useState, useRef, useEffect } from "react"
import { Search, X, Check, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { useCategorySearch } from "@/store/queries/categories"

interface CategoryOption {
  value: string
  label: string
}

interface BaseProps {
  label?: string
  onBlur?: () => void
  placeholder?: string
  error?: string
  className?: string
  required?: boolean
}

interface SingleProps extends BaseProps {
  multiple?: false
  value: string
  displayValue?: string
  onChange: (value: string) => void
}

interface MultiProps extends BaseProps {
  multiple: true
  value: string[]
  onChange: (value: string[]) => void
  showAllOption?: boolean
}

export type CategorySearchInputProps = SingleProps | MultiProps

export default function CategorySearchInput(props: CategorySearchInputProps) {
  if (props.multiple) return <MultiCategorySearch {...props} />
  return <SingleCategorySearch {...props} />
}

// ── Single select ────────────────────────────────────────────────────────────

function SingleCategorySearch({
  label,
  value,
  displayValue,
  onChange,
  onBlur,
  placeholder = "Search categories…",
  error,
  className,
  required,
}: SingleProps) {
  const [query, setQuery] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const [internalLabel, setInternalLabel] = useState(displayValue ?? "")
  const containerRef = useRef<HTMLDivElement>(null)

  const { data: options = [], isLoading } = useCategorySearch(query)
  const { data: resolverOptions = [] } = useCategorySearch("")

  useEffect(() => {
    if (value && displayValue) setInternalLabel(displayValue)
  }, [value, displayValue])

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

  const handleSelect = (option: CategoryOption) => {
    onChange(option.value)
    setInternalLabel(option.label)
    setQuery("")
    setIsOpen(false)
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
      {label && (
        <label className="font-jakarta text-brand text-xs font-semibold">
          {label}
          {required && <span className="text-destructive ml-0.5">*</span>}
        </label>
      )}

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

      <ResultsList
        isOpen={isOpen}
        isLoading={isLoading}
        options={options}
        query={query}
        renderOption={(option) => (
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
        )}
      />
    </div>
  )
}

// ── Multi select ─────────────────────────────────────────────────────────────

const ALL_CATEGORIES_OPTION: CategoryOption = { value: "0", label: "All categories" }

function MultiCategorySearch({
  label,
  value,
  onChange,
  onBlur,
  placeholder = "Search categories…",
  error,
  className,
  required,
  showAllOption,
}: MultiProps) {
  const [query, setQuery] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const [selectedLabels, setSelectedLabels] = useState<Record<string, string>>({})
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const { data: rawOptions = [], isLoading } = useCategorySearch(query)
  const options = showAllOption && !query ? [ALL_CATEGORIES_OPTION, ...rawOptions] : rawOptions
  const { data: resolverOptions = [] } = useCategorySearch("")

  const allSelected = value.includes("0")

  useEffect(() => {
    if (!resolverOptions.length) return
    const toResolve = value.filter((id) => !selectedLabels[id])
    if (!toResolve.length) return
    const resolved: Record<string, string> = {}
    toResolve.forEach((id) => {
      if (id === "0") {
        resolved[id] = ALL_CATEGORIES_OPTION.label
        return
      }
      const opt = resolverOptions.find((o) => String(o.value) === String(id))
      resolved[id] = opt ? opt.label : id
    })
    setSelectedLabels((prev) => ({ ...prev, ...resolved }))
  }, [resolverOptions, value])

  useEffect(() => {
    if (!value.length) setSelectedLabels({})
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

  const toggle = (option: CategoryOption) => {
    if (option.value === "0") {
      if (allSelected) {
        onChange([])
        setSelectedLabels({})
      } else {
        onChange(["0"])
        setSelectedLabels({ "0": ALL_CATEGORIES_OPTION.label })
      }
      return
    }
    if (allSelected) {
      // Switch away from "All" to this specific option
      onChange([option.value])
      setSelectedLabels({ [option.value]: option.label })
      return
    }
    if (value.includes(option.value)) {
      onChange(value.filter((v) => v !== option.value))
      setSelectedLabels((prev) => {
        const next = { ...prev }
        delete next[option.value]
        return next
      })
    } else {
      onChange([...value, option.value])
      setSelectedLabels((prev) => ({ ...prev, [option.value]: option.label }))
    }
  }

  const removeOne = (id: string) => {
    onChange(value.filter((v) => v !== id))
    setSelectedLabels((prev) => {
      const next = { ...prev }
      delete next[id]
      return next
    })
  }

  const isResolving = value.some((id) => !selectedLabels[id])

  return (
    <div ref={containerRef} className={cn("relative flex flex-col gap-1", className)}>
      {label && (
        <label className="font-jakarta text-brand text-xs font-semibold">
          {label}
          {required && <span className="text-destructive ml-0.5">*</span>}
        </label>
      )}

      <div
        onClick={() => inputRef.current?.focus()}
        className={cn(
          "border-borderSubtle flex max-h-30 min-h-10 cursor-text items-center gap-2 rounded-lg border bg-white px-3 transition-colors",
          isOpen && "border-primary/50 ring-primary/20 ring-2",
          error && "border-danger",
        )}
      >
        <Search size={14} className="text-brand/40 shrink-0" />

        <div className="no-scrollbar flex max-h-26 min-w-0 flex-1 flex-wrap items-center gap-1.5 overflow-auto py-3">
          {value.map((id) => (
            <span
              key={id}
              className="bg-primary/8 text-primary font-jakarta flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium"
            >
              {!selectedLabels[id] ? (
                <Loader2 size={10} className="animate-spin" />
              ) : (
                <span className="max-w-24 truncate">{selectedLabels[id]}</span>
              )}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  removeOne(id)
                }}
                className="hover:text-primary/70 shrink-0 transition-colors"
              >
                <X size={10} />
              </button>
            </span>
          ))}

          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setIsOpen(true)
            }}
            onFocus={() => setIsOpen(true)}
            onBlur={onBlur}
            placeholder={value.length ? "" : placeholder}
            className="font-jakarta text-brand placeholder:text-brand/40 shrink-0 bg-transparent text-sm focus:outline-none"
          />
        </div>

        {(isLoading || isResolving) && (
          <Loader2 size={14} className="text-brand/40 shrink-0 animate-spin" />
        )}
        {value.length > 0 && !isLoading && !isResolving && (
          <button
            type="button"
            onClick={() => {
              onChange([])
              setSelectedLabels({})
            }}
            className="text-brand/40 hover:text-brand/70 shrink-0 transition-colors"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {error && <p className="font-jakarta text-danger text-xs">{error}</p>}

      <ResultsList
        isOpen={isOpen}
        isLoading={isLoading}
        options={options}
        query={query}
        renderOption={(option) => {
          const selected = value.includes(option.value)
          const disabled = allSelected && option.value !== "0"
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => !disabled && toggle(option)}
              disabled={disabled}
              className={cn(
                "font-jakarta text-brand hover:bg-primary/5 flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm transition-colors",
                selected && "bg-primary/5",
                disabled && "cursor-not-allowed opacity-40",
              )}
            >
              <div
                className={cn(
                  "flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border transition-colors",
                  selected ? "border-primary bg-primary text-white" : "border-input",
                )}
              >
                {selected && <Check size={10} />}
              </div>
              <span className="flex-1 truncate">{option.label}</span>
            </button>
          )
        }}
      />
    </div>
  )
}

// ── Shared results list ──────────────────────────────────────────────────────

interface ResultsListProps {
  isOpen: boolean
  isLoading: boolean
  options: CategoryOption[]
  query: string
  renderOption: (option: CategoryOption) => React.ReactNode
}

function ResultsList({ isOpen, isLoading, options, query, renderOption }: ResultsListProps) {
  if (!isOpen) return null

  return (
    <div className="border-borderSubtle absolute top-full right-0 left-0 z-50 mt-1 max-h-56 overflow-y-auto rounded-lg border bg-white shadow-lg">
      {isLoading ? (
        <div className="flex items-center justify-center py-6">
          <Loader2 size={16} className="text-brand/40 animate-spin" />
        </div>
      ) : options.length === 0 ? (
        <p className="font-jakarta text-brand/50 py-6 text-center text-sm">
          {query ? `No categories found for "${query}"` : "No categories found"}
        </p>
      ) : (
        options.map(renderOption)
      )}
    </div>
  )
}
