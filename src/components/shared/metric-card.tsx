import { TrendingDown, TrendingUp } from "lucide-react"
import { cn } from "@/lib/utils"

interface MetricCardProps {
  label: string
  value: string | number
  /** Optional trend change label, e.g. "+12%" — only shown when provided */
  change?: string
  changeType?: "up" | "down"
}

export default function MetricCard({ label, value, change, changeType }: MetricCardProps) {
  return (
    <div className="border-borderSubtle h-20.5 w-37.5 shrink-0 rounded-xl border bg-white p-4 lg:h-[unset] lg:w-[unset]">
      <p className="font-jakarta text-brand/50 text-xs font-semibold tracking-[-0.04em]">{label}</p>
      <p className="font-jakarta text-brand mt-2 text-sm font-bold tracking-[-0.04em] lg:text-xl">
        {value}
      </p>
      {change && (
        <p
          className={cn(
            "font-jakarta mt-1.5 flex items-center gap-1 text-xs font-semibold",
            changeType === "up" ? "text-emerald-600" : "text-red-500",
          )}
        >
          {changeType === "up" ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
          {change} vs. last month
        </p>
      )}
    </div>
  )
}
