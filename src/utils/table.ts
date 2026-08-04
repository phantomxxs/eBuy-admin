import type { FilterValues } from "@/components/shared/filter-modal"
import { parseDateStr } from "@/utils/date"

interface ApplyTableFiltersOptions {
  search?: string
  searchKeys?: string[]
  filters?: FilterValues
  filterKeys?: string[]
  dateKey?: string
}

export function applyTableFilters<T>(
  items: T[],
  { search, searchKeys = [], filters = {}, filterKeys = [], dateKey }: ApplyTableFiltersOptions,
): T[] {
  let result = items

  if (search && searchKeys.length) {
    const q = search.toLowerCase()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    result = result.filter((item) =>
      searchKeys.some((key) =>
        String((item as any)[key] ?? "")
          .toLowerCase()
          .includes(q),
      ),
    )
  }

  for (const key of filterKeys) {
    if (filters[key]?.length) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      result = result.filter((item) => filters[key].includes(String((item as any)[key])))
    }
  }

  if (dateKey && (filters.date_from?.[0] || filters.date_to?.[0])) {
    const from = filters.date_from?.[0] ? new Date(filters.date_from[0]) : null
    const to = filters.date_to?.[0] ? new Date(filters.date_to[0] + "T23:59:59") : null
    result = result.filter((item) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const d = parseDateStr(String((item as any)[dateKey] ?? ""))
      if (!d) return true
      if (from && d < from) return false
      if (to && d > to) return false
      return true
    })
  }

  return result
}
