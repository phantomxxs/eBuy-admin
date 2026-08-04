import { useState } from "react"
import type { ReactNode } from "react"
import { X } from "lucide-react"
import Modal from "@/components/ui/modal"
import { Button } from "@/components/ui/button"
import DeleteConfirmModal from "@/components/ui/delete-confirm-modal"
import { StatusBadge } from "@/components/ui/data-table"
import { useGetBannerById } from "@/store/queries/banners"
import { useDeleteBanner, useChangeBannerStatus } from "@/store/mutations/banners"
import { BANNER_STATUS_CONFIG } from "@/components/table-columns/banners"
import type { Banner } from "@/types/banners"

interface Props {
  isOpen: boolean
  onClose: () => void
  banner: Banner | null
  onEdit?: (banner: Banner) => void
}

export default function BannerDetailModal({ isOpen, onClose, banner, onEdit }: Props) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const { data: detail } = useGetBannerById(banner?.id ?? null)
  const deleteBanner = useDeleteBanner()
  const changeStatus = useChangeBannerStatus()

  if (!banner) return null

  const d = detail ?? banner
  const statusCfg = BANNER_STATUS_CONFIG[d.status] ?? {
    label: d.status,
    variant: "neutral" as const,
  }

  const customHeader = (
    <DrawerHeader title={d.title} subtitle={`${d.type} · ${d.duration}`} onClose={onClose} />
  )

  const isActive = d.status === "active"

  const customFooter = (
    <div className="border-borderSubtle flex items-center justify-between border-t px-6 py-4">
      <Button
        variant="ghost"
        className="text-brand/60 hover:bg-gray-50"
        disabled={changeStatus.isPending}
        loading={changeStatus.isPending}
        onClick={() =>
          changeStatus.mutate({
            id: banner.id,
            payload: { status: isActive ? "inactive" : "active" },
          })
        }
      >
        {isActive ? "Pause banner" : "Resume banner"}
      </Button>
      <div className="flex gap-3">
        <Button
          variant="ghost"
          className="border-danger/8 bg-danger/4 text-danger hover:bg-danger/8 border"
          onClick={() => setShowDeleteConfirm(true)}
        >
          Delete banner
        </Button>
        <Button
          variant="secondary"
          onClick={() => {
            onClose()
            onEdit?.(banner)
          }}
        >
          Edit banner
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
        <div className="px-6 py-5">
          {d.imageUrl && (
            <div className="border-borderSubtle mb-4 overflow-hidden rounded-xl border">
              <img src={d.imageUrl} alt={d.title} className="h-40 w-full object-cover" />
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <MiniMetric label="Impressions" value={d.impressions.toLocaleString()} />
            <MiniMetric label="Clicks" value={(detail?.clicks ?? 0).toLocaleString()} />
            <MiniMetric label="Click-Through Rate" value={d.ctr} />
            <MiniMetric
              label="Conversions"
              value={
                detail
                  ? `${detail.conversions} (${(detail.conversionRate * 100).toFixed(1)}%)`
                  : "—"
              }
            />
          </div>

          <SectionHeader title="BANNER DETAILS" />

          <DetailRow label="Type">{d.type}</DetailRow>
          <DetailRow label="Hero banner">{d.isHeroBanner ? "Yes" : "No"}</DetailRow>
          <DetailRow label="Placement">{d.placement}</DetailRow>
          <DetailRow label="Target audience">{d.targetCustomers}</DetailRow>
          {detail?.ctaLabel && <DetailRow label="CTA">{detail.ctaLabel}</DetailRow>}
          {detail?.ctaLink && <DetailRow label="CTA link">{detail.ctaLink}</DetailRow>}
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
          deleteBanner.mutate(banner.id, {
            onSuccess: () => {
              setShowDeleteConfirm(false)
              onClose()
            },
          })
        }}
        entityType="banner"
        entityName={banner.title}
        isLoading={deleteBanner.isPending}
      />
    </>
  )
}

// ── Sub-components ─────────────────────────────────────────────────────────────

const DrawerHeader = ({
  title,
  subtitle,
  onClose,
}: {
  title: string
  subtitle?: string
  onClose: () => void
}) => (
  <div className="border-borderSubtle border-b px-6 py-5">
    <div className="flex items-start justify-between">
      <div>
        <h2 className="font-jakarta text-brand text-base font-semibold">{title}</h2>
        {subtitle && <p className="font-jakarta text-brand/50 mt-0.5 text-sm">{subtitle}</p>}
      </div>
      <button
        onClick={onClose}
        className="text-brand/40 hover:text-brand rounded p-1 transition-colors"
      >
        <X size={16} />
      </button>
    </div>
  </div>
)

const MiniMetric = ({ label, value }: { label: string; value: string }) => (
  <div className="border-borderSubtle rounded-xl border p-4">
    <p className="font-jakarta text-brand/50 text-xs">{label}</p>
    <p className="font-jakarta text-brand mt-1 text-lg font-semibold">{value}</p>
  </div>
)

const SectionHeader = ({ title }: { title: string }) => (
  <p className="font-jakarta text-xxs text-brand/35 mt-5 mb-2 font-semibold tracking-widest uppercase">
    {title}
  </p>
)

const DetailRow = ({ label, children }: { label: string; children: ReactNode }) => (
  <div className="border-borderSubtle flex items-center justify-between border-b py-3">
    <span className="font-jakarta text-brand/50 text-sm">{label}</span>
    <span className="font-jakarta text-brand text-sm font-medium">{children}</span>
  </div>
)
