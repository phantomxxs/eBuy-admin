import { Minus, Plus } from "lucide-react"

interface CartQtyControlProps {
  qty: number
  onDecrement: () => void
  onIncrement: () => void
}

export default function CartQtyControl({ qty, onDecrement, onIncrement }: CartQtyControlProps) {
  return (
    <div className="border-blush/20 flex items-center gap-0.5 rounded border p-0.5">
      <button
        type="button"
        onClick={onDecrement}
        className="bg-blush/40 text-brand flex h-4 w-4 items-center justify-center rounded"
      >
        <Minus size={8} />
      </button>
      <span className="font-jakarta text-brand w-6 text-center text-xs font-semibold">{qty}</span>
      <button
        type="button"
        onClick={onIncrement}
        className="bg-blush/40 text-brand flex h-4 w-4 items-center justify-center rounded"
      >
        <Plus size={8} />
      </button>
    </div>
  )
}
