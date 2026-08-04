import { useState } from "react"
import { Download, Search, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import Popover from "@/components/ui/popover"
import DataTable, { type ColumnDef, StatusBadge } from "@/components/ui/data-table"
import FloatingPagination from "@/components/ui/floating-pagination"
import { useGetGiftCards } from "@/store/queries/gift-cards"
import { useGetGiftCardLedger } from "@/store/queries/gift-cards"
import { useExportGiftCardLedger } from "@/store/mutations/gift-cards"
import { useDebounce } from "@/hooks/useDebounce"
import type { GiftCard, GiftCardLedgerEntry } from "@/types/gift-cards"

export default function LedgerTab() {
  const [search, setSearch] = useState("")
  const [selectedCard, setSelectedCard] = useState<GiftCard | null>(null)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const debouncedSearch = useDebounce(search)
  const exportLedger = useExportGiftCardLedger()

  const { data: searchResults, isLoading: isSearching } = useGetGiftCards({
    search: debouncedSearch || undefined,
    pageSize: 100,
    currentPage: 1,
  })

  const { data: ledgerData, isLoading: isLoadingLedger } = useGetGiftCardLedger(
    selectedCard?.id ?? null,
    { currentPage: page, pageSize },
  )

  const total = ledgerData?.total_count ?? 0
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const items = ledgerData?.items ?? []

  function handleSelectCard(card: GiftCard) {
    setSelectedCard(card)
    setSearch("")
    setPage(1)
  }

  function handleClearCard() {
    setSelectedCard(null)
    setPage(1)
  }

  return (
    <div>
      {/* ── Gift card selector ── */}
      <div className="border-borderSubtle border-b bg-white px-4 py-3 lg:px-6">
        <div className="flex max-w-md items-center gap-3">
          {selectedCard ? (
            <div className="border-borderSubtle flex flex-1 items-center justify-between gap-3 rounded-xl border bg-white px-4 py-2.5">
              <div className="min-w-0">
                <span className="text-brand font-mono text-sm font-bold tracking-wider">
                  {selectedCard.code}
                </span>
                <span className="font-jakarta text-brand/50 ml-2 text-xs">
                  {selectedCard.recipientName}
                </span>
              </div>
              <button
                onClick={handleClearCard}
                className="text-brand/40 hover:text-brand shrink-0 transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <Popover
              align="start"
              sideOffset={4}
              contentClassName="border-borderSubtle w-[var(--radix-popover-trigger-width)] overflow-hidden rounded-xl border bg-white shadow-lg"
              trigger={
                <div className="border-borderSubtle flex flex-1 cursor-text items-center gap-2 rounded-xl border bg-white px-3 py-2.5">
                  <Search size={15} className="text-brand/40 shrink-0" />
                  <input
                    type="text"
                    placeholder="Search gift card code or recipient…"
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value)
                    }}
                    className="font-jakarta text-brand placeholder:text-brand/40 w-full bg-transparent text-sm outline-none"
                  />
                  {search && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setSearch("")
                      }}
                      className="text-brand/40 hover:text-brand shrink-0 transition-colors"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              }
            >
              <div className="max-h-64 overflow-y-auto">
                {isSearching && (
                  <div className="flex flex-col gap-2 p-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="bg-brand/5 h-8 animate-pulse rounded-lg" />
                    ))}
                  </div>
                )}
                {!isSearching && !searchResults?.items.length && (
                  <p className="font-jakarta text-brand/40 p-4 text-sm">No gift cards found</p>
                )}
                {!isSearching &&
                  searchResults?.items.map((card) => (
                    <button
                      key={card.id}
                      onClick={() => handleSelectCard(card)}
                      className="hover:bg-brand/4 flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left transition-colors"
                    >
                      <div className="min-w-0">
                        <p className="text-brand font-mono text-sm font-bold tracking-wider">
                          {card.code}
                        </p>
                        <p className="font-jakarta text-brand/50 truncate text-xs">
                          {card.recipientName} · {card.recipientEmail}
                        </p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="font-jakarta text-brand text-xs font-semibold">
                          ₦{card.balance.toLocaleString()}
                        </p>
                        <StatusBadgeSmall status={card.status} />
                      </div>
                    </button>
                  ))}
              </div>
            </Popover>
          )}
        </div>
        {!selectedCard && (
          <p className="font-jakarta text-brand/40 mt-2 text-xs">
            Search for a gift card to view its transaction history
          </p>
        )}
      </div>

      {/* ── Ledger content ── */}
      {!selectedCard && (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="bg-brand/5 mb-4 flex h-16 w-16 items-center justify-center rounded-full">
            <Search size={24} className="text-brand/30" />
          </div>
          <p className="font-jakarta text-brand text-sm font-semibold">No card selected</p>
          <p className="font-jakarta text-brand/50 mt-1 text-xs">
            Search for a gift card above to view its ledger
          </p>
        </div>
      )}

      {selectedCard && (
        <>
          {/* ── Ledger header ── */}
          <div className="border-borderSubtle flex items-center justify-between border-b bg-white px-4 py-3 lg:px-6">
            <div>
              <p className="font-jakarta text-brand text-sm font-semibold">Transaction history</p>
              {ledgerData && (
                <p className="font-jakarta text-brand/50 mt-0.5 text-xs">
                  {ledgerData.total_count} transaction{ledgerData.total_count !== 1 ? "s" : ""}
                </p>
              )}
            </div>
            {ledgerData && ledgerData.items.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                beforeIcon={<Download size={13} />}
                loading={exportLedger.isPending}
                onClick={() => exportLedger.mutate(selectedCard.id)}
              >
                Export
              </Button>
            )}
          </div>

          <div className="hidden lg:block">
            <DataTable
              columns={ledgerColumns}
              data={items}
              getRowId={(r) => r.id}
              isLoading={isLoadingLedger}
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

          <div className="space-y-2 px-4 py-4 lg:hidden">
            {isLoadingLedger &&
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-brand/5 h-16 animate-pulse rounded-xl" />
              ))}
            {!isLoadingLedger && items.length === 0 && (
              <p className="font-jakarta text-brand/40 py-8 text-center text-sm">
                No transactions yet
              </p>
            )}
            {!isLoadingLedger &&
              items.map((entry) => <MobileLedgerCard key={entry.id} entry={entry} />)}
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
      )}
    </div>
  )
}

