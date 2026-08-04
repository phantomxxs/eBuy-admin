import { useState, useMemo } from "react"
import { useQueryState } from "nuqs"
import { cn } from "@/lib/utils"
import { useDebounce } from "@/hooks/useDebounce"
import { StatusBadge } from "@/components/ui/data-table"
import DataTable from "@/components/ui/data-table"
import FloatingPagination from "@/components/ui/floating-pagination"
import DeleteConfirmModal from "@/components/ui/delete-confirm-modal"
import MetricCard from "@/components/shared/metric-card"
import TableToolbar from "@/components/shared/table-toolbar"
import FilterModal, { type FilterValues } from "@/components/shared/filter-modal"
import PageSkeleton from "@/components/shared/page-skeleton"
import type { GiftCard } from "@/types/gift-cards"
import {
  useGetGiftCards,
  useGetGiftCardMetrics,
  useGetGiftCardById,
} from "@/store/queries/gift-cards"
import {
  useDeleteGiftCard,
  useChangeGiftCardStatus,
  useExportGiftCardsCSV,
} from "@/store/mutations/gift-cards"
import { GIFT_CARD_STATUS_CONFIG, makeGiftCardColumns } from "@/components/table-columns/gift-cards"
import GiftCardDetailModal from "@/components/gift-cards/gift-card-detail-modal"
import LedgerTab from "@/components/gift-cards/tabs/ledger-tab"
import { GIFT_CARD_TAB, type GiftCardTab } from "@/utils/gift-cards"

const VIEW_TABS = Object.values(GIFT_CARD_TAB)

