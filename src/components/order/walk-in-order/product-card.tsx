import { Minus, Plus, ShoppingBag } from "lucide-react"
import { cn, formatCurrency } from "@/lib/utils"
import { WithTooltip } from "@/components/ui/tooltip"
import type { Product } from "@/types/products"
import type { WalkInCartItem } from "@/types/orders"

interface ProductCardProps {
  product: Product
  cartItem: WalkInCartItem | undefined
  onAdd: () => void
  onDecrement: () => void
  onIncrement: () => void
}

export default function ProductCard({
  product,
  cartItem,
  onAdd,
  onDecrement,
  onIncrement,
}: ProductCardProps) {
  return (
    <div
      className={cn(
        "flex h-[165px] w-full shrink-0 flex-col overflow-hidden rounded-[6px] border transition-colors",
        cartItem ? "border-secondary" : "border-blush/50",
      )}
    >
      {/* Image */}
      <div className="bg-brand/[0.02] relative h-[75px] shrink-0 overflow-hidden">
        {product.imageUrl ? (
          <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" />
        ) : (
          <div className="bg-blush/20 h-full w-full" />
        )}
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col justify-between p-2">
        <div className="min-w-0 space-y-0.5">
          <WithTooltip
            trigger={
              <p className="text-brand/60 block truncate font-sans text-[8px] font-semibold tracking-wider uppercase">
                {product.brandName ?? "—"}
              </p>
            }
            content={product.brandName ?? "No brand"}
          />
          <WithTooltip
            trigger={
              <p className="font-jakarta text-brand text-xxs block truncate leading-tight font-semibold">
                {product.name}
              </p>
            }
            content={product.name}
          />
          {(() => {
            const discountAmt = typeof product.discount === "number" ? product.discount : 0
            const effectivePrice = Math.max(0, product.price - discountAmt)
            const discountPct =
              discountAmt > 0 ? Math.round((discountAmt / product.price) * 100) : null
            return (
              <>
                <WithTooltip
                  trigger={
                    <p className="text-secondary text-xxs block truncate font-bold tracking-tight">
                      {formatCurrency(effectivePrice)}
                    </p>
                  }
                  content={formatCurrency(effectivePrice)}
                />
                {discountAmt > 0 && (
                  <div className="flex items-center gap-1">
                    <p className="text-brand/40 text-xxs line-through">
                      {formatCurrency(product.price)}
                    </p>
                    {discountPct !== null && discountPct >= 1 && (
                      <span className="bg-statusSuccessBg text-statusSuccess text-xxs rounded-full px-1 font-bold">
                        -{discountPct}%
                      </span>
                    )}
                  </div>
                )}
              </>
            )
          })()}
        </div>

        {cartItem ? (
          <div className="border-blush/20 flex items-center justify-between rounded border px-1 py-0.5">
            <button
              type="button"
              onClick={onDecrement}
              className="bg-blush/40 text-brand flex h-5 w-5 items-center justify-center rounded"
            >
              <Minus size={10} />
            </button>
            <span className="font-jakarta text-brand w-7 text-center text-xs font-semibold">
              {cartItem.qty}
            </span>
            <button
              type="button"
              onClick={onIncrement}
              className="bg-blush/40 text-brand flex h-5 w-5 items-center justify-center rounded"
            >
              <Plus size={10} />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={onAdd}
            className="bg-secondary flex w-full items-center justify-center gap-1 rounded-full py-1.5 text-white"
          >
            <ShoppingBag size={9} />
            <span className="font-jakarta text-xxs font-semibold">Add to cart</span>
          </button>
        )}
      </div>
    </div>
  )
}
