import { useState } from "react"
import DataTable from "@/components/ui/data-table"
import FloatingPagination from "@/components/ui/floating-pagination"
import { Skeleton } from "@/components/ui/skeleton"
import TableToolbar from "@/components/shared/table-toolbar"
import FilterModal, { type FilterValues } from "@/components/shared/filter-modal"
import { makeUserColumns } from "@/components/table-columns/staff"
import MobileUserCard from "@/components/staff/mobile-staff-card"
import type { AppUser } from "@/types/staff"

const USER_FILTERS = [
  {
    key: "role",
    label: "Role",
    options: [
      { label: "Super Admin", value: "Super Admin" },
      { label: "Admin", value: "Admin" },
      { label: "Store Manager", value: "Store Manager" },
      { label: "Support", value: "Support" },
      { label: "Analyst", value: "Analyst" },
    ],
  },
  {
    key: "status",
    label: "Status",
    options: [
      { label: "Active", value: "active" },
      { label: "Inactive", value: "inactive" },
      { label: "Pending", value: "pending" },
    ],
  },
]

interface UserDetailsTabProps {
  isLoading: boolean
  users: AppUser[]
  onView: (user: AppUser) => void
  onChangeRole: (user: AppUser) => void
  onSendDraft: (user: AppUser) => void
  onResendInvite: (user: AppUser) => void
  onCancelInvite: (user: AppUser) => void
  onEdit: (user: AppUser) => void
  onDeactivate: (user: AppUser) => void
  onReactivate: (user: AppUser) => void
  onDelete: (user: AppUser) => void
}

export default function UserDetailsTab({
  isLoading,
  users,
  onView,
  onChangeRole,
  onSendDraft,
  onResendInvite,
  onCancelInvite,
  onEdit,
  onDeactivate,
  onReactivate,
  onDelete,
}: UserDetailsTabProps) {
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [showFilter, setShowFilter] = useState(false)
  const [filters, setFilters] = useState<FilterValues>({})

  let filtered = users
  if (search)
    filtered = filtered.filter(
      (u) =>
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase()),
    )
  if (filters.role?.length) filtered = filtered.filter((u) => filters.role!.includes(u.role))
  if (filters.status?.length) filtered = filtered.filter((u) => filters.status!.includes(u.status))
  const activeFiltersCount = Object.values(filters).reduce((s, v) => s + v.length, 0)

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize)

  const columns = makeUserColumns({
    onView,
    onChangeRole,
    onSendDraft,
    onResendInvite,
    onCancelInvite,
    onEdit,
    onDeactivate,
    onReactivate,
    onDelete,
  })

  if (isLoading) {
    return <UserDetailsTabSkeleton />
  }

  return (
    <>
      <TableToolbar
        search={search}
        onSearchChange={setSearch}
        placeholder="Search staff"
        onFilterClick={() => setShowFilter(true)}
        activeFiltersCount={activeFiltersCount}
      />

      <div className="hidden lg:block">
        <DataTable
          columns={columns}
          data={paginated}
          getRowId={(row) => row.id}
          onRowClick={onView}
          pagination={{
            page,
            pageSize,
            total: filtered.length,
            onPageChange: setPage,
            onPageSizeChange: (s) => {
              setPageSize(s)
              setPage(1)
            },
            entityLabel: "staff",
          }}
        />
      </div>

      <div className="space-y-2 px-4 py-4 pb-20 lg:hidden">
        {paginated.map((user) => (
          <MobileUserCard key={user.id} user={user} />
        ))}
      </div>

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
        className="lg:hidden"
      />

      <FilterModal
        isOpen={showFilter}
        onClose={() => setShowFilter(false)}
        title="Filter staff"
        fields={USER_FILTERS}
        values={filters}
        onApply={setFilters}
      />
    </>
  )
}

const UserDetailsTabSkeleton = () => (
  <>
    {/* Toolbar skeleton */}
    <div className="border-borderSubtle flex items-center gap-3 border-b px-4 py-4">
      <Skeleton className="h-10 flex-1 rounded-full" />
      <Skeleton className="h-10 w-24 rounded-lg" />
    </div>

    {/* Desktop table skeleton */}
    <div className="hidden lg:block">
      <div className="border-borderSubtle border-b px-4 py-3">
        <div className="flex gap-4">
          {[120, 180, 100, 80, 100, 60].map((w, i) => (
            <Skeleton key={i} className="h-3" style={{ width: w }} />
          ))}
        </div>
      </div>
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="border-borderSubtle flex items-center gap-4 border-b px-4 py-4">
          <div className="flex items-center gap-3">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="space-y-1.5">
              <Skeleton className="h-3 w-28" />
              <Skeleton className="h-2.5 w-36" />
            </div>
          </div>
          <Skeleton className="ml-auto h-3 w-20" />
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-14 rounded-full" />
          <Skeleton className="h-4 w-4 rounded" />
        </div>
      ))}
    </div>

    {/* Mobile card skeletons */}
    <div className="space-y-2 px-4 py-4 lg:hidden">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="border-borderSubtle rounded-xl border bg-white p-4">
          <div className="flex items-center gap-3">
            <Skeleton className="h-9 w-9 rounded-full" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-3 w-32" />
              <Skeleton className="h-2.5 w-44" />
            </div>
            <Skeleton className="h-5 w-14 rounded-full" />
          </div>
        </div>
      ))}
    </div>

    {/* Footer skeleton */}
    <div className="border-borderSubtle flex items-center justify-between border-t px-4 py-3">
      <Skeleton className="h-3 w-40" />
      <div className="hidden items-center gap-2 lg:flex">
        <Skeleton className="h-8 w-20 rounded-lg" />
        <Skeleton className="h-8 w-8 rounded-lg" />
        <Skeleton className="h-3 w-12" />
        <Skeleton className="h-8 w-8 rounded-lg" />
      </div>
    </div>
  </>
)
