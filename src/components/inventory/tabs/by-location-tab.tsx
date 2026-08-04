import { useState } from "react"
import { MapPin } from "lucide-react"
import DataTable, { type ColumnDef } from "@/components/ui/data-table"
import { WithTooltip } from "@/components/ui/tooltip"
import FloatingPagination from "@/components/ui/floating-pagination"
import { useGetInventoryByLocation } from "@/store/queries/inventory"
import type { InventoryByLocation } from "@/types/inventory"

type Location = InventoryByLocation

export default function ByLocationTab({
  search,
  onView,
}: {
  search: string
  onView: (id: string, name: string) => void
}) {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const { data, isLoading } = useGetInventoryByLocation({ search, pageSize, currentPage: page })
  const items = data?.items ?? []
  const total = data?.total_count ?? 0
  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  const columns = makeColumns(onView)

  return (
    <>
      <div className="hidden lg:block">
        <DataTable
          columns={columns}
          data={items}
          getRowId={(r: Location) => r.id}
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
            entityLabel: "locations",
          }}
        />
      </div>

      <div className="space-y-2 px-4 py-4 lg:hidden">
        {items.map((row) => (
          <MobileByLocationCard
            key={row.id}
            row={row}
            onView={() => onView(row.id, row.storeName)}
          />
        ))}
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

function makeColumns(onView: (id: string, name: string) => void): ColumnDef<Location>[] {
  return [
    {
      accessorKey: "storeName",
      header: "Store name",
      cell: ({ row }) => (
        <div className="whitespace-nowrap">
          <WithTooltip
            trigger={
              <p className="font-jakarta text-brand inline-block max-w-48 truncate text-sm font-medium whitespace-nowrap">
                {row.original.storeName}
              </p>
            }
            content={row.original.storeName}
          />
          <p className="font-jakarta text-brand/40 text-xs whitespace-nowrap">
            {row.original.storeId}
          </p>
        </div>
      ),
    },
    {
      accessorKey: "products",
      header: "Products",
      cell: ({ row }) => (
        <span className="font-jakarta text-brand/60 text-sm whitespace-nowrap">
          {row.original.products}
        </span>
      ),
    },
    {
      accessorKey: "totalUnits",
      header: "Total units",
      cell: ({ row }) => (
        <span className="font-jakarta text-brand/60 text-sm whitespace-nowrap">
          {row.original.totalUnits.toLocaleString()}
        </span>
      ),
    },
    {
      accessorKey: "lowStock",
      header: "Low stock",
      cell: ({ row }) => (
        <span className="font-jakarta text-brand/60 text-sm whitespace-nowrap">
          {row.original.lowStock}
        </span>
      ),
    },
    {
      id: "action",
      header: "",
      cell: ({ row }) => (
        <button
          onClick={() => onView(row.original.id, row.original.storeName)}
          className="font-jakarta text-primary text-sm font-medium hover:underline"
        >
          View
        </button>
      ),
    },
  ]
}

// ── Mobile card ─────────────────────────────────────────────────────────────────

const MobileByLocationCard = ({ row, onView }: { row: Location; onView: () => void }) => (
  <div className="border-line rounded-lg border bg-white p-4">
    <div className="flex items-start justify-between">
      <div className="flex items-center gap-2">
        <div className="bg-primary/10 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg">
          <MapPin size={14} className="text-primary" />
        </div>
        <div>
          <p className="font-jakarta text-brand text-sm font-semibold">{row.storeName}</p>
          <p className="font-jakarta text-brand/50 text-xs">{row.storeId}</p>
        </div>
      </div>
      <button
        onClick={onView}
        className="font-jakarta text-primary text-xs font-semibold hover:underline"
      >
        View
      </button>
    </div>
    <div className="mt-3 grid grid-cols-3 gap-2">
      {[
        { label: "Products", value: row.products },
        { label: "Total units", value: row.totalUnits.toLocaleString() },
        { label: "Low stock", value: row.lowStock },
      ].map(({ label, value }) => (
        <div key={label}>
          <p className="font-jakarta text-brand/40 text-xs">{label}</p>
          <p className="font-jakarta text-brand text-sm font-semibold">{value}</p>
        </div>
      ))}
    </div>
  </div>
)
