// import instance from "@/services/axios-instance"
import type { PaginatedApiResponse } from "@/types/utils"
import type { Blog, BlogMetrics, CreateBlogPayload, GetBlogsParams } from "@/types/blogs"
import { BLOGS, BLOG_METRICS, BLOG_BY_ID, BLOG_PUBLISH, BLOG_ARCHIVE } from "@/services/apis"
import { mockBlogs, mockBlogMetrics } from "@/mock-data/blogs"

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
}

export const getBlogs = async (params: GetBlogsParams = {}): PaginatedApiResponse<Blog> => {
  // const response = await instance.get(BLOGS, {
  //   params: {
  //     sortBy: "created_at",
  //     sortDir: "DESC",
  //     ...(params.currentPage && { currentPage: params.currentPage }),
  //     ...(params.pageSize && { pageSize: params.pageSize }),
  //     ...(params.search && { search: params.search }),
  //     ...(params.status && { status: params.status }),
  //   },
  // })
  // const body = response.data
  // return { ...body, items: (body.items ?? []).map(normalizeBlog) }

  void BLOGS
  let items = [...mockBlogs]

  if (params.search) {
    const q = params.search.toLowerCase()
    items = items.filter(
      (b) =>
        b.title.toLowerCase().includes(q) ||
        b.author.toLowerCase().includes(q) ||
        b.description.toLowerCase().includes(q),
    )
  }

  if (params.status) {
    items = items.filter((b) => b.status === params.status)
  }

  const total_count = items.length
  const page = params.currentPage ?? 1
  const size = params.pageSize ?? 10
  const start = (page - 1) * size
  const paginated = items.slice(start, start + size)

  return { items: paginated, total_count }
}

export const getBlogMetrics = async (): Promise<BlogMetrics> => {
  // const response = await instance.get(BLOG_METRICS)
  // return normalizeBlogMetrics(response.data)

  void BLOG_METRICS
  return { ...mockBlogMetrics }
}

export const getBlogById = async (id: string): Promise<Blog> => {
  // const response = await instance.get(BLOG_BY_ID(id))
  // return normalizeBlog(response.data)

  void BLOG_BY_ID
  const blog = mockBlogs.find((b) => b.id === id)
  if (!blog) throw new Error(`Blog with id ${id} not found`)
  return { ...blog }
}

export const createBlog = async (payload: CreateBlogPayload): Promise<Blog> => {
  // const formData = new FormData()
  // formData.append("title", payload.title)
  // formData.append("description", payload.description)
  // formData.append("body", payload.body)
  // formData.append("status", payload.status)
  // if (payload.coverImage) formData.append("cover_image", payload.coverImage)
  // if (payload.tags) formData.append("tags", JSON.stringify(payload.tags))
  // const response = await instance.post(BLOGS, formData)
  // return normalizeBlog(response.data)

  void BLOGS
  const newBlog: Blog = {
    id: String(Date.now()),
    title: payload.title,
    slug: generateSlug(payload.title),
    description: payload.description,
    body: payload.body,
    author: "Admin",
    status: payload.status,
    createdAt: new Date().toISOString(),
    publishedAt: payload.status === "published" ? new Date().toISOString() : undefined,
    tags: payload.tags ?? [],
  }
  mockBlogs.push(newBlog)
  return { ...newBlog }
}

export const updateBlog = async (
  id: string,
  payload: Partial<CreateBlogPayload>,
): Promise<Blog> => {
  // const response = await instance.put(BLOG_BY_ID(id), payload)
  // return normalizeBlog(response.data)

  void BLOG_BY_ID
  const idx = mockBlogs.findIndex((b) => b.id === id)
  if (idx === -1) throw new Error(`Blog with id ${id} not found`)

  const updated: Blog = {
    ...mockBlogs[idx],
    ...(payload.title !== undefined && {
      title: payload.title,
      slug: generateSlug(payload.title),
    }),
    ...(payload.description !== undefined && { description: payload.description }),
    ...(payload.body !== undefined && { body: payload.body }),
    ...(payload.status !== undefined && { status: payload.status }),
    ...(payload.tags !== undefined && { tags: payload.tags }),
  }
  mockBlogs[idx] = updated
  return { ...updated }
}

export const publishBlog = async (id: string): Promise<Blog> => {
  // const response = await instance.put(BLOG_PUBLISH(id))
  // return normalizeBlog(response.data)

  void BLOG_PUBLISH
  const idx = mockBlogs.findIndex((b) => b.id === id)
  if (idx === -1) throw new Error(`Blog with id ${id} not found`)
  mockBlogs[idx] = {
    ...mockBlogs[idx],
    status: "published",
    publishedAt: new Date().toISOString(),
  }
  return { ...mockBlogs[idx] }
}

export const archiveBlog = async (id: string): Promise<Blog> => {
  // const response = await instance.put(BLOG_ARCHIVE(id))
  // return normalizeBlog(response.data)

  void BLOG_ARCHIVE
  const idx = mockBlogs.findIndex((b) => b.id === id)
  if (idx === -1) throw new Error(`Blog with id ${id} not found`)
  mockBlogs[idx] = { ...mockBlogs[idx], status: "archived" }
  return { ...mockBlogs[idx] }
}

export const deleteBlog = async (id: string): Promise<null> => {
  // const response = await instance.delete(BLOG_BY_ID(id))
  // return response.data

  void BLOG_BY_ID
  const idx = mockBlogs.findIndex((b) => b.id === id)
  if (idx !== -1) mockBlogs.splice(idx, 1)
  return null
}
