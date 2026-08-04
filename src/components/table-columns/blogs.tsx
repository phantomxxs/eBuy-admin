import { MoreVertical, FileText } from "lucide-react"
import { type ColumnDef, StatusBadge } from "@/components/ui/data-table"
import { WithTooltip } from "@/components/ui/tooltip"
import { RowActionsMenu } from "@/components/ui/dropdown-menu"
import { formatDateToCustomFormat } from "@/lib/utils"
import type { Blog, BlogStatus } from "@/types/blogs"

export const BLOG_STATUS_CONFIG: Record<
  BlogStatus,
  { label: string; variant: "success" | "warning" | "neutral" | "info" | "default" }
> = {
  published: { label: "Published", variant: "success" },
  draft: { label: "Draft", variant: "warning" },
  archived: { label: "Archived", variant: "neutral" },
}

export const blogColumns: ColumnDef<Blog>[] = [
  {
    id: "cover",
    header: "Cover",
    size: 60,
    cell: ({ row }) =>
      row.original.coverImage ? (
        <img
          src={row.original.coverImage}
          alt={row.original.title}
          className="h-10 w-10 shrink-0 rounded-lg object-cover"
        />
      ) : (
        <div className="from-blush to-brand/10 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br">
          <FileText size={16} className="text-brand/40" />
        </div>
      ),
  },
  {
    id: "title",
    header: "Title",
    size: 280,
    cell: ({ row }) => (
      <div className="flex min-w-0 flex-col gap-0.5">
        <WithTooltip
          trigger={
            <span className="font-jakarta text-brand line-clamp-1 max-w-64 text-sm font-semibold tracking-[-0.04em]">
              {row.original.title}
            </span>
          }
          content={row.original.title}
        />
        <span className="font-jakarta text-brand/50 line-clamp-1 max-w-64 text-xs">
          {row.original.description}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    size: 110,
    cell: ({ row }) => {
      const cfg = BLOG_STATUS_CONFIG[row.original.status]
      return <StatusBadge label={cfg.label} variant={cfg.variant} dot />
    },
  },
  {
    accessorKey: "author",
    header: "Author",
    cell: ({ row }) => (
      <span className="font-jakarta text-brand/70 text-sm whitespace-nowrap">
        {row.original.author}
      </span>
    ),
  },
  {
    id: "publishedAt",
    header: "Published",
    cell: ({ row }) =>
      row.original.publishedAt ? (
        <span className="font-jakarta text-brand/60 text-sm whitespace-nowrap">
          {formatDateToCustomFormat(row.original.publishedAt)}
        </span>
      ) : (
        <span className="font-jakarta text-brand/30 text-sm">—</span>
      ),
  },
  {
    id: "tags",
    header: "Tags",
    cell: ({ row }) => {
      const tags = row.original.tags
      if (!tags.length) return <span className="font-jakarta text-brand/30 text-sm">—</span>
      const visible = tags.slice(0, 2)
      const extra = tags.length - 2
      return (
        <div className="flex flex-wrap items-center gap-1">
          {visible.map((tag) => (
            <span
              key={tag}
              className="bg-brand/5 font-jakarta text-brand/70 rounded-md px-2 py-0.5 text-xs font-medium whitespace-nowrap"
            >
              {tag}
            </span>
          ))}
          {extra > 0 && (
            <span className="font-jakarta text-brand/40 text-xs font-medium">+{extra}</span>
          )}
        </div>
      )
    },
  },
  {
    id: "actions",
    header: "",
    size: 60,
    cell: () => (
      <button
        onClick={(e) => e.stopPropagation()}
        className="text-brand/40 hover:bg-brand/5 hover:text-brand flex h-8 w-8 items-center justify-center rounded-lg transition-colors"
      >
        <MoreVertical size={16} />
      </button>
    ),
  },
]

export function makeBlogColumns(
  onView: (b: Blog) => void,
  onEdit: (b: Blog) => void,
  onPublish: (b: Blog) => void,
  onArchive: (b: Blog) => void,
  onDelete: (b: Blog) => void,
): ColumnDef<Blog>[] {
  return [
    ...blogColumns.slice(0, -1),
    {
      id: "actions",
      header: "",
      size: 60,
      cell: ({ row }) => {
        const blog = row.original
        return (
          <div onClick={(e) => e.stopPropagation()}>
            <RowActionsMenu
              trigger={
                <button className="text-brand/40 hover:bg-brand/5 hover:text-brand flex h-8 w-8 items-center justify-center rounded-lg transition-colors">
                  <MoreVertical size={16} />
                </button>
              }
              items={[
                { label: "View post", onClick: () => onView(blog) },
                { label: "Edit post", onClick: () => onEdit(blog) },
                ...(blog.status === "draft"
                  ? [
                      {
                        label: "Publish post",
                        onClick: () => onPublish(blog),
                        variant: "success" as const,
                      },
                    ]
                  : []),
                ...(blog.status === "published"
                  ? [{ label: "Archive post", onClick: () => onArchive(blog) }]
                  : []),
                {
                  label: "Delete post",
                  onClick: () => onDelete(blog),
                  variant: "destructive" as const,
                },
              ]}
            />
          </div>
        )
      },
    },
  ]
}
