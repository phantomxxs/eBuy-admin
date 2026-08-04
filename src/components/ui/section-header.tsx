import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface SectionHeaderProps {
  label?: string
  heading: ReactNode
  subtitle?: string
  className?: string
}

export default function SectionHeader({
  label,
  heading,
  subtitle,
  className,
}: SectionHeaderProps) {
  return (
    <div className={cn("text-center", className)}>
      {label && (
        <p className="font-jakarta mb-6 text-xs font-semibold tracking-[0.14em] text-foreground/50 uppercase">
          {label}
        </p>
      )}
      <h2
        className="text-4xl leading-[115%] font-normal text-foreground md:text-[56px]"
        style={{ fontVariationSettings: "'opsz' 56" }}
      >
        {heading}
      </h2>
      {subtitle && (
        <p className="font-jakarta mx-auto mt-4 max-w-md text-sm leading-[160%] text-foreground/60">
          {subtitle}
        </p>
      )}
    </div>
  )
}
