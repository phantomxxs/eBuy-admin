import { useState, useEffect } from "react"
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  type ColumnDef,
  type OnChangeFn,
  type RowSelectionState,
} from "@tanstack/react-table"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell } from "./table"
import TablePagination from "./table-pagination"

// ── Re-export ColumnDef so column files don't need to import from react-table directly ──
export type { ColumnDef }

// ── Types ─────────────────────────────────────────────────────────────────────

interface DataTableProps<T> {
  columns: ColumnDef<T>[]
  data: T[]
  getRowId: (row: T) => string
  onRowClick?: (row: T) => void
  className?: string
  emptyMessage?: string
  isLoading?: boolean
  /**
   * If provided, row selection checkboxes are shown.
   * When rows are selected, a floating bubble appears.
   * Clicking the bubble opens this component.
   */
  rowSelectionActions?: React.ReactNode
  onSelectionChange?: (selectedIds: string[]) => void
  clearSelectionToken?: unknown
  pagination?: {
    page: number
    pageSize: number
    total: number
    onPageChange: (page: number) => void
    onPageSizeChange: (size: number) => void
    entityLabel?: string
  }
  hidePagination?: boolean
}

// ── Main export ───────────────────────────────────────────────────────────────

export default function DataTable<T>({
  columns,
  data,
  getRowId,
  onRowClick,
  className,
  emptyMessage = "No data available",
  isLoading = false,
  rowSelectionActions,
  onSelectionChange,
  clearSelectionToken,
  pagination,
  hidePagination = false,
}: DataTableProps<T>) {
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const [actionPanelOpen, setActionPanelOpen] = useState(false)

  useEffect(() => {
    setRowSelection({})
    setActionPanelOpen(false)
  }, [clearSelectionToken])

  const enableSelection = Boolean(rowSelectionActions !== undefined)

  // Prepend a checkbox column when selection is enabled
  const selectionColumn: ColumnDef<T> = {
    id: "__select",
    header: ({ table }) => (
      <input
        type="checkbox"
        checked={table.getIsAllPageRowsSelected()}
        ref={(el) => {
          if (el) el.indeterminate = table.getIsSomePageRowsSelected()
        }}
        onChange={table.getToggleAllPageRowsSelectedHandler()}
        className="accent-primary h-3.5 w-3.5 rounded"
      />
    ),
    cell: ({ row }) => (
      <input
        type="checkbox"
        checked={row.getIsSelected()}
        onChange={row.getToggleSelectedHandler()}
        onClick={(e) => e.stopPropagation()}
        className="accent-primary h-3.5 w-3.5 rounded"
      />
    ),
    size: 40,
  }

  const allColumns: ColumnDef<T>[] = enableSelection ? [selectionColumn, ...columns] : columns

  const table = useReactTable({
    data,
    columns: allColumns,
    getRowId,
    state: { rowSelection },
    onRowSelectionChange: ((updater) => {
      setRowSelection((prev) => {
        const next = typeof updater === "function" ? updater(prev) : updater
        onSelectionChange?.(Object.keys(next))
        return next
      })
    }) as OnChangeFn<RowSelectionState>,
    getCoreRowModel: getCoreRowModel(),
    enableRowSelection: enableSelection,
  })

  const selectedCount = Object.keys(rowSelection).length

  return (
    <div className="relative">
      <Table className={className}>
        <TableHead>
          {table.getHeaderGroups().map((hg) => (
            <TableRow key={hg.id}>
              {hg.headers.map((header, i) => (
                <TableHeaderCell
                  key={String(header.id) + i.toString()}
                  className="bg-brand/1 py-3 text-[11px] font-bold tracking-wider uppercase"
                  style={
                    header.column.columnDef.size !== 150
                      ? { width: header.column.columnDef.size }
                      : undefined
                  }
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext())}
                </TableHeaderCell>
              ))}
            </TableRow>
          ))}
        </TableHead>
        <TableBody>
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i} className="animate-pulse">
                {allColumns.map((_col, j) => (
                  <TableCell key={j}>
                    <div
                      className="bg-brand/8 h-3.5 rounded-full"
                      style={{ width: `${50 + ((i * 3 + j * 7) % 35)}%` }}
                    />
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : table.getRowModel().rows.length === 0 ? (
            <TableRow>
              <td
                colSpan={allColumns.length}
                className="font-jakarta text-brand/50 h-16 px-6 py-4 text-center text-sm"
              >
                {emptyMessage}
              </td>
            </TableRow>
          ) : (
            table.getRowModel().rows.map((row, i) => (
              <TableRow
                key={String(row.id) + i.toString()}
                onClick={onRowClick ? () => onRowClick(row.original) : undefined}
                className={cn(
                  onRowClick && "cursor-pointer",
                  row.getIsSelected() && "bg-primary/2",
                )}
              >
                {row.getVisibleCells().map((cell, i) => (
                  <TableCell
                    key={String(row.id) + i.toString()}
                    style={
                      cell.column.columnDef.size !== 150
                        ? { width: cell.column.columnDef.size }
                        : undefined
                    }
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {/* ── Pagination ── */}
      {!hidePagination && pagination && (
        <TablePagination
          page={pagination.page}
          pageSize={pagination.pageSize}
          total={pagination.total}
          onPageChange={pagination.onPageChange}
          onPageSizeChange={pagination.onPageSizeChange}
          entityLabel={pagination.entityLabel}
        />
      )}

      {/* ── Floating selection bubble ── */}
      {enableSelection && selectedCount > 0 && (
        <div className="fixed bottom-8 left-1/2 z-50 -translate-x-1/2">
          <div className="shadow-brand/10 border-brand/10 flex items-center gap-3 rounded-full border bg-white px-5 py-3 shadow-xl">
            <button
              onClick={() => (rowSelectionActions ? setActionPanelOpen(true) : undefined)}
              className="font-jakarta text-brand text-sm font-semibold"
            >
              {selectedCount} row{selectedCount !== 1 ? "s" : ""} selected
            </button>
            <button
              onClick={() => setRowSelection({})}
              className="text-brand/40 hover:text-brand transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      {/* ── Action panel (shown when bubble is clicked) ── */}
      {actionPanelOpen && rowSelectionActions && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center"
          onClick={() => setActionPanelOpen(false)}
        >
          <div
            className="border-borderSubtle w-full max-w-sm overflow-hidden rounded-2xl border bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="border-borderSubtle flex items-center justify-between border-b px-5 py-4">
              <span className="font-jakarta text-brand text-sm font-semibold">
                {selectedCount} row{selectedCount !== 1 ? "s" : ""} selected
              </span>
              <button
                onClick={() => setActionPanelOpen(false)}
                className="text-brand/40 hover:text-brand transition-colors"
              >
                <X size={16} />
              </button>
            </div>
            <div className="p-4">{rowSelectionActions}</div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Status badge (re-exported for table column consumers) ─────────────────────

export type StatusVariant = "success" | "error" | "info" | "warning" | "neutral" | "default"

const statusVariants: Record<StatusVariant, { pill: string; dot: string }> = {
  success: {
    pill: "bg-statusSuccessBg border border-statusSuccessBorder text-statusSuccess",
    dot: "bg-statusSuccess",
  },
  error: {
    pill: "bg-statusErrorBg border border-statusErrorBorder text-statusError",
    dot: "bg-statusError",
  },
  info: {
    pill: "bg-statusInfoBg border border-statusInfoBorder text-statusInfo",
    dot: "bg-statusInfo",
  },
  warning: {
    pill: "bg-statusWarningBg border border-statusWarningBorder text-statusWarning",
    dot: "bg-statusWarning",
  },
  neutral: {
    pill: "bg-brand/4 border border-brand/6 text-brand/50",
    dot: "bg-brand/40",
  },
  default: {
    pill: "bg-gray-100 border border-gray-200 text-gray-600",
    dot: "bg-gray-400",
  },
}

export const StatusBadge = ({
  label,
  variant = "default",
  dot = false,
}: {
  label: string
  variant?: StatusVariant
  dot?: boolean
}) => (
  <span
    className={cn(
      "font-jakarta inline-flex w-fit shrink-0 items-center gap-1.5 rounded-full px-2 py-1 text-xs leading-[1.35] font-semibold tracking-[-0.04em] whitespace-nowrap",
      statusVariants[variant].pill,
    )}
  >
    {dot && (
      <span
        className={cn(
          "inline-block h-1.5 w-1.5 shrink-0 rounded-full",
          statusVariants[variant].dot,
        )}
      />
    )}
    {label}
  </span>
)
