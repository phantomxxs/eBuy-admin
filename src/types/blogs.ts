export type BlogStatus = "draft" | "published" | "archived"

// ── Raw API shapes ─────────────────────────────────────────────────────────────

export interface RawBlog {
  blog_id: number
  title: string
  slug: string
  description: string
  body: string
  cover_image?: string
  author: string
  status: string
  created_at: string
  published_at?: string
  tags?: string[]
}

export interface RawBlogMetrics {
  total_blogs: number
  published_blogs: number
  draft_blogs: number
  archived_blogs: number
}

// ── Normalized domain types ────────────────────────────────────────────────────

export interface Blog {
  id: string
  title: string
  slug: string
  description: string
  body: string
  coverImage?: string
  author: string
  status: BlogStatus
  createdAt: string
  publishedAt?: string
  tags: string[]
}

export interface BlogMetrics {
  total: number
  published: number
  drafts: number
  archived: number
}

// ── Payload types ──────────────────────────────────────────────────────────────

export interface CreateBlogPayload {
  title: string
  description: string
  body: string
  coverImage?: File
  tags?: string[]
  status: BlogStatus
}

export interface UpdateBlogPayload extends Partial<Omit<CreateBlogPayload, "coverImage">> {
  id: string
  coverImage?: File | string
}

// ── Query params ───────────────────────────────────────────────────────────────

export interface GetBlogsParams {
  search?: string
  status?: string
  currentPage?: number
  pageSize?: number
}
