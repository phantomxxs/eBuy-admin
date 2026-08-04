import { useState, useMemo } from "react"
import { useDebounce } from "@/hooks/useDebounce"
import { cn } from "@/lib/utils"
import { StatusBadge } from "@/components/ui/data-table"
import DataTable from "@/components/ui/data-table"
import FloatingPagination from "@/components/ui/floating-pagination"
import MetricCard from "@/components/shared/metric-card"
import TableToolbar from "@/components/shared/table-toolbar"
import FilterModal, { type FilterValues } from "@/components/shared/filter-modal"
import {
  makeTransactionColumns,
  transactionStatusConfig,
  METHOD_COLORS,
  formatTransactionAmount,
} from "@/components/table-columns/transactions"
import { useGetTransactions, useGetTransactionMetrics } from "@/store/queries/transactions"
import { useExportTransactionsCSV } from "@/store/mutations/transactions"
import type { Transaction } from "@/types/transactions"
import TransactionDetailModal from "@/components/transactions/transaction-detail-modal"
import PageSkeleton from "@/components/shared/page-skeleton"

export default function TransactionsPage() {
  const [search, setSearch] = useState("")
  const debouncedSearch = useDebounce(search)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const [selectedTxn, setSelectedTxn] = useState<string | null>(null)
  const [showDetail, setShowDetail] = useState(false)
  const [showFilter, setShowFilter] = useState(false)
  const [filters, setFilters] = useState<FilterValues>({})

  const { data: metrics, isLoading } = useGetTransactionMetrics()
  const { data: txData, isLoading: isLoadingTx } = useGetTransactions({
    search: debouncedSearch,
    currentPage: page,
    pageSize,
    type: filters.type?.join(",") || undefined,
    status: filters.status?.join(",") || undefined,
    payment_method: filters.method?.join(",") || undefined,
    amount_min: filters.amount_min?.[0] ? Number(filters.amount_min[0]) : undefined,
    amount_max: filters.amount_max?.[0] ? Number(filters.amount_max[0]) : undefined,
    date_from: filters.date_from?.[0],
    date_to: filters.date_to?.[0],
  })
  const exportCSV = useExportTransactionsCSV()

  const transactions = txData?.items ?? []

  const columns = useMemo(
    () =>
      makeTransactionColumns((tx) => {
        setSelectedTxn(tx.id)
        setShowDetail(true)
      }),
    [],
  )

  const total = txData?.total_count ?? 0
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const activeFiltersCount = Object.values(filters).reduce((s, v) => s + v.length, 0)

  if (isLoading) return <PageSkeleton metricCount={5} />

  const openDetail = (txId: string) => {
    setSelectedTxn(txId)
    setShowDetail(true)
  }

  return (
    <div className="page-bg min-h-full">
      {/* ── Page header ── */}
      <div className="border-borderSubtle flex flex-col justify-between gap-3 border-b bg-white p-4 lg:flex-row lg:items-center lg:p-6">
        <div>
          <h1 className="font-jakarta text-brand text-base font-semibold tracking-[-0.04em]">
            Transactions
          </h1>
          <p className="font-jakarta text-brand/60 mt-0.5 text-sm font-medium tracking-[-0.04em]">
            Payment and financial records
          </p>
        </div>
      </div>

      {/* ── Metric cards ── */}
      {metrics && (
        <div className="no-scrollbar flex grid-cols-3 gap-3 overflow-x-auto p-4 lg:grid lg:grid-cols-5 lg:p-6">
          {(
            [
              {
                label: "Total revenue",
                value: formatTransactionAmount(metrics.totalRevenue),
              },
              { label: "Transactions", value: metrics.totalTransactions },
              { label: "Successful", value: metrics.successful },
              { label: "Pending", value: metrics.pending },
              { label: "Failed", value: metrics.failed },
            ] as const
          ).map((m) => (
            <MetricCard key={m.label} label={m.label} value={m.value} />
          ))}
        </div>
      )}

      {/* ── Table section ── */}
      <div className="lg:border-borderSubtle mb-6 overflow-hidden lg:mx-6 lg:rounded-xl lg:border lg:bg-white">
        {/* Toolbar */}
        <TableToolbar
          search={search}
          onSearchChange={setSearch}
          placeholder="Search transactions, customers"
          exportProps={{
            currentData: transactions,
            filename: "transactions",
            onExportAll: () => exportCSV.mutate(),
          }}
          onFilterClick={() => setShowFilter(true)}
          activeFiltersCount={activeFiltersCount}
        />

        {/* Desktop table */}
        <div className="hidden lg:block">
          <DataTable
            columns={columns}
            data={transactions}
            getRowId={(row) => row.id}
            onRowClick={(row) => openDetail(row.id)}
            isLoading={isLoadingTx}
            pagination={{
              page,
              pageSize,
              total,
              onPageChange: setPage,
              onPageSizeChange: (s) => {
                setPageSize(s)
                setPage(1)
              },
              entityLabel: "transactions",
            }}
          />
        </div>

        {/* Mobile cards */}
        <div className="space-y-2 px-4 lg:hidden">
          {transactions.map((tx, i) => (
            <MobileTransactionCard
              key={String(tx.id) + i.toString()}
              tx={tx}
              onClick={() => openDetail(tx.id)}
            />
          ))}
        </div>
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

      <TransactionDetailModal
        open={showDetail}
        onClose={() => setShowDetail(false)}
        trxRef={selectedTxn}
      />
      <FilterModal
        isOpen={showFilter}
        onClose={() => setShowFilter(false)}
        title="Filter transactions"
        fields={TRANSACTION_FILTERS}
        values={filters}
        onApply={(v) => {
          setFilters(v)
          setPage(1)
        }}
      />
    </div>
  )
}

