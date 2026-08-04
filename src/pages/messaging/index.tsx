import { useState } from "react"
import { useDebounce } from "@/hooks/useDebounce"
import { useQueryState } from "nuqs"
import { Plus, MoreVertical, Eye, Trash2 } from "lucide-react"
import { type ColumnDef } from "@tanstack/react-table"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import DataTable from "@/components/ui/data-table"
import FloatingPagination from "@/components/ui/floating-pagination"
import MetricCard from "@/components/shared/metric-card"
import TableToolbar from "@/components/shared/table-toolbar"
import FilterModal, { type FilterValues } from "@/components/shared/filter-modal"
import { applyTableFilters } from "@/utils/table"
import { messageColumns } from "@/components/table-columns/messages"
import { useGetMessages, useGetMessageMetrics } from "@/store/queries/messages"
import type { Message } from "@/types/messages"
import {
  ComposeMessageModal,
  MessageDetailModal,
} from "@/components/messaging/compose-message-modal"
import MobileMessageCard from "@/components/messaging/mobile-message-card"
import DeleteConfirmModal from "@/components/ui/delete-confirm-modal"
import PageSkeleton from "@/components/shared/page-skeleton"

const TABS = ["All", "Announcements", "SMS", "Drafts"]

export default function MessagingPage() {
  const { data: metricsData, isLoading } = useGetMessageMetrics()
  const { data: messagesData, isLoading: isLoadingMessages } = useGetMessages()
  const metrics = metricsData?.data
  const messages = messagesData?.data ?? []

  const [search, setSearch] = useState("")
  const debouncedSearch = useDebounce(search)
  const [activeTab, setActiveTab] = useQueryState("tab", {
    defaultValue: "All",
  })
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const [composeOpen, setComposeOpen] = useState(false)
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null)
  const [showDetail, setShowDetail] = useState(false)
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<{ name: string } | null>(null)
  const [showFilter, setShowFilter] = useState(false)
  const [filters, setFilters] = useState<FilterValues>({})

  if (isLoading) return <PageSkeleton metricCount={5} />

  function openDetail(msg: Message) {
    setSelectedMessage(msg)
    setShowDetail(true)
  }

  const actionsColumn: ColumnDef<Message> = {
    id: "actions",
    header: "",
    size: 60,
    cell: ({ row }) => {
      const msg = row.original
      const isOpen = openMenuId === msg.id
      return (
        <div className="relative flex justify-end">
          <button
            onClick={(e) => {
              e.stopPropagation()
              setOpenMenuId(isOpen ? null : msg.id)
            }}
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-lg transition-colors",
              isOpen ? "bg-brand/8 text-brand" : "text-brand/40 hover:bg-brand/5 hover:text-brand",
            )}
          >
            <MoreVertical size={16} />
          </button>

          {isOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={(e) => {
                  e.stopPropagation()
                  setOpenMenuId(null)
                }}
              />
              <div className="border-borderSubtle absolute top-full right-0 z-50 mt-1 w-44 overflow-hidden rounded-xl border bg-white shadow-lg">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setOpenMenuId(null)
                    openDetail(msg)
                  }}
                  className="font-jakarta text-brand flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm hover:bg-gray-50"
                >
                  <Eye size={14} className="text-brand/40" />
                  View message
                </button>
                <div className="border-borderSubtle mx-3 border-t" />
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setOpenMenuId(null)
                    setDeleteTarget({ name: msg.title })
                  }}
                  className="font-jakarta text-danger hover:bg-danger/4 flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm"
                >
                  <Trash2 size={14} />
                  Delete message
                </button>
              </div>
            </>
          )}
        </div>
      )
    },
  }

  const tabFiltered =
    activeTab === "Announcements"
      ? messages.filter((m) => m.type === "Announcement")
      : activeTab === "SMS"
        ? messages.filter((m) => m.type === "SMS")
        : activeTab === "Drafts"
          ? messages.filter((m) => m.status === "draft")
          : messages

  const baseFiltered = applyTableFilters(tabFiltered, {
    search: debouncedSearch,
    searchKeys: ["title", "sentTo"],
    filters,
    filterKeys: ["status", "type"],
    dateKey: "sentAt",
  })
  const filtered = filters.channels?.length
    ? baseFiltered.filter((m) =>
        filters.channels!.some((ch) =>
          m.channels.includes(ch as "Email" | "SMS" | "Push" | "In-app"),
        ),
      )
    : baseFiltered
  const activeFiltersCount = Object.values(filters).reduce((s, v) => s + v.length, 0)
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize)

  return (
    <div className="page-bg min-h-full">
      {/* ── Page header ── */}
      <div className="border-borderSubtle flex flex-col justify-between gap-3 border-b bg-white p-4 md:flex-row md:items-center md:p-6">
        <div>
          <h1 className="font-jakarta text-brand text-base font-semibold tracking-[-0.04em]">
            Messaging
          </h1>
          <p className="font-jakarta text-brand/60 mt-0.5 text-sm font-medium tracking-[-0.04em]">
            Send announcements and messages to customers
          </p>
        </div>
        <Button
          variant="secondary"
          className="font-jakarta rounded px-5 text-sm font-semibold"
          beforeIcon={<Plus size={14} />}
          onClick={() => setComposeOpen(true)}
        >
          New message
        </Button>
      </div>

      {/* ── Metric cards ── */}
      {metrics && (
        <div className="no-scrollbar flex grid-cols-3 gap-3 overflow-x-auto p-4 lg:grid lg:grid-cols-5 lg:p-6">
          {(
            [
              { label: "Total", value: metrics.total },
              { label: "Sent", value: metrics.sent },
              { label: "Scheduled", value: metrics.scheduled },
              { label: "Draft", value: metrics.draft },
              { label: "Failed", value: metrics.failed },
            ] as const
          ).map((m) => (
            <MetricCard key={m.label} label={m.label} value={m.value} />
          ))}
        </div>
      )}

      {/* ── Table section ── */}
      <div className="lg:border-borderSubtle mb-6 overflow-hidden lg:mx-6 lg:rounded-xl lg:border lg:bg-white">
        {/* Tabs */}
        <div className="border-borderSubtle no-scrollbar mb-4 flex gap-0 overflow-x-auto border-b px-4 lg:mb-0">
          {TABS.map((tab) => (
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

        <TableToolbar
          search={search}
          onSearchChange={setSearch}
          placeholder="Search messages"
          onFilterClick={() => setShowFilter(true)}
          activeFiltersCount={activeFiltersCount}
        />

        {/* Desktop table */}
        <div className="hidden lg:block">
          <DataTable
            columns={[...messageColumns.filter((col) => col.id !== "actions"), actionsColumn]}
            data={paginated}
            getRowId={(row) => row.id}
            onRowClick={openDetail}
            isLoading={isLoadingMessages}
            pagination={{
              page,
              pageSize,
              total: filtered.length,
              onPageChange: setPage,
              onPageSizeChange: (s) => {
                setPageSize(s)
                setPage(1)
              },
              entityLabel: "messages",
            }}
          />
        </div>

        {/* Mobile cards */}
        <div className="space-y-2 px-4 py-4 lg:hidden">
          {paginated.map((msg) => (
            <MobileMessageCard key={msg.id} msg={msg} onClick={() => openDetail(msg)} />
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

      {openMenuId && <div className="fixed inset-0 z-30" onClick={() => setOpenMenuId(null)} />}

      <ComposeMessageModal open={composeOpen} onClose={() => setComposeOpen(false)} />
      <MessageDetailModal
        open={showDetail}
        onClose={() => {
          setShowDetail(false)
          setSelectedMessage(null)
        }}
        messageId={selectedMessage?.id ?? null}
        message={selectedMessage}
      />
      <DeleteConfirmModal
        isOpen={!!deleteTarget}
        entityType="message"
        entityName={deleteTarget?.name ?? ""}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => setDeleteTarget(null)}
      />
      <FilterModal
        isOpen={showFilter}
        onClose={() => setShowFilter(false)}
        title="Filter messages"
        fields={MESSAGE_FILTERS}
        values={filters}
        onApply={setFilters}
      />
    </div>
  )
}

// ── Filter config ───────────────────────────────────────────────────────────────

const MESSAGE_FILTERS = [
  {
    key: "status",
    label: "Status",
    options: [
      { label: "Sent", value: "sent" },
      { label: "Scheduled", value: "scheduled" },
      { label: "Draft", value: "draft" },
      { label: "Failed", value: "failed" },
    ],
  },
  {
    key: "type",
    label: "Type",
    options: [
      { label: "Announcement", value: "Announcement" },
      { label: "SMS", value: "SMS" },
      { label: "Promotional", value: "Promotional" },
      { label: "Transactional", value: "Transactional" },
    ],
  },
  {
    key: "channels",
    label: "Channel",
    options: [
      { label: "Email", value: "Email" },
      { label: "SMS", value: "SMS" },
      { label: "Push", value: "Push" },
      { label: "In-app", value: "In-app" },
    ],
  },
  { type: "date-range" as const, key: "date", label: "Date sent" },
]
