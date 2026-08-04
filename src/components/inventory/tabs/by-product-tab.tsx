import { useState } from "react"
import DataTable, { type ColumnDef, StatusBadge } from "@/components/ui/data-table"
import { WithTooltip } from "@/components/ui/tooltip"
import FloatingPagination from "@/components/ui/floating-pagination"
import { useGetInventoryByProduct } from "@/store/queries/inventory"
import type { InventoryByProduct } from "@/types/inventory"

type Item = InventoryByProduct

export default function ByProductTab({
  search,
  status,
  onRestock,
  onAdjust,
}: {
  search: string
  status?: string
  onRestock: (item: Item) => void
  onAdjust: (item: Item) => void
}) {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const { data, isLoading } = useGetInventoryByProduct({
    search,
    status,
    pageSize,
    currentPage: page,
  })
  const items = data?.items ?? []
  const total = data?.total_count ?? 0
  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  const columns = makeColumns(onRestock, onAdjust)

  return (
    <>
      <div className="hidden lg:block">
        <DataTable
          columns={columns}
          data={items}
          getRowId={(r: Item) => r.id}
          isLoading={isLoading}
          pagination={{
            page,
            pageSize,
            total,
            onPageChange: setPage,
            onPageSizeChange: (s) => {
              setPageSize(s)
              setPage(1)
            },
            entityLabel: "products",
          }}
        />
      </div>

      <div className="space-y-2 px-4 py-4 lg:hidden">
        {items.map((item) => {
          const needsRestock = item.status === "low_stock" || item.status === "out_of_stock"
          return (
            <MobileByProductCard
              key={item.id}
              item={item}
              onAction={() => (needsRestock ? onRestock(item) : onAdjust(item))}
              actionLabel={needsRestock ? "Restock" : "Adjust"}
            />
          )
        })}
      </div>

      <div className="lg:hidden">
        <FloatingPagination
          page={page}
          totalPages={totalPages}
          onPrev={() => setPage((p) => Math.max(1, p - 1))}
          onNext={() => setPage((p) => Math.min(totalPages, p + 1))}
          pageSize={pageSize}
          onPageSizeChange={(s) => {
            setPageSize(s)
            setPage(1)
          }}
        />
      </div>
    </>
  )
}

// ── Column definitions ──────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<string, { label: string; variant: "success" | "warning" | "neutral" }> =
  {
    available: { label: "Available", variant: "success" },
    low_stock: { label: "Low stock", variant: "warning" },
    out_of_stock: { label: "Out of stock", variant: "neutral" },
  }

function makeColumns(
  onRestock: (item: Item) => void,
  onAdjust: (item: Item) => void,
): ColumnDef<Item>[] {
  return [
    {
      accessorKey: "product",
      header: "Product",
      cell: ({ row }) => (
        <div className="whitespace-nowrap">
          <WithTooltip
            trigger={
              <p className="font-jakarta text-brand inline-block max-w-48 truncate text-sm font-medium whitespace-nowrap">
                {row.original.product}
              </p>
            }
            content={row.original.product}
          />
          <p className="font-jakarta text-brand/40 text-xs whitespace-nowrap">{row.original.sku}</p>
        </div>
      ),
    },
    {
      accessorKey: "category",
      header: "Category",
      cell: ({ row }) => (
        <WithTooltip
          trigger={
            <span className="font-jakarta text-brand/60 inline-block max-w-36 truncate text-sm whitespace-nowrap">
              {row.original.category}
            </span>
          }
          content={row.original.category}
        />
      ),
    },
    {
      accessorKey: "price",
      header: "Price",
      cell: ({ row }) => (
        <span className="font-jakarta text-brand/60 text-sm font-semibold whitespace-nowrap">
          ₦{row.original.price.toLocaleString()}
        </span>
      ),
    },
    {
      accessorKey: "qty",
      header: "Stock",
      cell: ({ row }) => (
        <span className="font-jakarta text-brand/60 text-sm whitespace-nowrap">
          {row.original.qty}
        </span>
      ),
    },
    {
      accessorKey: "lowStockAlert",
      header: "Low stock alert",
      cell: ({ row }) => (
        <span className="font-jakarta text-brand/60 text-sm whitespace-nowrap">
          {row.original.lowStockAlert}
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const cfg = STATUS_CONFIG[row.original.status]
        return <StatusBadge label={cfg.label} variant={cfg.variant} dot />
      },
    },
    {
      id: "action",
      header: "",
      cell: ({ row }) => {
        const needsRestock =
          row.original.status === "low_stock" || row.original.status === "out_of_stock"
        return (
          <button
            onClick={() => (needsRestock ? onRestock(row.original) : onAdjust(row.original))}
            className="font-jakarta text-primary text-sm font-medium hover:underline"
          >
            {needsRestock ? "Restock" : "Adjust"}
          </button>
        )
      },
    },
  ]
}

// ── Mobile card ─────────────────────────────────────────────────────────────────

const MobileByProductCard = ({
  item,
  onAction,
  actionLabel,
}: {
  item: Item
  onAction: () => void
  actionLabel: string
}) => {
  const cfg = STATUS_CONFIG[item.status]
  return (
    <div className="border-line flex items-center justify-between rounded-lg border bg-white p-4">
      <div className="flex-1 pr-3">
        <p className="font-jakarta text-brand line-clamp-1 text-sm font-semibold">{item.product}</p>
        <p className="font-jakarta text-brand/50 mt-0.5 text-xs">
          {item.sku} · {item.category}
        </p>
        <p className="font-jakarta text-brand mt-1 text-sm font-semibold">
          ₦{item.price.toLocaleString()}
        </p>
      </div>
      <div className="flex flex-col items-end gap-2">
        <StatusBadge label={cfg.label} variant={cfg.variant} dot />
        <button
          onClick={onAction}
          className="font-jakarta text-primary text-xs font-semibold hover:underline"
        >
          {actionLabel}
        </button>
      </div>
    </div>
  )
}
