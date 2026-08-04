import { X, Star } from "lucide-react"
import Modal from "@/components/ui/modal"
import { StatusBadge } from "@/components/ui/data-table"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { formatDateToCustomFormat } from "@/lib/utils"
import { useGetReviewById } from "@/store/queries/reviews"
import { useUpdateReviewStatus } from "@/store/mutations/reviews"
import { showAlert } from "@/store/alerts"
import { REVIEW_STATUS_CONFIG } from "@/components/table-columns/reviews"
import type { Review } from "@/types/reviews"

interface ReviewDetailModalProps {
  review: Review | null
  onClose: () => void
}

export default function ReviewDetailModal({ review: reviewProp, onClose }: ReviewDetailModalProps) {
  const { data: fetched, isLoading } = useGetReviewById(
    reviewProp?.review_id ? String(reviewProp.review_id) : null,
  )
  const review = fetched ?? reviewProp

  const updateStatus = useUpdateReviewStatus()

  const handleApprove = () => {
    if (!review) return
    updateStatus.mutate(
      { id: String(review.review_id), status: "approved" },
      {
        onSuccess: () => showAlert({ variant: "success", message: "Review approved" }),
        onError: (e) => showAlert({ variant: "error", message: e.message }),
      },
    )
  }

  const handleReject = () => {
    if (!review) return
    updateStatus.mutate(
      { id: String(review.review_id), status: "rejected" },
      {
        onSuccess: () => showAlert({ variant: "success", message: "Review rejected" }),
        onError: (e) => showAlert({ variant: "error", message: e.message }),
      },
    )
  }

  const customHeader = review ? (
    <div className="border-brand/3 flex items-start justify-between border-b px-4 py-4 md:px-6">
      <div className="flex flex-col gap-1">
        <h2 className="font-jakarta text-brand text-sm font-semibold tracking-[-0.04em] md:text-base">
          Review
        </h2>
        <p className="font-jakarta text-brand/60 text-xs font-medium tracking-[-0.04em] md:text-sm">
          {review.product_name}
        </p>
      </div>
      <button
        onClick={onClose}
        className="text-brand/40 hover:bg-brand/5 hover:text-brand flex h-7 w-7 items-center justify-center rounded-full transition-colors"
      >
        <X size={16} />
      </button>
    </div>
  ) : null

  const customFooter = review ? (
    <div className="border-borderSubtle flex flex-col-reverse gap-2 border-t px-4 py-4 sm:flex-row sm:gap-3 md:px-6">
      {review.status !== "approved" && (
        <Button
          variant="success"
          onClick={handleApprove}
          loading={updateStatus.isPending}
          disabled={updateStatus.isPending}
          className="flex-1"
        >
          Approve
        </Button>
      )}
      {review.status !== "rejected" && (
        <Button
          variant="outline"
          onClick={handleReject}
          disabled={updateStatus.isPending}
          className="flex-1"
        >
          Reject
        </Button>
      )}
    </div>
  ) : null

  return (
    <Modal
      isOpen={!!reviewProp}
      onClose={onClose}
      variant="drawer"
      position="right"
      width="520px"
      customHeader={customHeader}
      customFooter={customFooter}
      preventClose={updateStatus.isPending}
    >
      {isLoading ? (
        <div className="flex flex-col gap-4 px-4 py-4 md:px-6">
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="border-borderSubtle flex items-center justify-between border-t border-b py-3 [&+&]:border-t-0"
              >
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-3 w-32" />
              </div>
            ))}
          </div>
        </div>
      ) : review ? (
        <div className="no-scrollbar flex-1 overflow-y-auto px-4 py-4 md:px-6">
          <ReviewDetailContent review={review} />
        </div>
      ) : null}
    </Modal>
  )
}

const ReviewDetailContent = ({ review }: { review: Review }) => {
  const cfg = REVIEW_STATUS_CONFIG[review.status]
  const fields: { label: string; value: React.ReactNode }[] = [
    { label: "Product", value: review.product_name },
    { label: "Customer", value: review.nickname },
    { label: "Email", value: review.customer_email },
    {
      label: "Rating",
      value: (
        <span className="flex items-center gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              size={13}
              className={i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-brand/20"}
            />
          ))}
          <span className="font-jakarta text-brand/60 ml-1 text-xs">{review.rating} / 5</span>
        </span>
      ),
    },
    { label: "Status", value: <StatusBadge label={cfg.label} variant={cfg.variant} dot /> },
    { label: "Date", value: formatDateToCustomFormat(review.created_at, true) },
  ]

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <p className="font-jakarta text-brand/50 text-xs font-bold tracking-widest uppercase">
          Review Information
        </p>
        <div>
          {fields.map((f) => (
            <div
              key={f.label}
              className="border-borderSubtle flex items-center justify-between border-t border-b py-3 [&+&]:border-t-0"
            >
              <span className="font-jakarta text-brand/60 text-sm">{f.label}</span>
              <span className="font-jakarta text-brand text-sm font-medium">{f.value}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <p className="font-jakarta text-brand/50 text-xs font-bold tracking-widest uppercase">
          Title
        </p>
        <p className="font-jakarta text-brand/70 text-sm leading-relaxed font-medium">
          {review.title}
        </p>
      </div>

      <div className="space-y-2">
        <p className="font-jakarta text-brand/50 text-xs font-bold tracking-widest uppercase">
          Review
        </p>
        <p className="font-jakarta text-brand/70 text-sm leading-relaxed font-medium">
          {review.detail}
        </p>
      </div>
    </div>
  )
}
