import { keepPreviousData, useQuery } from "@tanstack/react-query"
import type { GetBlogsParams } from "@/types/blogs"
import { GET_BLOGS_KEY, GET_BLOG_BY_ID_KEY, GET_BLOG_METRICS_KEY } from "../query-keys"
import { getBlogById, getBlogMetrics, getBlogs } from "../requests/blogs"

export const useGetBlogs = (params: GetBlogsParams = {}) =>
  useQuery({
    queryKey: [GET_BLOGS_KEY, params],
    queryFn: () => getBlogs(params),
    placeholderData: keepPreviousData,
  })

export const useGetBlogMetrics = () =>
  useQuery({
    queryKey: [GET_BLOG_METRICS_KEY],
    queryFn: getBlogMetrics,
  })

export const useGetBlogById = (id: string | null) =>
  useQuery({
    queryKey: [GET_BLOG_BY_ID_KEY, id],
    queryFn: () => getBlogById(id!),
    enabled: !!id,
  })
