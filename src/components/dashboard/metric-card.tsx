import {
  ShoppingCart,
  TrendingUp,
  Users,
  CreditCard,
  Clock,
  Package,
  TrendingDown,
} from "lucide-react"
import { cn, formatCurrency } from "@/lib/utils"
import type { DashboardMetricItem } from "@/types/dashboard"

interface MetricCardProps {
  label: string
  value: string | number
  change?: string
  changeType?: "up" | "down"
  index?: number
  currency: boolean
}

const METRIC_ICON_CONFIG = [
  { icon: ShoppingCart, bg: "bg-primary/10", color: "text-primary" },
  { icon: TrendingUp, bg: "bg-emerald-100", color: "text-emerald-600" },
  { icon: Users, bg: "bg-blue-100", color: "text-blue-600" },
  { icon: CreditCard, bg: "bg-purple-100", color: "text-purple-600" },
  { icon: Clock, bg: "bg-orange-100", color: "text-orange-500" },
  { icon: Package, bg: "bg-red-100", color: "text-red-500" },
]

export const MobileDashboardMetricCard = ({
  metric,
  index,
  currency = false,
}: {
  metric: DashboardMetricItem
  index: number
  currency?: boolean
}) => {
  const cfg = METRIC_ICON_CONFIG[index % METRIC_ICON_CONFIG.length]
  const Icon = cfg.icon
  return (
    <div className="border-borderSubtle w-40 shrink-0 rounded-xl border bg-white p-4">
      <div className={cn("mb-2.5 flex h-8 w-8 items-center justify-center rounded-lg", cfg.bg)}>
        <Icon size={16} className={cfg.color} />
      </div>
      <p className="font-jakarta text-brand/50 text-xs font-medium tracking-[-0.04em]">
        {metric.label}
      </p>
      <p className="font-jakarta text-brand mt-1 text-lg font-bold tracking-[-0.04em]">
        {currency ? formatCurrency(metric.value) : metric.value}
      </p>
      {metric.change && (
        <p
          className={cn(
            "font-jakarta mt-1 flex items-center gap-1 text-xs font-semibold",
            metric.changeType === "up" ? "text-emerald-600" : "text-red-500",
          )}
        >
          {metric.changeType === "up" ? "↑" : "↓"} {metric.change} vs. last month
        </p>
      )}
    </div>
  )
}

export const MetricCard = ({
  label,
  value,
  change,
  changeType,
  index,
  currency = false,
}: MetricCardProps) => {
  const cfg = index !== undefined ? METRIC_ICON_CONFIG[index % METRIC_ICON_CONFIG.length] : null
  const Icon = cfg?.icon
  return (
    <div className="border-borderSubtle shrink-0 rounded-xl border bg-white p-4">
      {Icon && (
        <div className={cn("mb-2.5 flex h-8 w-8 items-center justify-center rounded-lg", cfg!.bg)}>
          <Icon size={16} className={cfg!.color} />
        </div>
      )}
      <p className="font-jakarta text-brand/50 text-xs font-semibold tracking-[-0.04em]">{label}</p>
      <p className="font-jakarta text-brand mt-2 text-xl font-bold tracking-[-0.04em]">
        {currency ? formatCurrency(value) : value}
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
