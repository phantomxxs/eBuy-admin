import { useState, useMemo } from "react"
import { useDebounce } from "@/hooks/useDebounce"
import { Star } from "lucide-react"
import DataTable from "@/components/ui/data-table"
import { StatusBadge } from "@/components/ui/data-table"
import FloatingPagination from "@/components/ui/floating-pagination"
import MetricCard from "@/components/shared/metric-card"
import TableToolbar from "@/components/shared/table-toolbar"
import FilterModal, { type FilterValues } from "@/components/shared/filter-modal"
import DeleteConfirmModal from "@/components/ui/delete-confirm-modal"
import ReviewDetailModal from "@/components/reviews/review-detail-modal"
import PageSkeleton from "@/components/shared/page-skeleton"
import { makeReviewColumns, REVIEW_STATUS_CONFIG } from "@/components/table-columns/reviews"
import { useGetReviews, useGetReviewStats } from "@/store/queries/reviews"
import {
  useUpdateReviewStatus,
  useDeleteReview,
  useExportReviewsCSV,
} from "@/store/mutations/reviews"
import { showAlert } from "@/store/alerts"
import { formatDateToCustomFormat } from "@/lib/utils"
import type { Review } from "@/types/reviews"

export default function ReviewsPage() {
  const [search, setSearch] = useState("")
  const debouncedSearch = useDebounce(search)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [showFilter, setShowFilter] = useState(false)
  const [filters, setFilters] = useState<FilterValues>({})
  const [selectedReview, setSelectedReview] = useState<Review | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Review | null>(null)

  const { data: stats, isLoading } = useGetReviewStats()
  const { data: reviewsData, isLoading: isLoadingReviews } = useGetReviews({
    search: debouncedSearch,
    pageSize,
    currentPage: page,
    status: filters.status?.join(",") || undefined,
    rating: filters.rating?.[0] ? Number(filters.rating[0]) : undefined,
    dateFrom: filters.date_from?.[0],
    dateTo: filters.date_to?.[0],
  })

  const exportCSV = useExportReviewsCSV()
  const updateStatus = useUpdateReviewStatus()
  const deleteReview = useDeleteReview()

  const reviews = reviewsData?.items ?? []
  const totalCount = reviewsData?.total_count ?? 0
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize))

  const handleApprove = (review: Review) => {
    updateStatus.mutate(
      { id: String(review.review_id), status: "approved" },
      {
        onSuccess: () => showAlert({ variant: "success", message: "Review approved" }),
        onError: (e) => showAlert({ variant: "error", message: e.message }),
      },
    )
  }

  const handleReject = (review: Review) => {
    updateStatus.mutate(
      { id: String(review.review_id), status: "rejected" },
      {
        onSuccess: () => showAlert({ variant: "success", message: "Review rejected" }),
        onError: (e) => showAlert({ variant: "error", message: e.message }),
      },
    )
  }

  const handleDelete = () => {
    if (!deleteTarget) return
    deleteReview.mutate(String(deleteTarget.review_id), {
      onSuccess: () => showAlert({ variant: "success", message: "Review deleted" }),
      onError: (e) => showAlert({ variant: "error", message: e.message }),
      onSettled: () => setDeleteTarget(null),
    })
  }

  const columns = useMemo(
    () =>
      makeReviewColumns(
        (r) => setSelectedReview(r),
        handleApprove,
        handleReject,
        (r) => setDeleteTarget(r),
      ),
    [],
  )

  const activeFiltersCount = Object.values(filters).reduce((s, v) => s + v.length, 0)

  if (isLoading) return <PageSkeleton metricCount={4} />

  return (
    <div className="page-bg min-h-full">
      {/* ── Page header ── */}
      <div className="border-borderSubtle flex flex-col justify-between gap-3 border-b bg-white p-4 lg:flex-row lg:items-center lg:p-6">
        <div>
          <h1 className="font-jakarta text-brand text-base font-semibold tracking-[-0.04em]">
            Reviews
          </h1>
          <p className="font-jakarta text-brand/60 mt-0.5 text-sm font-medium tracking-[-0.04em]">
            Manage customer product reviews
          </p>
        </div>
      </div>

      {/* ── Metric cards ── */}
      {stats && (
        <div className="no-scrollbar flex grid-cols-4 gap-3 overflow-x-auto p-4 lg:grid lg:p-6">
          {(
            [
              { label: "Total reviews", value: stats.total_reviews ?? 0 },
              { label: "Approved", value: stats.approved_reviews ?? 0 },
              { label: "Pending", value: stats.pending_reviews ?? 0 },
              { label: "Rejected", value: stats.rejected_reviews ?? 0 },
            ] as const
          ).map((m) => (
            <MetricCard key={m.label} label={m.label} value={m.value} />
          ))}
        </div>
      )}

      {/* ── Table section ── */}
      <div className="lg:border-borderSubtle mb-6 overflow-hidden lg:mx-6 lg:rounded-xl lg:border lg:bg-white">
        <TableToolbar
          search={search}
          onSearchChange={(v) => {
            setSearch(v)
            setPage(1)
          }}
          placeholder="Search reviews"
          exportProps={{
            currentData: reviews,
            filename: "reviews",
            onExportAll: () => exportCSV.mutate({}),
          }}
          onFilterClick={() => setShowFilter(true)}
          activeFiltersCount={activeFiltersCount}
        />

        {/* Desktop table */}
        <div className="hidden lg:block">
          <DataTable
            columns={columns}
            data={reviews}
            getRowId={(row) => String(row.review_id)}
            isLoading={isLoadingReviews}
            onRowClick={(row) => setSelectedReview(row)}
            pagination={{
              page,
              pageSize,
              total: totalCount,
              onPageChange: setPage,
              onPageSizeChange: (s) => {
                setPageSize(s)
                setPage(1)
              },
              entityLabel: "reviews",
            }}
          />
        </div>

        {/* Mobile cards */}
        <div className="space-y-2 px-4 lg:hidden">
          {reviews.map((review) => (
            <MobileReviewCard
              key={review.review_id}
              review={review}
              onView={() => setSelectedReview(review)}
              onApprove={() => handleApprove(review)}
              onDelete={() => setDeleteTarget(review)}
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

      <ReviewDetailModal review={selectedReview} onClose={() => setSelectedReview(null)} />

      <DeleteConfirmModal
        isOpen={!!deleteTarget}
        variant="delete"
        entityType="review"
        entityName={deleteTarget?.product_name}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        isLoading={deleteReview.isPending}
      />

      <FilterModal
        isOpen={showFilter}
        onClose={() => setShowFilter(false)}
        title="Filter reviews"
        fields={REVIEW_FILTERS}
        values={filters}
        onApply={(v) => {
          setFilters(v)
          setPage(1)
        }}
      />
    </div>
  )
}

// ── Filter config ─────────────────────────────────────────────────────────────

const REVIEW_FILTERS = [
  {
    key: "status",
    label: "Status",
    options: [
      { label: "Approved", value: "approved" },
      { label: "Pending", value: "pending" },
      { label: "Rejected", value: "rejected" },
    ],
  },
  {
    key: "rating",
    label: "Rating",
    options: [
      { label: "5 stars", value: "5" },
      { label: "4 stars", value: "4" },
      { label: "3 stars", value: "3" },
      { label: "2 stars", value: "2" },
      { label: "1 star", value: "1" },
    ],
  },
  { type: "date-range" as const, key: "date", label: "Date created" },
]

// ── Mobile card ───────────────────────────────────────────────────────────────

const MobileReviewCard = ({
  review,
  onView,
  onApprove,
  onDelete,
}: {
  review: Review
  onView: () => void
  onApprove: () => void
  onDelete: () => void
}) => {
  const cfg = REVIEW_STATUS_CONFIG[review.status]
  return (
    <div className="border-line flex items-start justify-between rounded-lg bg-white p-4">
      <div className="flex min-w-0 flex-col gap-1">
        <p className="font-jakarta text-brand truncate text-sm font-semibold">
          {review.product_name}
        </p>
        <p className="font-jakarta text-brand/50 text-xs">{review.nickname}</p>
        <span className="flex items-center gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              size={11}
              className={i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-brand/20"}
            />
          ))}
        </span>
        <p className="font-jakarta text-brand/60 mt-0.5 max-w-55 truncate text-xs">
          {review.detail}
        </p>
        <p className="font-jakarta text-brand/40 text-xs">
          {formatDateToCustomFormat(review.created_at)}
        </p>
      </div>
      <div className="ml-3 flex shrink-0 flex-col items-end gap-2">
        <StatusBadge label={cfg.label} variant={cfg.variant} dot />
        <div className="flex items-center gap-3">
          <button onClick={onView} className="font-jakarta text-secondary text-xs font-semibold">
            View
          </button>
          {review.status !== "approved" && (
            <button
              onClick={onApprove}
              className="font-jakarta text-statusSuccess text-xs font-semibold"
            >
              Approve
            </button>
          )}
          <button onClick={onDelete} className="font-jakarta text-danger text-xs font-semibold">
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}
