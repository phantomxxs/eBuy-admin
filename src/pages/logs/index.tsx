import { useState } from "react"
import { useDebounce } from "@/hooks/useDebounce"
import DataTable from "@/components/ui/data-table"
import FloatingPagination from "@/components/ui/floating-pagination"
import ExportButton from "@/components/shared/export-button"
import TableToolbar from "@/components/shared/table-toolbar"
import { activityLogColumns } from "@/components/table-columns/activity-logs"
import { useGetActivityLogs } from "@/store/queries/activity-logs"
import MobileLogCard from "@/components/logs/mobile-log-card"

export default function LogsPage() {
  const [search, setSearch] = useState("")
  const debouncedSearch = useDebounce(search)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const { data: logsData, isLoading: isLoadingLogs } = useGetActivityLogs({
    search: debouncedSearch,
    pageSize,
    currentPage: page,
  })
  const logs = logsData?.items ?? []
  const totalCount = logsData?.total_count ?? 0
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize))

  return (
    <div className="page-bg min-h-full">
      {/* ── Page header ── */}
      <div className="border-borderSubtle flex flex-col justify-between gap-3 border-b bg-white p-4 md:flex-row md:items-center md:p-6">
        <div>
          <h1 className="font-jakarta text-brand text-base font-semibold tracking-[-0.04em]">
            Activity Logs
          </h1>
          <p className="font-jakarta text-brand/60 mt-0.5 text-sm font-medium tracking-[-0.04em]">
            Track all admin activity across your store
          </p>
        </div>
        <ExportButton currentData={logs} filename="activity-logs" />
      </div>

      {/* ── Table section ── */}
      <div className="lg:border-borderSubtle my-6 overflow-hidden lg:mx-6 lg:rounded-xl lg:border lg:bg-white">
        <TableToolbar
          search={search}
          onSearchChange={setSearch}
          placeholder="Search activity logs"
        />

        {/* Desktop table */}
        <div className="hidden lg:block">
          <DataTable
            columns={activityLogColumns}
            data={logs}
            getRowId={(row) => row.log_id}
            isLoading={isLoadingLogs}
            pagination={{
              page,
              pageSize,
              total: totalCount,
              onPageChange: setPage,
              onPageSizeChange: (s) => {
                setPageSize(s)
                setPage(1)
              },
              entityLabel: "entries",
            }}
          />
        </div>

        {/* Mobile cards */}
        <div className="space-y-2 px-4 py-4 lg:hidden">
          {logs.map((log) => (
            <MobileLogCard key={log.log_id} log={log} />
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
    </div>
  )
}
