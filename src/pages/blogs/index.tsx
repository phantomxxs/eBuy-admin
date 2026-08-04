import { useState, useMemo } from "react"
import { Plus } from "lucide-react"
import { useDebounce } from "@/hooks/useDebounce"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/ui/data-table"
import DataTable from "@/components/ui/data-table"
import FloatingPagination from "@/components/ui/floating-pagination"
import MetricCard from "@/components/shared/metric-card"
import TableToolbar from "@/components/shared/table-toolbar"
import DeleteConfirmModal from "@/components/ui/delete-confirm-modal"
import PageSkeleton from "@/components/shared/page-skeleton"
import { cn, formatDateToCustomFormat } from "@/lib/utils"
import type { Blog } from "@/types/blogs"
import { useGetBlogs, useGetBlogMetrics } from "@/store/queries/blogs"
import { useDeleteBlog, usePublishBlog, useArchiveBlog } from "@/store/mutations/blogs"
import { BLOG_STATUS_CONFIG, makeBlogColumns } from "@/components/table-columns/blogs"
import CreateBlogModal from "@/components/blogs/create-blog-modal"
import BlogDetailModal from "@/components/blogs/blog-detail-modal"
import EditBlogModal from "@/components/blogs/edit-blog-modal"

type StatusFilter = "all" | "published" | "draft" | "archived"

const STATUS_TABS: { label: string; value: StatusFilter }[] = [
  { label: "All", value: "all" },
  { label: "Published", value: "published" },
  { label: "Draft", value: "draft" },
  { label: "Archived", value: "archived" },
]

