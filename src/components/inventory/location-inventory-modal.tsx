import { X } from "lucide-react"
import Modal from "@/components/ui/modal"
import { cn } from "@/lib/utils"
import { useGetInventoryLocationDetail } from "@/store/queries/inventory"
import { formatDateToCustomFormat } from "@/lib/utils"
import type { InventoryByProduct, InventoryActivityLog } from "@/types/inventory"

interface LocationInventoryModalProps {
  isOpen: boolean
  onClose: () => void
  locationId: string | null
  locationName?: string
}

export default function LocationInventoryModal({
  isOpen,
  onClose,
  locationId,
  locationName,
}: LocationInventoryModalProps) {
  const { data: detail, isLoading } = useGetInventoryLocationDetail(locationId)

  const displayName = detail?.storeName ?? locationName ?? "Location"
  const totalProducts = detail?.totalProducts ?? 0
  const totalUnits = detail?.totalUnits ?? 0
  const lowStockCount = detail?.lowStockCount ?? 0
  const stockItems: InventoryByProduct[] = detail?.items ?? []
  const recentActivity: InventoryActivityLog[] = detail?.recentActivity ?? []

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      variant="drawer"
      position="right"
      hideFooter
      customHeader={
        <div className="border-borderSubtle flex items-start justify-between border-b px-5 py-4">
          <div>
            <h2 className="font-jakarta text-brand text-sm font-semibold">
              {displayName} Inventory
            </h2>
            <p className="font-jakarta text-brand/50 mt-0.5 text-xs">
              Per product stock at this location
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-brand/40 hover:text-brand ml-3 shrink-0 rounded p-1"
          >
            <X size={15} />
          </button>
        </div>
      }
      width="652px"
    >
      {isLoading ? (
        <div className="flex flex-col gap-4 px-5 py-4">
          <div className="grid grid-cols-3 gap-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="border-borderSubtle h-16 animate-pulse rounded-lg border bg-gray-50"
              />
            ))}
          </div>
          <div className="space-y-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-10 animate-pulse rounded bg-gray-50" />
            ))}
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-0">
          {/* Mini metric cards */}
          <div className="grid grid-cols-3 gap-2 px-5 py-4">
            {[
              { label: "Total products", value: totalProducts.toLocaleString() },
              { label: "Total units", value: totalUnits.toLocaleString() },
              { label: "Low stock", value: lowStockCount.toLocaleString() },
            ].map(({ label, value }) => (
              <div key={label} className="border-borderSubtle rounded-lg border p-3">
                <p className="font-jakarta text-brand/50 text-xxs leading-tight">{label}</p>
                <p className="font-jakarta text-brand mt-1 text-base font-semibold">{value}</p>
              </div>
            ))}
          </div>

          <div className="px-5 pb-6">
            {/* Stock by product */}
            <SectionHeader label="Stock by product" count={stockItems.length} />

            <table className="w-full">
              <thead>
                <tr className="border-borderSubtle border-b">
                  <Th>Product</Th>
                  <Th className="whitespace-nowrap">Stock / Status</Th>
                  <Th className="text-right" />
                </tr>
              </thead>
              <tbody>
                {stockItems.map((item) => (
                  <tr key={item.id} className="border-borderSubtle border-b">
                    <td className="py-2.5 pr-2">
                      <p className="font-jakarta text-brand line-clamp-1 max-w-[90%] text-xs font-medium">
                        {item.product}
                      </p>
                      <p className="font-jakarta text-brand/40 text-xxs">{item.sku}</p>
                    </td>
                    <td className="py-2.5 pr-2">
                      <p className="font-jakarta text-brand mb-1 text-xs">{item.qty} units</p>
                      {item.status === "low_stock" ? (
                        <LowStockPill />
                      ) : item.status === "out_of_stock" ? (
                        <OutOfStockPill />
                      ) : (
                        <AvailablePill />
                      )}
                    </td>
                    <td className="py-2.5 text-right">
                      <button className="font-jakarta text-primary text-xs font-medium whitespace-nowrap">
                        {item.status === "available" ? "Adjust" : "Restock"}
                      </button>
                    </td>
                  </tr>
                ))}
                {stockItems.length === 0 && (
                  <tr>
                    <td colSpan={3} className="font-jakarta text-brand/40 py-6 text-center text-xs">
                      No products found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Recent stock activity */}
            <SectionHeader
              label="Recent stock activity"
              count={recentActivity.length}
              className="mt-6"
            />

            <table className="w-full">
              <thead>
                <tr className="border-borderSubtle border-b">
                  <Th>Product</Th>
                  <Th>Activity</Th>
                  <Th className="text-right">Date</Th>
                </tr>
              </thead>
              <tbody>
                {recentActivity.map((item) => (
                  <tr key={item.id} className="border-borderSubtle border-b">
                    <td className="py-2.5 pr-2">
                      <p className="font-jakarta text-brand line-clamp-1 text-xs font-medium">
                        {item.product}
                      </p>
                      <p className="font-jakarta text-brand/40 text-xxs">{item.sku}</p>
                    </td>
                    <td className="py-2.5 pr-2">
                      <p className="font-jakarta text-brand line-clamp-2 text-xs">
                        {item.activity}
                      </p>
                      <p className="font-jakarta text-brand/40 text-xxs">{item.by}</p>
                    </td>
                    <td className="py-2.5 text-right">
                      <p className="font-jakarta text-brand/60 text-xxs">
                        {formatDateToCustomFormat(item.date, true)}
                      </p>
                    </td>
                  </tr>
                ))}
                {recentActivity.length === 0 && (
                  <tr>
                    <td colSpan={3} className="font-jakarta text-brand/40 py-6 text-center text-xs">
                      No recent activity
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </Modal>
  )
}

// ── Sub-components ──────────────────────────────────────────────────────────────

const Th = ({ children, className }: { children?: React.ReactNode; className?: string }) => (
  <th
    className={cn(
      "font-jakarta text-xxs text-brand/40 py-2 text-left font-semibold tracking-wide uppercase",
      className,
    )}
  >
    {children}
  </th>
)

const SectionHeader = ({
  label,
  count,
  className,
}: {
  label: string
  count?: number
  className?: string
}) => (
  <div className={cn("mb-2 flex items-center justify-between", className)}>
    <p className="font-jakarta text-xxs text-brand/35 font-semibold tracking-widest uppercase">
      {label}
    </p>
    {count !== undefined && (
      <span className="font-jakarta text-brand/40 text-xxs">{count} items</span>
    )}
  </div>
)

const AvailablePill = () => (
  <span className="font-jakarta bg-statusSuccessBg text-xxs text-statusSuccess inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-semibold">
    <span className="bg-statusSuccess h-1.5 w-1.5 rounded-full" />
    Available
  </span>
)

const LowStockPill = () => (
  <span className="font-jakarta bg-danger/8 text-xxs text-danger inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-semibold">
    <span className="bg-danger h-1.5 w-1.5 rounded-full" />
    Low stock
  </span>
)

const OutOfStockPill = () => (
  <span className="font-jakarta bg-hint/10 text-xxs text-hint inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-semibold">
    <span className="bg-hint h-1.5 w-1.5 rounded-full" />
    Out of stock
  </span>
)