export default function GiftCardsPage() {
  const [activeTab, setActiveTab] = useQueryState<GiftCardTab>("tab", {
    defaultValue: GIFT_CARD_TAB.GIFT_CARDS,
    parse: (v) =>
      VIEW_TABS.includes(v as GiftCardTab) ? (v as GiftCardTab) : GIFT_CARD_TAB.GIFT_CARDS,
  })
  const [search, setSearch] = useState("")
  const debouncedSearch = useDebounce(search)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [selectedCard, setSelectedCard] = useState<GiftCard | null>(null)
  const [showDetail, setShowDetail] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<GiftCard | null>(null)
  const [showFilter, setShowFilter] = useState(false)
  const [filters, setFilters] = useState<FilterValues>({})

  const { data: metrics, isLoading } = useGetGiftCardMetrics()
  const { data: giftCardsData, isLoading: isLoadingCards } = useGetGiftCards({
    search: debouncedSearch,
    currentPage: page,
    pageSize,
    status: filters.status?.join(",") || undefined,
  })
  const deleteCard = useDeleteGiftCard()
  const changeStatusCard = useChangeGiftCardStatus()
  const exportCSV = useExportGiftCardsCSV()

  const { data: cardDetail, isLoading: isLoadingDetail } = useGetGiftCardById(
    showDetail ? (selectedCard?.id ?? null) : null,
  )

  const items = giftCardsData?.items ?? []
  const total = giftCardsData?.total_count ?? 0
  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  const openDetail = (card: GiftCard) => {
    setSelectedCard(card)
    setShowDetail(true)
  }

  const columns = useMemo(
    () =>
      makeGiftCardColumns(
        (card) => {
          setSelectedCard(card)
          setShowDetail(true)
        },
        (card) => changeStatusCard.mutate({ id: card.id, payload: { status: "canceled" } }),
        (card) => setDeleteTarget(card),
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )

  if (isLoading) return <PageSkeleton metricCount={4} />

  return (
    <div className="page-bg min-h-full">
      {/* ── Page header ── */}
      <div className="border-borderSubtle flex flex-col justify-between gap-3 border-b bg-white p-4 lg:flex-row lg:items-center lg:p-6">
        <div>
          <h1 className="font-jakarta text-brand text-base font-semibold tracking-[-0.04em]">
            Gift Cards
          </h1>
          <p className="font-jakarta text-brand/60 mt-0.5 text-sm font-medium tracking-[-0.04em]">
            View and manage customer gift cards
          </p>
        </div>
      </div>

      {/* ── Metric cards ── */}
      {metrics && (
        <div className="no-scrollbar flex grid-cols-4 gap-3 overflow-x-auto p-4 lg:grid lg:grid-cols-4 lg:p-6">
          {(
            [
              { label: "Total issued", value: metrics.total },
              { label: "Active", value: metrics.active },
              { label: "Exhausted", value: metrics.exhausted },
              { label: "Expired", value: metrics.expired },
              { label: "Pending payment", value: metrics.pendingPayment },
              {
                label: "Total issued value",
                value: `₦${metrics.totalIssuedValue.toLocaleString()}`,
              },
              {
                label: "Outstanding balance",
                value: `₦${metrics.outstandingBalance.toLocaleString()}`,
              },
            ] as const
          ).map((m) => (
            <MetricCard key={m.label} label={m.label} value={m.value} />
          ))}
        </div>
      )}

      {/* ── Tabs ── */}
      <div className="lg:border-borderSubtle mb-6 overflow-hidden lg:mx-6 lg:rounded-xl lg:border lg:bg-white">
        <div className="border-borderSubtle no-scrollbar flex overflow-x-auto border-b bg-white">
          {VIEW_TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "font-jakarta shrink-0 border-b-2 px-4 py-3 text-sm font-medium transition-colors",
                activeTab === tab
                  ? "border-primary text-primary"
                  : "text-brand/50 hover:text-brand border-transparent",
              )}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* ── Gift cards tab ── */}
        {activeTab === GIFT_CARD_TAB.GIFT_CARDS && (
          <>
            <TableToolbar
              search={search}
              onSearchChange={(v) => {
                setSearch(v)
                setPage(1)
              }}
              placeholder="Search gift cards"
              exportProps={{
                currentData: items,
                filename: "gift-cards",
                onExportAll: () => exportCSV.mutate({}),
              }}
              onFilterClick={() => setShowFilter(true)}
              activeFiltersCount={Object.values(filters).reduce((s, v) => s + v.length, 0)}
            />

            <div className="hidden lg:block">
              <DataTable
                columns={columns}
                data={items}
                getRowId={(row) => row.id}
                onRowClick={openDetail}
                isLoading={isLoadingCards}
                pagination={{
                  page,
                  pageSize,
                  total,
                  onPageChange: setPage,
                  onPageSizeChange: (s) => {
                    setPageSize(s)
                    setPage(1)
                  },
                  entityLabel: "gift cards",
                }}
              />
            </div>

            <div className="space-y-2 px-4 py-4 lg:hidden">
              {items.map((card) => (
                <MobileGiftCardCard key={card.id} card={card} onView={() => openDetail(card)} />
              ))}
            </div>
          </>
        )}

        {/* ── Ledger tab ── */}
        {activeTab === GIFT_CARD_TAB.LEDGER && <LedgerTab />}
      </div>

      {activeTab === GIFT_CARD_TAB.GIFT_CARDS && (
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
      )}

      <GiftCardDetailModal
        isOpen={showDetail}
        onClose={() => setShowDetail(false)}
        card={cardDetail ?? selectedCard}
        isLoading={isLoadingDetail}
      />

      <DeleteConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) deleteCard.mutate(deleteTarget.id)
          setDeleteTarget(null)
        }}
        entityType="gift card"
        entityName={deleteTarget?.code}
        isLoading={deleteCard.isPending}
      />

      <FilterModal
        isOpen={showFilter}
        onClose={() => setShowFilter(false)}
        title="Filter gift cards"
        fields={GIFT_CARD_FILTERS}
        values={filters}
        onApply={(v) => {
          setFilters(v)
          setPage(1)
        }}
      />
    </div>
  )
}

// ── Filter config ──────────────────────────────────────────────────────────────

const GIFT_CARD_FILTERS = [
  {
    key: "status",
    label: "Status",
    options: [
      { label: "Active", value: "active" },
      { label: "Redeemed", value: "redeemed" },
      { label: "Expired", value: "expired" },
    ],
  },
]

// ── Sub-components ─────────────────────────────────────────────────────────────

const MobileGiftCardCard = ({ card, onView }: { card: GiftCard; onView: () => void }) => {
  const cfg = GIFT_CARD_STATUS_CONFIG[card.status]
  return (
    <button
      onClick={onView}
      className="flex w-full items-center justify-between rounded-lg border bg-white p-4 text-left transition-colors hover:bg-gray-50"
    >
      <div className="flex-1 pr-4">
        <p className="text-brand font-mono text-sm font-semibold tracking-wider">{card.code}</p>
        <p className="font-jakarta text-brand/70 mt-0.5 text-sm font-semibold">
          ₦{card.balance.toLocaleString()}
          <span className="font-jakarta text-brand/40 ml-1 text-xs font-normal">
            / ₦{card.amount.toLocaleString()}
          </span>
        </p>
        <p className="font-jakarta text-brand/50 mt-0.5 text-xs">{card.recipientName}</p>
        <p className="font-jakarta text-brand/40 text-xs">{card.recipientEmail}</p>
      </div>
      <StatusBadge label={cfg.label} variant={cfg.variant} dot />
    </button>
  )
}