export default function BlogsPage() {
  const [search, setSearch] = useState("")
  const debouncedSearch = useDebounce(search)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")
  const [showCreate, setShowCreate] = useState(false)
  const [selectedBlog, setSelectedBlog] = useState<Blog | null>(null)
  const [showDetail, setShowDetail] = useState(false)
  const [showEdit, setShowEdit] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Blog | null>(null)

  const { data: metrics, isLoading } = useGetBlogMetrics()
  const { data: blogsData, isLoading: isLoadingBlogs } = useGetBlogs({
    search: debouncedSearch,
    status: statusFilter === "all" ? undefined : statusFilter,
    currentPage: page,
    pageSize,
  })

  const deleteBlog = useDeleteBlog()
  const publishBlog = usePublishBlog()
  const archiveBlog = useArchiveBlog()

  const items = blogsData?.items ?? []
  const total = blogsData?.total_count ?? 0
  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  const openDetail = (blog: Blog) => {
    setSelectedBlog(blog)
    setShowDetail(true)
  }

  const openEdit = (blog: Blog) => {
    setSelectedBlog(blog)
    setShowEdit(true)
  }

  const columns = useMemo(
    () =>
      makeBlogColumns(
        openDetail,
        openEdit,
        (blog) => publishBlog.mutate(blog.id),
        (blog) => archiveBlog.mutate(blog.id),
        (blog) => setDeleteTarget(blog),
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )

  if (isLoading) return <PageSkeleton metricCount={4} />

  return (
    <div className="page-bg min-h-full">
      {/* ── Page header ── */}
      <div className="border-borderSubtle flex flex-col justify-between gap-3 border-b bg-white p-4 lg:flex-row lg:items-center lg:p-6">
        <div>
          <h1 className="font-jakarta text-brand text-base font-semibold tracking-[-0.04em]">
            Blog
          </h1>
          <p className="font-jakarta text-brand/60 mt-0.5 text-sm font-medium tracking-[-0.04em]">
            Create and manage your skincare content
          </p>
        </div>
        <Button
          variant="secondary"
          beforeIcon={<Plus size={14} />}
          onClick={() => setShowCreate(true)}
        >
          Create post
        </Button>
      </div>

      {/* ── Metric cards ── */}
      {metrics && (
        <div className="no-scrollbar flex grid-cols-4 gap-3 overflow-x-auto p-4 lg:grid lg:grid-cols-4 lg:p-6">
          {(
            [
              { label: "Total posts", value: metrics.total },
              { label: "Published", value: metrics.published },
              { label: "Drafts", value: metrics.drafts },
              { label: "Archived", value: metrics.archived },
            ] as const
          ).map((m) => (
            <MetricCard key={m.label} label={m.label} value={m.value} />
          ))}
        </div>
      )}

      {/* ── Table section ── */}
      <div className="lg:border-borderSubtle mb-6 overflow-hidden lg:mx-6 lg:rounded-xl lg:border lg:bg-white">
        <TableToolbar
          search={search}
          onSearchChange={(v) => {
            setSearch(v)
            setPage(1)
          }}
          placeholder="Search posts…"
          exportProps={{ currentData: items, filename: "blogs" }}
        />

        {/* Status filter tabs */}
        <div className="border-borderSubtle no-scrollbar flex gap-1 overflow-x-auto border-b px-4 pb-0">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => {
                setStatusFilter(tab.value)
                setPage(1)
              }}
              className={cn(
                "font-jakarta shrink-0 border-b-2 px-4 py-3 text-sm font-medium transition-colors",
                statusFilter === tab.value
                  ? "border-brand text-brand"
                  : "text-brand/50 hover:text-brand/80 border-transparent",
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="hidden lg:block">
          <DataTable
            columns={columns}
            data={items}
            getRowId={(row) => row.id}
            onRowClick={openDetail}
            isLoading={isLoadingBlogs}
            pagination={{
              page,
              pageSize,
              total,
              onPageChange: setPage,
              onPageSizeChange: (s) => {
                setPageSize(s)
                setPage(1)
              },
              entityLabel: "posts",
            }}
          />
        </div>

        {/* Mobile card list */}
        <div className="space-y-2 px-4 py-4 lg:hidden">
          {items.map((blog) => (
            <MobileBlogCard key={blog.id} blog={blog} onView={() => openDetail(blog)} />
          ))}
        </div>
      </div>

      {/* ── Floating pagination (mobile) ── */}
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

      {/* ── Modals ── */}
      <CreateBlogModal isOpen={showCreate} onClose={() => setShowCreate(false)} />
      <BlogDetailModal
        isOpen={showDetail}
        onClose={() => setShowDetail(false)}
        blog={selectedBlog}
      />
      <EditBlogModal isOpen={showEdit} onClose={() => setShowEdit(false)} blog={selectedBlog} />
      <DeleteConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) deleteBlog.mutate(deleteTarget.id)
          setDeleteTarget(null)
        }}
        entityType="blog post"
        entityName={deleteTarget?.title}
        isLoading={deleteBlog.isPending}
      />
    </div>
  )
}

// ── Sub-components ─────────────────────────────────────────────────────────────

const MobileBlogCard = ({ blog, onView }: { blog: Blog; onView: () => void }) => {
  const cfg = BLOG_STATUS_CONFIG[blog.status]
  return (
    <button
      onClick={onView}
      className="flex w-full items-center gap-3 rounded-lg border bg-white p-4 text-left transition-colors hover:bg-gray-50"
    >
      {blog.coverImage ? (
        <img
          src={blog.coverImage}
          alt={blog.title}
          className="h-12 w-12 shrink-0 rounded-lg object-cover"
        />
      ) : (
        <div className="from-blush to-brand/10 flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br" />
      )}
      <div className="min-w-0 flex-1">
        <p className="font-jakarta text-brand line-clamp-1 text-sm font-semibold">{blog.title}</p>
        <p className="font-jakarta text-brand/50 mt-0.5 text-xs">{blog.author}</p>
        {blog.publishedAt && (
          <p className="font-jakarta text-brand/40 text-xs">
            {formatDateToCustomFormat(blog.publishedAt)}
          </p>
        )}
      </div>
      <StatusBadge label={cfg.label} variant={cfg.variant} dot />
    </button>
  )
}
