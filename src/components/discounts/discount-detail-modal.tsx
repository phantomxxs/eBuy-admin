import { useState } from "react"
import type { ReactNode } from "react"
import { X } from "lucide-react"
import Modal from "@/components/ui/modal"
import { Button } from "@/components/ui/button"
import DeleteConfirmModal from "@/components/ui/delete-confirm-modal"
import { StatusBadge } from "@/components/ui/data-table"
import type { Discount } from "@/types/discounts"
import EditDiscountModal from "./edit-discount-modal"
import { DISCOUNT_STATUS_CONFIG } from "../table-columns/discounts"
import { useGetDiscountById } from "@/store/queries/discounts"
import { useChangeDiscountStatus, useDeleteDiscount } from "@/store/mutations/discounts"

interface Props {
  isOpen: boolean
  onClose: () => void
  discount: Discount | null
}

export default function DiscountDetailModal({ isOpen, onClose, discount }: Props) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showPauseConfirm, setShowPauseConfirm] = useState(false)
  const [showEdit, setShowEdit] = useState(false)

  const { data: detail } = useGetDiscountById(discount?.id ?? null)
  const deleteDiscount = useDeleteDiscount()
  const changeStatus = useChangeDiscountStatus()

  if (!discount) return null

  const d = detail ?? discount
  const statusCfg = DISCOUNT_STATUS_CONFIG[d.status]

  const customHeader = (
    <div className="border-line shrink-0 border-b px-6 py-4">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="font-jakarta text-brand text-base font-semibold tracking-[-0.04em]">
            {d.name}
          </h2>
          <p className="font-jakarta text-brand/60 mt-0.5 text-sm font-medium tracking-[-0.04em]">
            {d.discount} · {d.duration}
          </p>
        </div>
        <button
          onClick={onClose}
          className="text-brand/40 hover:text-brand ml-4 shrink-0 rounded p-0.5 transition-colors"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  )

  const customFooter = (
    <div className="border-borderSubtle shrink-0 border-t p-4 sm:p-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
        {d.status === "active" ? (
          <Button
            variant="subtle"
            className="flex-1"
            disabled={changeStatus.isPending}
            onClick={() => setShowPauseConfirm(true)}
          >
            Pause discount
          </Button>
        ) : (
          <Button
            variant="ghost"
            className="border-statusSuccess/20 bg-statusSuccessBg text-statusSuccess hover:bg-statusSuccess/10 flex-1 border"
            loading={changeStatus.isPending}
            onClick={() => changeStatus.mutate({ id: discount.id, payload: { status: "active" } })}
          >
            Activate discount
          </Button>
        )}
        <Button
          variant="ghost"
          className="border-danger/8 bg-danger/4 text-danger hover:bg-danger/8 flex-1 border"
          onClick={() => setShowDeleteConfirm(true)}
        >
          Delete discount
        </Button>
        <Button variant="secondary" className="flex-1" onClick={() => setShowEdit(true)}>
          Edit discount
        </Button>
      </div>
    </div>
  )

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        variant="drawer"
        customHeader={customHeader}
        customFooter={customFooter}
        width="652px"
      >
        <div className="flex-1 overflow-y-auto px-6 py-5">
          <div className="grid grid-cols-3 gap-3">
            <MiniMetric label="Times used" value={(detail?.timesUsed ?? d.used).toLocaleString()} />
            <MiniMetric
              label="Total revenue"
              value={detail ? `₦${detail.totalRevenue.toLocaleString()}` : "—"}
            />
            <MiniMetric
              label="Avg. order value"
              value={detail ? `₦${detail.avgOrderValue.toLocaleString()}` : "—"}
            />
          </div>

          <SectionLabel title="DISCOUNT DETAILS" />

          <DetailRow label="Type">{d.type}</DetailRow>
          <DetailRow label="Discount">{d.discount}</DetailRow>
          <DetailRow label="Applies to">{d.appliesTo}</DetailRow>
          <DetailRow label="Eligibility">
            {detail?.customerEligibility?.replace(/_/g, " ") ?? "All customers"}
          </DetailRow>
          <DetailRow label="Usage limit">
            {detail
              ? detail.usageLimit === 0
                ? "Unlimited"
                : detail.usageLimit.toLocaleString()
              : "—"}
          </DetailRow>
          <DetailRow label="Start date">{d.startDate}</DetailRow>
          <DetailRow label="End date">{d.endDate}</DetailRow>
          <DetailRow label="Status">
            <StatusBadge label={statusCfg.label} variant={statusCfg.variant} dot />
          </DetailRow>
          {detail?.createdBy && <DetailRow label="Created by">{detail.createdBy}</DetailRow>}
        </div>
      </Modal>

      <DeleteConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={() => {
          deleteDiscount.mutate(discount.id, {
            onSuccess: () => {
              setShowDeleteConfirm(false)
              onClose()
            },
          })
        }}
        entityType="discount"
        entityName={discount.name}
        isLoading={deleteDiscount.isPending}
      />
      <DeleteConfirmModal
        isOpen={showPauseConfirm}
        onClose={() => setShowPauseConfirm(false)}
        onConfirm={() => {
          changeStatus.mutate(
            { id: discount.id, payload: { status: "draft" } },
            { onSuccess: () => setShowPauseConfirm(false) },
          )
        }}
        entityType="discount"
        entityName={discount.name}
        variant="pause"
        isLoading={changeStatus.isPending}
      />
      <EditDiscountModal
        isOpen={showEdit}
        onClose={() => setShowEdit(false)}
        discount={detail ?? discount}
      />
    </>
  )
}

// ── Sub-components ─────────────────────────────────────────────────────────────

const MiniMetric = ({ label, value }: { label: string; value: string }) => (
  <div className="border-borderSubtle rounded-xl border p-3 sm:p-4">
    <p className="font-jakarta text-brand/50 text-xs">{label}</p>
    <p className="font-jakarta text-brand mt-1 text-sm font-semibold sm:text-base">{value}</p>
  </div>
)

const SectionLabel = ({ title }: { title: string }) => (
  <p className="font-jakarta text-brand/60 mt-5 mb-2 text-sm font-bold tracking-[-0.04em] uppercase">
    {title}
  </p>
)

const DetailRow = ({ label, children }: { label: string; children: ReactNode }) => (
  <div className="border-borderSubtle flex items-center justify-between gap-4 border-b py-3">
    <span className="font-jakarta text-brand/50 shrink-0 text-sm">{label}</span>
    <span className="font-jakarta text-brand text-right text-sm font-medium">{children}</span>
  </div>
)
