import { useState, useMemo } from "react"
import { StatusBadge } from "@/components/ui/data-table"
import DataTable from "@/components/ui/data-table"
import FloatingPagination from "@/components/ui/floating-pagination"
import TableToolbar from "@/components/shared/table-toolbar"
import { useGetCustomerCampaigns } from "@/store/queries/customers"
import { formatDateToCustomFormat } from "@/lib/utils"
import { makeCampaignColumns, CAMPAIGN_STATUS_CONFIG } from "@/components/table-columns/campaigns"
import CampaignDetailModal from "@/components/customer/campaign-detail-modal"
import type { Campaign } from "@/types/customers"

export default function CampaignsTab() {
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null)
  const [showDetail, setShowDetail] = useState(false)

  const { data, isLoading } = useGetCustomerCampaigns({ currentPage: page, pageSize, search })
  const campaigns = data?.items ?? []
  const total = data?.total_count ?? 0
  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  const columns = useMemo(
    () =>
      makeCampaignColumns((c) => {
        setSelectedCampaign(c)
        setShowDetail(true)
      }),
    [],
  )

  return (
    <>
      <div>
        <TableToolbar
          search={search}
          onSearchChange={setSearch}
          placeholder="Search campaigns"
          exportProps={{ currentData: campaigns, filename: "campaigns" }}
        />

        {/* Desktop table */}
        <div className="hidden lg:block">
          <DataTable
            columns={columns}
            data={campaigns}
            getRowId={(row) => row.id}
            isLoading={isLoading}
            pagination={{
              page,
              pageSize,
              total,
              onPageChange: setPage,
              onPageSizeChange: (s) => {
                setPageSize(s)
                setPage(1)
              },
              entityLabel: "campaigns",
            }}
          />
        </div>

        {/* Mobile cards */}
        <div className="space-y-2 px-4 lg:hidden">
          {campaigns.map((campaign) => (
            <MobileCampaignCard
              key={campaign.id}
              campaign={campaign}
              onView={() => {
                setSelectedCampaign(campaign)
                setShowDetail(true)
              }}
            />
          ))}
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
      </div>

      <CampaignDetailModal
        isOpen={showDetail}
        onClose={() => setShowDetail(false)}
        campaign={selectedCampaign}
      />
    </>
  )
}

// ── Sub-components ─────────────────────────────────────────────────────────────

const MobileCampaignCard = ({ campaign, onView }: { campaign: Campaign; onView: () => void }) => {
  const cfg = CAMPAIGN_STATUS_CONFIG[campaign.status] ?? {
    label: campaign.status,
    variant: "default" as const,
  }
  return (
    <button
      onClick={onView}
      className="border-borderSubtle w-full rounded-lg border bg-white p-4 text-left transition-colors hover:bg-gray-50"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-jakarta text-brand truncate text-sm font-semibold">
            {campaign.subject}
          </p>
          <p className="font-jakarta text-brand/50 mt-0.5 text-xs">
            {campaign.recipientCount.toLocaleString()} recipients ·{" "}
            {formatDateToCustomFormat(campaign.createdAt, true)}
          </p>
        </div>
        <StatusBadge label={cfg.label} variant={cfg.variant} dot />
      </div>
    </button>
  )
}
