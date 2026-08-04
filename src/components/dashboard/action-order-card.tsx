import type { ActionOrder } from "@/types/dashboard"

interface ActionOrderCardProps {
  order: ActionOrder
  onAccept: (order: ActionOrder) => void
  isAccepting: boolean
}

export default function ActionOrderCard({ order, onAccept, isAccepting }: ActionOrderCardProps) {
  return (
    <div className="flex items-center justify-between px-4 py-3.5">
      <div className="flex flex-col gap-0.5">
        <span className="font-jakarta text-primary text-sm font-semibold">{order.id}</span>
        <span className="font-jakarta text-brand/60 text-xs">
          {order.customer} · {order.items}
        </span>
      </div>
      {/* <button
        disabled={isAccepting}
        onClick={() => onAccept(order)}
        className="font-jakarta text-primary text-xs font-semibold hover:underline disabled:opacity-40"
      >
        {isAccepting ? "Accepting…" : "Accept"}
      </button> */}
    </div>
  )
}
