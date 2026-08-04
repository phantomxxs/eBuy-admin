import { useState } from "react"
import { ArrowRight } from "lucide-react"
import DataTable, { type ColumnDef, StatusBadge } from "@/components/ui/data-table"
import { WithTooltip } from "@/components/ui/tooltip"
import FloatingPagination from "@/components/ui/floating-pagination"
import { useGetInventoryTransfers } from "@/store/queries/inventory"
import type { InventoryTransfer } from "@/types/inventory"

type Transfer = InventoryTransfer

const TRANSFER_STATUS_CONFIG: Record<
  string,
  { label: string; variant: "success" | "warning" | "neutral" | "error" }
> = {
  completed: { label: "Completed", variant: "success" },
  pending: { label: "Pending", variant: "warning" },
  cancelled: { label: "Cancelled", variant: "neutral" },
}

export default function TransfersTab({ search, status }: { search: string; status?: string }) {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const { data, isLoading } = useGetInventoryTransfers({
    search,
    status,
    pageSize,
    currentPage: page,
  })
  const items = data?.items ?? []
  const total = data?.total_count ?? 0
  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  return (
    <>
      <div className="hidden lg:block">
        <DataTable
          columns={transferColumns}
          data={items}
          getRowId={(r: Transfer) => r.id}
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
            entityLabel: "transfers",
          }}
        />
      </div>

      <div className="space-y-2 px-4 py-4 lg:hidden">
        {items.map((row) => (
          <MobileTransferCard key={row.id} row={row} />
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

const transferColumns: ColumnDef<Transfer>[] = [
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
        <p className="font-jakarta text-brand/40 text-xs whitespace-nowrap">
          {row.original.productId}
        </p>
      </div>
    ),
  },
  {
    accessorKey: "sku",
    header: "SKU",
    cell: ({ row }) => (
      <span className="font-jakarta text-brand/60 text-sm whitespace-nowrap">
        {row.original.sku}
      </span>
    ),
  },
  {
    accessorKey: "units",
    header: "Units",
    cell: ({ row }) => (
      <span className="font-jakarta text-brand text-sm whitespace-nowrap">
        {row.original.units}
      </span>
    ),
  },
  {
    id: "route",
    header: "From → To",
    cell: ({ row }) => (
      <div className="flex items-center gap-1.5 whitespace-nowrap">
        <WithTooltip
          trigger={
            <span className="font-jakarta text-brand inline-block max-w-28 truncate text-sm whitespace-nowrap">
              {row.original.from}
            </span>
          }
          content={row.original.from}
        />
        <ArrowRight size={12} className="text-brand/40 shrink-0" />
        <WithTooltip
          trigger={
            <span className="font-jakarta text-brand inline-block max-w-28 truncate text-sm whitespace-nowrap">
              {row.original.to}
            </span>
          }
          content={row.original.to}
        />
      </div>
    ),
  },
  {
    accessorKey: "reason",
    header: "Reason",
    cell: ({ row }) => (
      <WithTooltip
        trigger={
          <span className="font-jakarta text-brand/60 inline-block max-w-40 truncate text-sm whitespace-nowrap">
            {row.original.reason}
          </span>
        }
        content={row.original.reason}
      />
    ),
  },
  {
    accessorKey: "by",
    header: "By",
    cell: ({ row }) => (
      <WithTooltip
        trigger={
          <span className="font-jakarta text-brand/60 inline-block max-w-32 truncate text-sm whitespace-nowrap">
            {row.original.by}
          </span>
        }
        content={row.original.by}
      />
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const cfg = TRANSFER_STATUS_CONFIG[row.original.status] ?? {
        label: row.original.status,
        variant: "neutral" as const,
      }
      return <StatusBadge label={cfg.label} variant={cfg.variant} dot />
    },
  },
]

// ── Mobile card ─────────────────────────────────────────────────────────────────

const MobileTransferCard = ({ row }: { row: Transfer }) => {
  const cfg = TRANSFER_STATUS_CONFIG[row.status] ?? {
    label: row.status,
    variant: "neutral" as const,
  }
  return (
    <div className="border-line rounded-lg border bg-white p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <p className="font-jakarta text-brand line-clamp-1 text-sm font-semibold">
            {row.product}
          </p>
          <p className="font-jakarta text-brand/50 text-xs">
            {row.productId} · {row.sku}
          </p>
        </div>
        <StatusBadge label={cfg.label} variant={cfg.variant} dot />
      </div>
      <div className="mt-3 flex items-center gap-2">
        <span className="font-jakarta text-brand text-xs font-medium">{row.from}</span>
        <ArrowRight size={12} className="text-brand/40 shrink-0" />
        <span className="font-jakarta text-brand text-xs font-medium">{row.to}</span>
        <span className="font-jakarta text-brand/40 ml-auto text-xs">{row.units} units</span>
      </div>
      <p className="font-jakarta text-brand/50 mt-2 text-xs">
        {row.reason} · {row.by}
      </p>
    </div>
  )
}