// ── Helpers ────────────────────────────────────────────────────────────────────

const LEDGER_STATUS_CONFIG: Record<
  string,
  { label: string; variant: "success" | "error" | "warning" | "info" | "neutral" }
> = {
  credit: { label: "Credit", variant: "success" },
  debit: { label: "Debit", variant: "error" },
  purchase: { label: "Purchase", variant: "info" },
  redemption: { label: "Redemption", variant: "warning" },
  refund: { label: "Refund", variant: "success" },
  expiry: { label: "Expiry", variant: "neutral" },
}

function getLedgerBadge(type: string) {
  return (
    LEDGER_STATUS_CONFIG[type.toLowerCase()] ?? {
      label: type.replace(/_/g, " "),
      variant: "neutral" as const,
    }
  )
}

const StatusBadgeSmall = ({ status }: { status: string }) => {
  const cfg: Record<
    string,
    { label: string; variant: "success" | "error" | "warning" | "info" | "neutral" }
  > = {
    active: { label: "Active", variant: "success" },
    redeemed: { label: "Redeemed", variant: "neutral" },
    expired: { label: "Expired", variant: "error" },
  }
  const c = cfg[status] ?? { label: status, variant: "neutral" as const }
  return <StatusBadge label={c.label} variant={c.variant} dot />
}

// ── Column definitions ─────────────────────────────────────────────────────────

const ledgerColumns: ColumnDef<GiftCardLedgerEntry>[] = [
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => {
      const cfg = getLedgerBadge(row.original.type)
      return <StatusBadge label={cfg.label} variant={cfg.variant} />
    },
  },
  {
    accessorKey: "comment",
    header: "Description",
    cell: ({ row }) => (
      <span className="font-jakarta text-brand/70 text-sm capitalize">
        {row.original.comment ?? row.original.type.replace(/_/g, " ")}
      </span>
    ),
  },
  {
    accessorKey: "amount",
    header: "Amount",
    cell: ({ row }) => {
      const isCredit = row.original.amount > 0
      return (
        <span
          className={`font-jakarta text-sm font-semibold ${isCredit ? "text-statusSuccess" : "text-danger"}`}
        >
          {isCredit ? "+" : ""}₦{Math.abs(row.original.amount).toLocaleString()}
        </span>
      )
    },
  },
  {
    accessorKey: "balanceAfter",
    header: "Balance after",
    cell: ({ row }) => (
      <span className="font-jakarta text-brand text-sm font-medium">
        ₦{row.original.balanceAfter.toLocaleString()}
      </span>
    ),
  },
  {
    accessorKey: "createdAt",
    header: "Date",
    cell: ({ row }) => (
      <span className="font-jakarta text-brand/60 text-sm whitespace-nowrap">
        {new Date(row.original.createdAt).toLocaleDateString("en-GB", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })}
      </span>
    ),
  },
]

// ── Mobile card ────────────────────────────────────────────────────────────────

const MobileLedgerCard = ({ entry }: { entry: GiftCardLedgerEntry }) => {
  const isCredit = entry.amount > 0
  const cfg = getLedgerBadge(entry.type)
  return (
    <div className="border-borderSubtle rounded-xl border bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <StatusBadge label={cfg.label} variant={cfg.variant} />
          </div>
          {entry.comment && (
            <p className="font-jakarta text-brand/60 mt-1 text-xs">{entry.comment}</p>
          )}
          <p className="font-jakarta text-brand/40 mt-1 text-xs">
            {new Date(entry.createdAt).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </p>
        </div>
        <div className="shrink-0 text-right">
          <p
            className={`font-jakarta text-sm font-bold ${isCredit ? "text-statusSuccess" : "text-danger"}`}
          >
            {isCredit ? "+" : ""}₦{Math.abs(entry.amount).toLocaleString()}
          </p>
          <p className="font-jakarta text-brand/40 mt-0.5 text-xs">
            Bal: ₦{entry.balanceAfter.toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  )
}
