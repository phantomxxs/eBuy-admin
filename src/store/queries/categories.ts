import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { getCategories, getCategoryMetrics, getCategoryDropdown } from "../requests/categories"
import {
  GET_CATEGORIES_KEY,
  GET_CATEGORY_METRICS_KEY,
  GET_CATEGORY_DROPDOWN_KEY,
} from "../query-keys"
import type { CategoryQueryParams } from "@/types/categories"

export const useGetCategories = (params: CategoryQueryParams) =>
  useQuery({
    queryKey: [GET_CATEGORIES_KEY, params],
    queryFn: () => getCategories(params),
    placeholderData: keepPreviousData,
  })

export const useGetCategoryMetrics = () =>
  useQuery({ queryKey: [GET_CATEGORY_METRICS_KEY], queryFn: getCategoryMetrics })

export const useGetCategoryOptions = () =>
  useQuery({
    queryKey: [GET_CATEGORIES_KEY, { pageSize: 200 }],
    queryFn: () => getCategories({ pageSize: 200 }),
    select: (res) => res.items.map((c) => ({ label: c.name, value: String(c.category_id) })),
  })

export const useCategorySearch = (search: string) =>
  useQuery({
    queryKey: [GET_CATEGORIES_KEY, { search, pageSize: 100 }],
    queryFn: () => getCategories({ search, pageSize: 100 }),
    select: (res) => res.items.map((c) => ({ label: c.name, value: String(c.category_id) })),
  })

export const useGetCategoryDropdown = () =>
  useQuery({
    queryKey: [GET_CATEGORY_DROPDOWN_KEY],
    queryFn: getCategoryDropdown,
  })
