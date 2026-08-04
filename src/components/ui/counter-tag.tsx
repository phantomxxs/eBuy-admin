import { cn } from "@/lib/utils"

interface CounterTagProps {
  count: number
  size?: "sm" | "md"
  className?: string
}

export default function CounterTag({ count, size = "md", className }: CounterTagProps) {
  return (
    <span
      className={cn(
        "bg-primary/10 text-primary font-jakarta inline-flex items-center justify-center rounded-full font-bold",
        size === "md" && "h-7 min-w-7 px-1.5 text-xs",
        size === "sm" && "h-4 min-w-4 px-0.5 text-xxs",
        className,
      )}
    >
      {count}
    </span>
  )
}
