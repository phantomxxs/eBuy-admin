import type { ReactNode } from "react"
import { CheckCircle2 } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { formatDateToCustomFormat } from "@/lib/utils"
import { useGetLocationById } from "@/store/queries/locations"
import type { Location } from "@/types/locations"

interface Props {
  location: Location
}

export default function OverviewTab({ location }: Props) {
  const { data: detail, isLoading } = useGetLocationById(location.id)

  return (
    <div>
      <SectionHeader title="STORE INFORMATION" />
      <DetailRow label="Store name">{location.name}</DetailRow>
      <DetailRow label="Store ID">{location.storeId}</DetailRow>
      <DetailRow label="Status">
        <span className="text-statusSuccess inline-flex items-center gap-1">
          <span className="bg-statusSuccess h-1.5 w-1.5 rounded-full" />
          {location.status.charAt(0).toUpperCase() + location.status.slice(1)}
        </span>
      </DetailRow>
      <DetailRow label="Contact email">
        <span className="flex items-center gap-1.5">
          {location.contact}
          <CheckCircle2 size={14} className="text-statusSuccess" />
        </span>
      </DetailRow>
      <DetailRow label="Contact phone number">
        {isLoading ? <Skeleton className="h-3 w-32" /> : detail?.phone || "—"}
      </DetailRow>
      <DetailRow label="Date created">
        {isLoading ? (
          <Skeleton className="h-3 w-28" />
        ) : detail?.createdAt ? (
          formatDateToCustomFormat(detail.createdAt, true)
        ) : (
          "—"
        )}
      </DetailRow>
      <DetailRow label="Last activity">
        {isLoading ? (
          <Skeleton className="h-3 w-28" />
        ) : detail?.lastActivity ? (
          formatDateToCustomFormat(detail.lastActivity, true)
        ) : (
          "—"
        )}
      </DetailRow>

      <SectionHeader title="ADDRESS" />
      <DetailRow label="State">
        {isLoading ? <Skeleton className="h-3 w-24" /> : detail?.state || "—"}
      </DetailRow>
      <DetailRow label="LGA">
        {isLoading ? <Skeleton className="h-3 w-24" /> : detail?.lga || "—"}
      </DetailRow>
      <DetailRow label="Street address">{location.address}</DetailRow>
    </div>
  )
}

const SectionHeader = ({ title }: { title: string }) => (
  <p className="font-jakarta text-xxs text-brand/35 mt-5 mb-2 font-semibold tracking-widest uppercase first:mt-0">
    {title}
  </p>
)

const DetailRow = ({ label, children }: { label: string; children: ReactNode }) => (
  <div className="border-borderSubtle flex items-center justify-between border-b py-3">
    <span className="font-jakarta text-brand/50 text-sm">{label}</span>
    <span className="font-jakarta text-brand text-sm font-medium">{children}</span>
  </div>
)