// ── Filter config ───────────────────────────────────────────────────────────────

const TRANSACTION_FILTERS = [
  {
    key: "type",
    label: "Type",
    options: [
      { label: "Sale", value: "Sale" },
      { label: "Refund", value: "Refund" },
      { label: "Adjustment", value: "Adjustment" },
    ],
  },
  {
    key: "method",
    label: "Payment method",
    options: [
      { label: "Card", value: "Card" },
      { label: "Transfer", value: "Transfer" },
      { label: "Cash", value: "Cash" },
      { label: "Wallet", value: "Wallet" },
    ],
  },
  {
    key: "status",
    label: "Status",
    options: [
      { label: "Successful", value: "successful" },
      { label: "Pending", value: "pending" },
      { label: "Failed", value: "failed" },
      { label: "Refunded", value: "refunded" },
    ],
  },
  { type: "number-range" as const, key: "amount", label: "Amount" },
  { type: "date-range" as const, key: "date", label: "Date" },
]

// ── Sub-components ─────────────────────────────────────────────────────────────

const MobileTransactionCard = ({ tx, onClick }: { tx: Transaction; onClick: () => void }) => {
  const cfg = transactionStatusConfig[tx.status]
  const methodClass = METHOD_COLORS[tx.method] ?? "bg-gray-50 text-gray-600"
  return (
    <div
      className="border-line flex cursor-pointer items-center justify-between rounded-lg bg-white p-4 transition-colors"
      onClick={onClick}
    >
      <div className="flex-1 pr-4">
        <div className="flex items-center gap-2">
          <p className="font-jakarta text-brand text-sm font-semibold">{tx.customer}</p>
          <span
            className={cn(
              "font-jakarta rounded-full px-2 py-0.5 text-xs font-semibold whitespace-nowrap",
              methodClass,
            )}
          >
            {tx.method}
          </span>
        </div>
        <p className="text-brand/50 mt-0.5 font-mono text-xs">{tx.id}</p>
        <p className="font-jakarta text-brand/50 mt-0.5 text-xs">{tx.date}</p>
      </div>
      <div className="flex flex-col items-end gap-1.5">
        <p className="font-jakarta text-brand text-sm font-bold">
          {formatTransactionAmount(tx.amount)}
        </p>
        <StatusBadge
          label={cfg.label}
          variant={cfg.variant as "success" | "warning" | "neutral" | "default"}
          dot
        />
      </div>
    </div>
  )
}
