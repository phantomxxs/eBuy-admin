import { MapPin } from "lucide-react"
import { StatusBadge } from "@/components/ui/data-table"
import type { LowStockItem, StockLevel } from "@/types/dashboard"

const STOCK_CONFIG: Record<StockLevel, { label: string; variant: "warning" | "error" }> = {
  low: { label: "Low", variant: "warning" },
  critical: { label: "Critical", variant: "error" },
}

export default function LowStockCard({ item }: { item: LowStockItem }) {
  const cfg = STOCK_CONFIG[item.stockStatus]
  return (
    <div className="px-4 py-3.5">
      <div className="flex items-start justify-between gap-3">
        <span className="font-jakarta text-brand text-sm leading-snug font-medium">
          {item.product}
        </span>
        <StatusBadge label={String(item.stock)} variant={cfg.variant} />
      </div>
      <div className="mt-2 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="font-jakarta text-brand/50 text-xs">{item.sku}</span>
          <span className="font-jakarta text-brand/50 flex items-center gap-0.5 text-xs">
            <MapPin size={10} className="shrink-0" />
            {item.location}
          </span>
        </div>
        <button className="font-jakarta text-primary text-xs font-semibold hover:underline">
          Restock
        </button>
      </div>
    </div>
  )
}
