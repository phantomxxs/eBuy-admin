import { useState } from "react"
import { Copy, X } from "lucide-react"
import Modal from "@/components/ui/modal"
import { Button } from "@/components/ui/button"
import DeleteConfirmModal from "@/components/ui/delete-confirm-modal"
import { StatusBadge } from "@/components/ui/data-table"
import { cn } from "@/lib/utils"
import type { Voucher } from "@/types/vouchers"
import { VOUCHER_STATUS_CONFIG } from "@/components/table-columns/vouchers"
import { useToggleVoucherStatus, useDeleteVoucher } from "@/store/mutations/vouchers"
import { useGetVoucherById } from "@/store/queries/vouchers"
import EditVoucherModal from "./edit-voucher-modal"

interface Props {
  isOpen: boolean
  onClose: () => void
  voucher: Voucher | null
}

export default function VoucherDetailModal({ isOpen, onClose, voucher: voucherProp }: Props) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showEdit, setShowEdit] = useState(false)
  const [copied, setCopied] = useState(false)

  const toggleStatus = useToggleVoucherStatus()
  const deleteVoucher = useDeleteVoucher()

  const { data: fetchedVoucher } = useGetVoucherById(isOpen ? (voucherProp?.id ?? null) : null)
  const voucher = fetchedVoucher ?? voucherProp

  if (!voucher) return null

  const statusCfg = VOUCHER_STATUS_CONFIG[voucher.status] ?? {
    label: voucher.status,
    variant: "default" as const,
  }
  const usagePct =
    voucher.maxUsage > 0 ? Math.min(100, (voucher.usageCount / voucher.maxUsage) * 100) : 0

  const handleCopy = () => {
    void navigator.clipboard.writeText(voucher.code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleToggle = () => {
    const newStatus = voucher.status === "active" ? "inactive" : "active"
    toggleStatus.mutate({ id: voucher.id, status: newStatus })
  }

  const customHeader = (
    <div className="border-line shrink-0 border-b px-6 py-4">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="font-jakarta text-brand text-base font-semibold tracking-[-0.04em]">
            Voucher details
          </h2>
          {voucher.createdAt && (
            <p className="font-jakarta text-brand/60 mt-0.5 text-sm font-medium tracking-[-0.04em]">
              Created{" "}
              {new Date(voucher.createdAt).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </p>
          )}
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
        {voucher.status === "active" && (
          <Button
            variant="subtle"
            className="flex-1"
            loading={toggleStatus.isPending}
            onClick={handleToggle}
          >
            Deactivate
          </Button>
        )}
        {voucher.status === "inactive" && (
          <Button
            variant="ghost"
            className="border-statusSuccess/20 bg-statusSuccessBg text-statusSuccess hover:bg-statusSuccess/10 flex-1 border"
            loading={toggleStatus.isPending}
            onClick={handleToggle}
          >
            Activate
          </Button>
        )}
        <Button
          variant="ghost"
          className="border-danger/8 bg-danger/4 text-danger hover:bg-danger/8 flex-1 border"
          onClick={() => setShowDeleteConfirm(true)}
          disabled={toggleStatus.isPending}
        >
          Delete
        </Button>
        <Button
          variant="secondary"
          className="flex-1"
          onClick={() => setShowEdit(true)}
          disabled={toggleStatus.isPending}
        >
          Edit voucher
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
        width="560px"
      >
        <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
          {/* Code box */}
          <div className="border-borderSubtle rounded-xl border p-4">
            <p className="font-jakarta text-brand/50 mb-2 text-xs font-semibold tracking-wide uppercase">
              Voucher code
            </p>
            <div className="flex items-center justify-between gap-3">
              <span className="text-brand font-mono text-xl font-bold tracking-widest">
                {voucher.code}
              </span>
              <button
                onClick={handleCopy}
                className={cn(
                  "font-jakarta flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                  copied
                    ? "bg-statusSuccessBg text-statusSuccess"
                    : "border-borderSubtle text-brand/60 hover:text-brand hover:bg-brand/5 border",
                )}
              >
                <Copy size={12} />
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
          </div>

          {/* Discount highlight box */}
          <div className="bg-brand/4 border-brand/10 rounded-xl border p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-jakarta text-brand/60 text-xs font-medium">Discount type</p>
                <p className="font-jakarta text-brand mt-0.5 text-sm font-semibold capitalize">
                  {voucher.discountType === "percentage" ? "Percentage (%)" : "Fixed amount (₦)"}
                </p>
              </div>
              <div className="text-right">
                <p className="font-jakarta text-brand/60 text-xs font-medium">Discount value</p>
                <p className="font-jakarta text-brand mt-0.5 text-lg font-bold">
                  {voucher.discountType === "percentage"
                    ? `${voucher.discountValue}%`
                    : `₦${voucher.discountValue.toLocaleString()}`}
                </p>
              </div>
            </div>
          </div>

          {/* Details rows */}
          <SectionLabel title="DETAILS" />

          <DetailRow label="Validity period">
            {formatDate(voucher.startDate)} → {formatDate(voucher.endDate)}
          </DetailRow>

          <DetailRow label="Status">
            <StatusBadge label={statusCfg.label} variant={statusCfg.variant} dot />
          </DetailRow>

          {/* Usage progress */}
          <SectionLabel title="USAGE" />

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-jakarta text-brand/50 text-sm">
                {voucher.usageCount.toLocaleString()} / {voucher.maxUsage.toLocaleString()} uses
              </span>
              <span className="font-jakarta text-brand/70 text-xs font-medium">
                {Math.round(usagePct)}%
              </span>
            </div>
            <div className="bg-brand/8 h-2 w-full overflow-hidden rounded-full">
              <div
                className={cn(
                  "h-full rounded-full transition-all",
                  usagePct >= 100
                    ? "bg-statusInfo"
                    : usagePct >= 80
                      ? "bg-statusWarning"
                      : "bg-statusSuccess",
                )}
                style={{ width: `${usagePct}%` }}
              />
            </div>
          </div>
        </div>
      </Modal>

      <DeleteConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={() => {
          deleteVoucher.mutate(voucher.id, {
            onSuccess: () => {
              setShowDeleteConfirm(false)
              onClose()
            },
          })
        }}
        entityType="voucher"
        entityName={voucher.code}
        isLoading={deleteVoucher.isPending}
      />

      <EditVoucherModal isOpen={showEdit} onClose={() => setShowEdit(false)} voucher={voucher} />
    </>
  )
}

// ── Sub-components ─────────────────────────────────────────────────────────────

const SectionLabel = ({ title }: { title: string }) => (
  <p className="font-jakarta text-brand/60 text-xs font-semibold tracking-wide uppercase">
    {title}
  </p>
)

const DetailRow = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="border-borderSubtle flex items-center justify-between gap-4 border-b py-3">
    <span className="font-jakarta text-brand/50 shrink-0 text-sm">{label}</span>
    <span className="font-jakarta text-brand text-right text-sm font-medium">{children}</span>
  </div>
)

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}
