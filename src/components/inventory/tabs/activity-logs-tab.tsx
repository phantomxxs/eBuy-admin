import { useState } from "react"
import { MapPin } from "lucide-react"
import DataTable, { type ColumnDef } from "@/components/ui/data-table"
import { WithTooltip } from "@/components/ui/tooltip"
import FloatingPagination from "@/components/ui/floating-pagination"
import { useGetInventoryActivity } from "@/store/queries/inventory"
import { formatDateToCustomFormat } from "@/lib/utils"
import type { InventoryActivityLog } from "@/types/inventory"

type ActivityLog = InventoryActivityLog

export default function ActivityLogsTab({
  search,
  adjustmentType,
}: {
  search: string
  adjustmentType?: string
}) {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const { data, isLoading } = useGetInventoryActivity({
    search,
    adjustmentType,
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
          columns={activityColumns}
          data={items}
          getRowId={(r: ActivityLog) => r.id}
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
            entityLabel: "logs",
          }}
        />
      </div>

      <div className="space-y-2 px-4 py-4 lg:hidden">
        {items.map((row) => (
          <MobileActivityCard key={row.id} row={row} />
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

const activityColumns: ColumnDef<ActivityLog>[] = [
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
    accessorKey: "activity",
    header: "Activity",
    cell: ({ row }) => (
      <WithTooltip
        trigger={
          <span className="font-jakarta text-brand inline-block max-w-48 truncate text-sm whitespace-nowrap">
            {row.original.activity}
          </span>
        }
        content={row.original.activity}
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
    accessorKey: "location",
    header: "Location",
    cell: ({ row }) => (
      <WithTooltip
        trigger={
          <span className="font-jakarta text-brand/60 inline-block max-w-36 truncate text-sm whitespace-nowrap">
            {row.original.location}
          </span>
        }
        content={row.original.location}
      />
    ),
  },
  {
    accessorKey: "date",
    header: "Date adjusted",
    cell: ({ row }) => (
      <span className="font-jakarta text-brand/60 text-sm whitespace-nowrap">
        {formatDateToCustomFormat(row.original.date, true)}
      </span>
    ),
  },
]

// ── Mobile card ─────────────────────────────────────────────────────────────────

const MobileActivityCard = ({ row }: { row: ActivityLog }) => {
  const isPositive = row.activity.startsWith("+")
  return (
    <div className="border-line rounded-lg border bg-white p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <p className="font-jakarta text-brand line-clamp-1 text-sm font-semibold">
            {row.product}
          </p>
          <p className="font-jakarta text-brand/50 text-xs">{row.sku}</p>
        </div>
        <span
          className={`font-jakarta text-xs font-bold ${isPositive ? "text-statusSuccess" : "text-danger"}`}
        >
          {row.activity.split(" ")[0]}
        </span>
      </div>
      <p className="font-jakarta text-brand/70 mt-2 text-xs">
        {row.activity.replace(/^[^ ]+ /, "")}
      </p>
      <div className="mt-2 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="font-jakarta text-brand/50 text-xs">{row.by}</span>
          <span className="font-jakarta text-brand/50 flex items-center gap-0.5 text-xs">
            <MapPin size={10} className="shrink-0" />
            {row.location}
          </span>
        </div>
        <span className="font-jakarta text-brand/40 text-xs">
          {formatDateToCustomFormat(row.date, true)}
        </span>
      </div>
    </div>
  )
}
