import { X } from "lucide-react"
import { formatDateToCustomFormat } from "@/lib/utils"
import Modal from "@/components/ui/modal"
import { StatusBadge } from "@/components/ui/data-table"
import { Skeleton } from "@/components/ui/skeleton"
import { useGetCustomerCampaignById } from "@/store/queries/customers"
import { CAMPAIGN_STATUS_CONFIG } from "@/components/table-columns/campaigns"
import type { Campaign } from "@/types/customers"

interface Props {
  isOpen: boolean
  onClose: () => void
  campaign: Campaign | null
}

export default function CampaignDetailModal({ isOpen, onClose, campaign }: Props) {
  const { data: detail, isLoading } = useGetCustomerCampaignById(campaign?.id ?? null)

  if (!campaign) return null

  const cfg = CAMPAIGN_STATUS_CONFIG[campaign.status] ?? {
    label: campaign.status,
    variant: "default" as const,
  }

  const customHeader = (
    <div className="border-line shrink-0 border-b px-6 py-4">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="font-jakarta text-brand text-base font-semibold tracking-[-0.04em]">
            Campaign detail
          </h2>
          <p className="font-jakarta text-brand/60 mt-0.5 text-sm font-medium tracking-[-0.04em]">
            {formatDateToCustomFormat(campaign.createdAt, true)}
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

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      variant="drawer"
      customHeader={customHeader}
      width="560px"
    >
      <div className="flex-1 overflow-y-auto px-6 py-5">
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="border-borderSubtle flex items-center justify-between border-b pb-4"
              >
                <Skeleton className="h-3 w-28" />
                <Skeleton className="h-3 w-40" />
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-0">
            <DetailRow label="Subject" value={campaign.subject} />
            <DetailRow
              label="Status"
              value={<StatusBadge label={cfg.label} variant={cfg.variant} dot />}
            />
            <DetailRow label="Recipients" value={campaign.recipientCount.toLocaleString()} />
            <DetailRow
              label="Sent"
              value={(detail?.sentCount ?? campaign.sentCount).toLocaleString()}
            />
            {detail && detail.failedCount > 0 && (
              <DetailRow label="Failed" value={detail.failedCount.toLocaleString()} />
            )}
            <DetailRow
              label="Date sent"
              value={formatDateToCustomFormat(campaign.createdAt, true)}
            />
            {detail?.updatedAt && (
              <DetailRow
                label="Last updated"
                value={formatDateToCustomFormat(detail.updatedAt, true)}
              />
            )}
            {detail?.lastError && (
              <div className="border-borderSubtle border-b py-4">
                <p className="font-jakarta text-brand/50 mb-1 text-xs font-medium">Last error</p>
                <p className="font-jakarta text-danger text-sm">{detail.lastError}</p>
              </div>
            )}
            <div className="border-borderSubtle border-b py-4">
              <p className="font-jakarta text-brand/50 mb-2 text-xs font-medium">Message</p>
              <p className="font-jakarta text-brand text-sm leading-relaxed whitespace-pre-wrap">
                {campaign.message}
              </p>
            </div>
          </div>
        )}
      </div>
    </Modal>
  )
}

const DetailRow = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="border-borderSubtle flex items-center justify-between border-b py-3.5">
    <span className="font-jakarta text-brand/50 text-sm">{label}</span>
    <span className="font-jakarta text-brand text-sm font-medium">{value}</span>
  </div>
)
