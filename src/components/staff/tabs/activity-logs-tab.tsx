import { useState } from "react"
import { Filter, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import SearchIcon from "@/components/shared/search-icon"
import { Skeleton } from "@/components/ui/skeleton"
import { WithTooltip } from "@/components/ui/tooltip"
import FilterModal, { type FilterValues } from "@/components/shared/filter-modal"
import TablePagination from "@/components/ui/table-pagination"
import FloatingPagination from "@/components/ui/floating-pagination"
import { parseDateStr } from "@/utils/date"
import { useGetStaffLogs } from "@/store/queries/staff"
import type { UserActivityLog } from "@/types/staff"

const LOG_FILTERS = [
  {
    key: "target_type",
    label: "Type",
    options: ["auth", "role", "staff", "invite"].map((s) => ({ label: s, value: s })),
  },
  { type: "date-range" as const, key: "date", label: "Date" },
]

export default function ActivityLogsTab() {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const { data, isLoading } = useGetStaffLogs(page, pageSize)
  const userLogs = data?.items ?? []
  const totalCount = data?.total_count ?? 0
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize))

  const [logSearch, setLogSearch] = useState("")
  const [logFilters, setLogFilters] = useState<FilterValues>({})
  const [showLogFilter, setShowLogFilter] = useState(false)

  const filteredLogs = (() => {
    let result = userLogs
    if (logSearch)
      result = result.filter(
        (l) =>
          l.activity.toLowerCase().includes(logSearch.toLowerCase()) ||
          l.by.toLowerCase().includes(logSearch.toLowerCase()) ||
          l.target_type.toLowerCase().includes(logSearch.toLowerCase()),
      )
    if (logFilters.target_type?.length)
      result = result.filter((l) => logFilters.target_type!.includes(l.target_type))
    if (logFilters.date_from?.[0] || logFilters.date_to?.[0]) {
      const from = logFilters.date_from?.[0] ? new Date(logFilters.date_from[0]) : null
      const to = logFilters.date_to?.[0] ? new Date(logFilters.date_to[0] + "T23:59:59") : null
      result = result.filter((l) => {
        const d = parseDateStr(l.date)
        if (!d) return true
        if (from && d < from) return false
        if (to && d > to) return false
        return true
      })
    }
    return result
  })()

  return (
    <>
      <div className="border-borderSubtle flex items-center gap-2 border-b px-4 py-4 md:p-4">
        <div className="border-borderSubtle flex flex-1 items-center gap-2 rounded-full border bg-white px-4 py-2.5 lg:max-w-125">
          <SearchIcon />
          <input
            value={logSearch}
            onChange={(e) => setLogSearch(e.target.value)}
            placeholder="Search activity logs"
            className="font-jakarta text-brand placeholder:text-brand/60 flex-1 bg-transparent text-sm tracking-[-0.04em] outline-none"
          />
        </div>
        {/* Mobile: icon-only buttons */}
        <div className="flex items-center gap-2 lg:hidden">
          <Button variant="outline" size="icon" onClick={() => setShowLogFilter(true)}>
            <Filter size={15} />
          </Button>
        </div>
        {/* Desktop: labelled buttons */}
        <div className="hidden items-center gap-3 lg:flex">
          <button
            onClick={() => setShowLogFilter(true)}
            className="font-jakarta text-brand/70 border-borderSubtle flex w-fit items-center gap-2 rounded-lg border bg-white px-4 py-2.5 text-sm font-medium transition-colors hover:bg-gray-50"
          >
            <Filter size={14} />
            Filter
          </button>
        </div>
      </div>

      {isLoading ? (
        <>
          {/* Desktop skeleton */}
          <div className="hidden lg:block">
            <div className="border-borderSubtle flex gap-8 border-b px-4 py-3">
              {[60, 200, 100, 80].map((w, i) => (
                <Skeleton key={i} className="h-2.5" style={{ width: w }} />
              ))}
            </div>
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="border-borderSubtle flex items-center gap-8 border-b px-4 py-4"
              >
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-3 w-52" />
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-3 w-24" />
              </div>
            ))}
          </div>

          {/* Mobile skeleton */}
          <div className="space-y-2 px-4 py-4 lg:hidden">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="border-line rounded-lg border bg-white p-4">
                <Skeleton className="h-3 w-48" />
                <div className="mt-2 flex items-center justify-between">
                  <div className="flex gap-3">
                    <Skeleton className="h-2.5 w-20" />
                    <Skeleton className="h-2.5 w-16" />
                  </div>
                  <Skeleton className="h-2.5 w-20" />
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden overflow-x-auto lg:block">
            <table className="w-full">
              <thead>
                <tr className="border-borderSubtle border-b">
                  {["DATE", "ACTIVITY", "TYPE", "BY"].map((h) => (
                    <th
                      key={h}
                      className="font-jakarta text-brand/40 px-4 py-3 text-left text-xs font-semibold tracking-wide uppercase"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log) => (
                  <tr key={log.log_id} className="border-borderSubtle border-b last:border-0">
                    <td className="font-jakarta text-brand/60 px-4 py-4 text-sm whitespace-nowrap">
                      {log.date}
                    </td>
                    <td className="font-jakarta text-brand max-w-xs px-4 py-4 text-sm">
                      <WithTooltip
                        trigger={<span className="block truncate">{log.activity}</span>}
                        content={log.activity}
                      />
                    </td>
                    <td className="font-jakarta text-brand/70 px-4 py-4 text-sm">
                      {log.target_type}
                    </td>
                    <td className="font-jakarta text-brand/70 px-4 py-4 text-sm">{log.by}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <TablePagination
              page={page}
              pageSize={pageSize}
              total={totalCount}
              onPageChange={setPage}
              onPageSizeChange={(s) => {
                setPageSize(s)
                setPage(1)
              }}
              entityLabel="entries"
            />
          </div>

          {/* Mobile cards */}
          <div className="space-y-2 px-4 py-4 pb-20 lg:hidden">
            {filteredLogs.map((log) => (
              <MobileActivityLogCard key={log.log_id} log={log} />
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
        </>
      )}

      <FilterModal
        isOpen={showLogFilter}
        onClose={() => setShowLogFilter(false)}
        title="Filter activity logs"
        fields={LOG_FILTERS}
        values={logFilters}
        onApply={setLogFilters}
      />
    </>
  )
}

const MobileActivityLogCard = ({ log }: { log: UserActivityLog }) => (
  <div className="border-line rounded-lg border bg-white p-4">
    <p className="font-jakarta text-brand text-sm">{log.activity}</p>
    <div className="mt-1.5 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <span className="font-jakarta text-brand/50 text-xs">{log.target_type}</span>
        {log.by && <span className="font-jakarta text-brand/50 text-xs">by {log.by}</span>}
      </div>
      <span className="font-jakarta text-brand/40 text-xs">{log.date}</span>
    </div>
  </div>
)
