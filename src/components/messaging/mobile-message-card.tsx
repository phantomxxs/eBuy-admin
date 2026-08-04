import { cn } from "@/lib/utils"
import { StatusBadge } from "@/components/ui/data-table"
import { messageStatusConfig, CHANNEL_COLORS } from "@/components/table-columns/messages"
import type { Message } from "@/types/messages"

const MobileMessageCard = ({ msg, onClick }: { msg: Message; onClick?: () => void }) => {
  const cfg = messageStatusConfig[msg.status]
  return (
    <div
      onClick={onClick}
      className="border-line flex items-start justify-between rounded-lg border bg-white p-4"
    >
      <div className="flex-1 pr-3">
        <p className="font-jakarta text-brand line-clamp-1 text-sm font-semibold">{msg.title}</p>
        <p className="font-jakarta text-brand/50 mt-0.5 text-xs">
          {msg.sentTo} · {msg.sentAt}
        </p>
        <div className="mt-1.5 flex flex-wrap items-center gap-1">
          {msg.channels.map((ch) => (
            <span
              key={ch}
              className={cn(
                "font-jakarta rounded-full px-2 py-0.5 text-xs font-semibold whitespace-nowrap",
                CHANNEL_COLORS[ch] ?? "bg-gray-50 text-gray-600",
              )}
            >
              {ch}
            </span>
          ))}
        </div>
        {msg.delivered > 0 && (
          <p className="font-jakarta text-brand/50 mt-1 text-xs">
            {msg.delivered.toLocaleString()} delivered · {msg.opens.toLocaleString()} opens ·{" "}
            {msg.rate}
          </p>
        )}
      </div>
      <StatusBadge
        label={cfg.label}
        variant={cfg.variant as "success" | "warning" | "neutral" | "default"}
        dot
      />
    </div>
  )
}

export default MobileMessageCard
