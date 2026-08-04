import { useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

const Pagination = ({
  page,
  totalPages,
  onPage,
  className,
}: {
  page: number
  totalPages: number
  onPage: (p: number) => void
  className?: string
}) => {
  // null = neither ellipsis is active; "left" | "right" = that one is in input mode
  const [jumpSide, setJumpSide] = useState<"left" | "right" | null>(null)
  const [jumpValue, setJumpValue] = useState("")

  if (totalPages <= 1) return null

  const slots: (number | "…")[] = []
  const add = (n: number | "…") => {
    const last = slots[slots.length - 1]
    if (n === "…" && last === "…") return
    slots.push(n)
  }

  add(1)
  if (page - 2 > 1) add("…")
  for (let p = Math.max(2, page - 1); p <= Math.min(totalPages - 1, page + 1); p++) add(p)
  if (page + 2 < totalPages) add("…")
  if (totalPages > 1) add(totalPages)

  // Determine which ellipsis index is "left" vs "right"
  const ellipsisIndices = slots.reduce<number[]>((acc, s, i) => (s === "…" ? [...acc, i] : acc), [])
  const leftEllipsisIdx = ellipsisIndices[0] ?? -1

  const commitJump = () => {
    const n = parseInt(jumpValue, 10)
    if (!isNaN(n) && n >= 1 && n <= totalPages) onPage(n)
    setJumpSide(null)
    setJumpValue("")
  }

  const btnBase =
    "font-jakarta h-9 min-w-9 rounded-full border px-2 text-sm font-medium transition-colors"
  const inactive = "border-blush text-brand/60 hover:border-primary hover:text-primary"
  const active = "border-primary bg-primary text-white pointer-events-none"
  const nav =
    "flex h-9 w-9 items-center justify-center rounded-full border border-blush text-brand/60 transition-colors hover:border-primary hover:text-primary disabled:pointer-events-none disabled:opacity-30"

  return (
    <div className={cn("flex items-center justify-center gap-1.5", className)}>
      <button
        onClick={() => onPage(page - 1)}
        disabled={page === 1}
        className={nav}
        aria-label="Previous page"
      >
        <ChevronLeft size={16} />
      </button>

      {slots.map((s, i) => {
        if (s !== "…") {
          return (
            <button
              key={s}
              onClick={() => onPage(s)}
              className={cn(btnBase, s === page ? active : inactive)}
            >
              {s}
            </button>
          )
        }

        const side = i === leftEllipsisIdx ? "left" : "right"
        const isEditing = jumpSide === side

        if (isEditing) {
          return (
            <input
              key={`jump-${side}`}
              autoFocus
              type="number"
              min={1}
              max={totalPages}
              value={jumpValue}
              onChange={(e) => setJumpValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") commitJump()
                if (e.key === "Escape") {
                  setJumpSide(null)
                  setJumpValue("")
                }
              }}
              onBlur={commitJump}
              className="font-jakarta border-primary text-brand ring-primary/20 h-9 w-14 [appearance:textfield] rounded-full border px-2 text-center text-sm font-medium focus:ring-2 focus:outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            />
          )
        }

        return (
          <button
            key={`e${i}`}
            onClick={() => {
              setJumpSide(side)
              setJumpValue("")
            }}
            className="font-jakarta text-brand/40 hover:text-primary h-9 w-6 text-center text-sm transition-colors select-none"
            aria-label="Jump to page"
          >
            …
          </button>
        )
      })}

      <button
        onClick={() => onPage(page + 1)}
        disabled={page === totalPages}
        className={nav}
        aria-label="Next page"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  )
}

export default Pagination
