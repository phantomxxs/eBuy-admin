import type { Blog, BlogMetrics, BlogStatus, RawBlog, RawBlogMetrics } from "@/types/blogs"

function normalizeBlogStatus(raw: string): BlogStatus {
  const s = raw.toLowerCase()
  if (s === "draft" || s === "published" || s === "archived") return s
  return "draft"
}

export function normalizeBlog(raw: RawBlog): Blog {
  return {
    id: String(raw.blog_id),
    title: raw.title,
    slug: raw.slug,
    description: raw.description,
    body: raw.body,
    coverImage: raw.cover_image,
    author: raw.author,
    status: normalizeBlogStatus(raw.status),
    createdAt: raw.created_at,
    publishedAt: raw.published_at,
    tags: raw.tags ?? [],
  }
}

export function normalizeBlogMetrics(raw: RawBlogMetrics): BlogMetrics {
  return {
    total: raw.total_blogs ?? 0,
    published: raw.published_blogs ?? 0,
    drafts: raw.draft_blogs ?? 0,
    archived: raw.archived_blogs ?? 0,
  }
}
