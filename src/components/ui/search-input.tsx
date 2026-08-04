import { useState, useEffect, useRef } from "react"
import { Search, X } from "lucide-react"
import { useNavigate, useRouterState } from "@tanstack/react-router"
import { cn } from "@/lib/utils"

interface SearchInputProps {
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
  className?: string
}

const SearchInput = ({ value, onChange, placeholder = "Search…", className }: SearchInputProps) => {
  const navigate = useNavigate()
  const routerState = useRouterState()

  // Seed the input with the current ?q= when on the search page
  const currentQ = (() => {
    const params = new URLSearchParams(routerState.location.search)
    return params.get("q") ?? ""
  })()

  const isControlled = value !== undefined
  const [internalValue, setInternalValue] = useState(currentQ)
  const inputValue = isControlled ? value : internalValue
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Keep input in sync when URL ?q= changes externally
  useEffect(() => {
    if (!isControlled) setInternalValue(currentQ)
  }, [currentQ, isControlled])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = e.target.value
    if (!isControlled) setInternalValue(next)
    onChange?.(next)

    if (debounceRef.current) clearTimeout(debounceRef.current)

    if (next.trim().length >= 3) {
      debounceRef.current = setTimeout(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        navigate({ to: "/search", search: { q: next.trim() } } as any)
      }, 1000)
    }
  }

  const submit = () => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    navigate({ to: "/search", search: { q: inputValue.trim() } } as any)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") submit()
  }

  return (
    <div
      className={cn(
        "border-searchRing flex! w-125 items-center gap-2 rounded-[1000px] border bg-white/20 px-4",
        className,
      )}
    >
      <button type="button" onClick={submit} className="shrink-0">
        <Search className="text-muted-foreground size-4" />
      </button>
      <input
        type="text"
        value={inputValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="text-foreground placeholder:text-muted-foreground placeholder:font-jakarta w-full bg-transparent text-sm focus:outline-none"
      />
      {inputValue && (
        <button
          type="button"
          onClick={() => {
            if (!isControlled) setInternalValue("")
            onChange?.("")
          }}
          className="text-brand/40 hover:text-brand/70 shrink-0 transition-colors"
        >
          <X size={14} />
        </button>
      )}
    </div>
  )
}

export default SearchInput
