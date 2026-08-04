import { useState } from "react"
import { X } from "lucide-react"
import Modal from "@/components/ui/modal"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/ui/data-table"
import DeleteConfirmModal from "@/components/ui/delete-confirm-modal"
import { BLOG_STATUS_CONFIG } from "@/components/table-columns/blogs"
import EditBlogModal from "./edit-blog-modal"
import { useDeleteBlog, usePublishBlog, useArchiveBlog } from "@/store/mutations/blogs"
import { formatDateToCustomFormat } from "@/lib/utils"
import type { Blog } from "@/types/blogs"

interface Props {
  isOpen: boolean
  onClose: () => void
  blog: Blog | null
}

export default function BlogDetailModal({ isOpen, onClose, blog }: Props) {
  const [showEdit, setShowEdit] = useState(false)
  const [showDelete, setShowDelete] = useState(false)

  const deleteBlog = useDeleteBlog()
  const publishBlog = usePublishBlog()
  const archiveBlog = useArchiveBlog()

  if (!blog) return null

  const statusCfg = BLOG_STATUS_CONFIG[blog.status]

  const customHeader = (
    <div className="border-line shrink-0 border-b px-6 py-4">
      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1 pr-4">
          <h2 className="font-jakarta text-brand line-clamp-2 text-base font-semibold tracking-[-0.04em]">
            {blog.title}
          </h2>
          <p className="font-jakarta text-brand/60 mt-0.5 text-sm font-medium tracking-[-0.04em]">
            By {blog.author}
          </p>
        </div>
        <button
          onClick={onClose}
          className="text-brand/40 hover:text-brand shrink-0 rounded p-0.5 transition-colors"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  )

  const customFooter = (
    <div className="border-borderSubtle shrink-0 border-t p-4 sm:p-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
        {blog.status === "draft" && (
          <Button
            variant="ghost"
            className="border-statusSuccess/20 bg-statusSuccessBg text-statusSuccess hover:bg-statusSuccess/10 flex-1 border"
            loading={publishBlog.isPending}
            onClick={() => publishBlog.mutate(blog.id)}
          >
            Publish post
          </Button>
        )}
        {blog.status === "published" && (
          <Button
            variant="subtle"
            className="flex-1"
            loading={archiveBlog.isPending}
            onClick={() => archiveBlog.mutate(blog.id)}
          >
            Archive post
          </Button>
        )}
        <Button
          variant="ghost"
          className="border-danger/8 bg-danger/4 text-danger hover:bg-danger/8 flex-1 border"
          onClick={() => setShowDelete(true)}
          disabled={publishBlog.isPending || archiveBlog.isPending}
        >
          Delete post
        </Button>
        <Button
          variant="secondary"
          className="flex-1"
          onClick={() => setShowEdit(true)}
          disabled={publishBlog.isPending || archiveBlog.isPending}
        >
          Edit post
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
        width="60vw"
      >
        <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
          {/* Cover image */}
          {blog.coverImage && (
            <img
              src={blog.coverImage}
              alt={blog.title}
              className="max-h-48 w-full rounded-xl object-cover"
            />
          )}

          {/* Title */}
          <h1 className="text-brand font-sans text-xl leading-snug font-semibold">{blog.title}</h1>

          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-3">
            <StatusBadge label={statusCfg.label} variant={statusCfg.variant} dot />
            <span className="font-jakarta text-brand/50 text-sm">by {blog.author}</span>
            {blog.publishedAt && (
              <span className="font-jakarta text-brand/40 text-xs">
                Published {formatDateToCustomFormat(blog.publishedAt)}
              </span>
            )}
            <span className="font-jakarta text-brand/40 text-xs">
              Created {formatDateToCustomFormat(blog.createdAt)}
            </span>
          </div>

          {/* Tags */}
          {blog.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {blog.tags.map((tag) => (
                <span
                  key={tag}
                  className="bg-brand/5 font-jakarta text-brand/70 rounded-full px-3 py-1 text-xs font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Description */}
          <div className="bg-brand/3 border-borderSubtle rounded-xl border p-4">
            <p className="font-jakarta text-brand/50 mb-1 text-xs font-semibold tracking-wide uppercase">
              Excerpt
            </p>
            <p className="font-jakarta text-brand/70 text-sm leading-relaxed">{blog.description}</p>
          </div>

          {/* Body */}
          <div>
            <p className="font-jakarta text-brand/50 mb-3 text-xs font-semibold tracking-wide uppercase">
              Content
            </p>
            <div
              className="font-jakarta text-brand/80 [&_h2]:font-jakarta [&_h2]:text-brand [&_h3]:font-jakarta [&_h3]:text-brand [&_blockquote]:border-borderSubtle [&_blockquote]:text-brand/60 [&_hr]:border-borderSubtle text-sm leading-relaxed [&_blockquote]:border-l-2 [&_blockquote]:pl-3 [&_blockquote]:italic [&_h2]:mb-2 [&_h2]:text-base [&_h2]:font-bold [&_h3]:mb-1.5 [&_h3]:text-sm [&_h3]:font-semibold [&_hr]:my-3 [&_li]:mb-0.5 [&_ol]:mb-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:mb-2 [&_strong]:font-semibold [&_ul]:mb-2 [&_ul]:list-disc [&_ul]:pl-5"
              dangerouslySetInnerHTML={{ __html: blog.body }}
            />
          </div>
        </div>
      </Modal>

      <DeleteConfirmModal
        isOpen={showDelete}
        onClose={() => setShowDelete(false)}
        onConfirm={() => {
          deleteBlog.mutate(blog.id, {
            onSuccess: () => {
              setShowDelete(false)
              onClose()
            },
          })
        }}
        entityType="blog post"
        entityName={blog.title}
        isLoading={deleteBlog.isPending}
      />

      <EditBlogModal isOpen={showEdit} onClose={() => setShowEdit(false)} blog={blog} />
    </>
  )
}
