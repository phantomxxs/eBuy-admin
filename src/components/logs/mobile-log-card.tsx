import { cn } from "@/lib/utils"
import { MODULE_COLORS } from "@/components/table-columns/activity-logs"
import type { ActivityLog } from "@/types/activity-logs"

const MobileLogCard = ({ log }: { log: ActivityLog }) => {
  const moduleClass = MODULE_COLORS[log.module] ?? "bg-gray-50 text-gray-600"
  return (
    <div className="border-line rounded-lg border bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="bg-primary/15 font-jakarta text-primary flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold">
            {log.byInitials}
          </div>
          <div>
            <p className="font-jakarta text-brand text-sm">{log.activity}</p>
            <p className="font-jakarta text-brand/50 mt-0.5 text-xs">by {log.by}</p>
            <p className="font-jakarta text-brand/40 mt-0.5 text-xs">{log.date}</p>
          </div>
        </div>
        <span
          className={cn(
            "font-jakarta shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold whitespace-nowrap",
            moduleClass,
          )}
        >
          {log.module}
        </span>
      </div>
    </div>
  )
}

export default MobileLogCard
