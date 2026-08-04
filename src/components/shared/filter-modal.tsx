import { useEffect, useState } from "react"
import Modal from "@/components/ui/modal"
import { Button } from "@/components/ui/button"
import { DatePicker } from "@/components/ui/date-picker"
import { cn } from "@/lib/utils"
import CategorySearchInput from "@/components/ui/category-search-input"
import LocationSearchInput from "@/components/ui/location-search-input"
import SkinTypeSearchInput from "@/components/ui/skin-type-search-input"
import StaffSearchInput from "@/components/ui/staff-search-input"

export type FilterValues = Record<string, string[]>

export type FilterField =
  | { type?: "chips"; key: string; label: string; options: Array<{ label: string; value: string }> }
  | { type: "date-range"; key: string; label: string }
  | {
      type: "number-range"
      key: string
      label: string
      minPlaceholder?: string
      maxPlaceholder?: string
    }
  | { type: "category-search"; key: string; label: string }
  | { type: "location-search"; key: string; label: string }
  | { type: "skin-type-search"; key: string; label: string }
  | { type: "staff-search"; key: string; label: string }

interface Props {
  isOpen: boolean
  onClose: () => void
  title: string
  fields: FilterField[]
  values: FilterValues
  onApply: (values: FilterValues) => void
}

export default function FilterModal({ isOpen, onClose, title, fields, values, onApply }: Props) {
  const [draft, setDraft] = useState<FilterValues>({})

  useEffect(() => {
    if (isOpen) setDraft(values)
  }, [isOpen]) // eslint-disable-line react-hooks/exhaustive-deps

  const toggle = (key: string, value: string) => {
    setDraft((prev) => {
      const current = prev[key] ?? []
      const next = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value]
      return { ...prev, [key]: next }
    })
  }

  const setDate = (key: string, value: string) => {
    setDraft((prev) => ({ ...prev, [key]: value ? [value] : [] }))
  }

  const setNumber = (key: string, value: string) => {
    setDraft((prev) => ({ ...prev, [key]: value ? [value] : [] }))
  }

  const setMultiSearch = (key: string, value: string[]) => {
    setDraft((prev) => ({ ...prev, [key]: value }))
  }

  const setSingleSearch = (key: string, value: string) => {
    setDraft((prev) => ({ ...prev, [key]: value ? [value] : [] }))
  }

  const activeCount = Object.values(draft).reduce((sum, vals) => sum + vals.length, 0)

  const customFooter = (
    <div className="border-borderSubtle flex gap-2 border-t px-4 py-4 sm:px-6">
      <Button
        variant="subtle"
        onClick={() => {
          setDraft({})
          onApply({})
        }}
        className="flex-1"
      >
        Clear{activeCount > 0 ? ` (${activeCount})` : " all"}
      </Button>
      <Button
        variant="secondary"
        onClick={() => {
          onApply(draft)
          onClose()
        }}
        className="flex-1"
      >
        Apply filters
      </Button>
    </div>
  )

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      variant="dialog"
      title={title}
      className="max-w-md p-0"
      customFooter={customFooter}
    >
      <div className="divide-borderSubtle flex flex-col divide-y px-4 sm:px-6">
        {fields.map((field) => (
          <div key={field.key} className="py-5 first:pt-5 last:pb-5">
            <p className="font-jakarta text-brand/50 mb-3 text-xs font-semibold tracking-wide uppercase">
              {field.label}
            </p>

            {(!field.type || field.type === "chips") && (
              <div className="flex flex-wrap gap-2">
                {field.options.map((opt) => {
                  const isSelected = (draft[field.key] ?? []).includes(opt.value)
                  return (
                    <button
                      key={opt.value}
                      onClick={() => toggle(field.key, opt.value)}
                      className={cn(
                        "font-jakarta rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                        isSelected
                          ? "border-primary/20 bg-primary/8 text-primary"
                          : "border-borderSubtle text-brand/60 bg-white hover:bg-gray-50",
                      )}
                    >
                      {opt.label}
                    </button>
                  )
                })}
              </div>
            )}

            {field.type === "category-search" && (
              <CategorySearchInput
                multiple
                value={draft[field.key] ?? []}
                onChange={(v) => setMultiSearch(field.key, v)}
                placeholder="Search categories…"
              />
            )}

            {field.type === "location-search" && (
              <LocationSearchInput
                multiple
                value={draft[field.key] ?? []}
                onChange={(v) => setMultiSearch(field.key, v)}
                placeholder="Search locations…"
              />
            )}

            {field.type === "skin-type-search" && (
              <SkinTypeSearchInput
                multiple
                value={draft[field.key] ?? []}
                onChange={(v) => setMultiSearch(field.key, v)}
                placeholder="Search skin types…"
              />
            )}

            {field.type === "staff-search" && (
              <StaffSearchInput
                value={draft[field.key]?.[0] ?? ""}
                onChange={(v) => setSingleSearch(field.key, v)}
                placeholder="Search staff…"
              />
            )}

            {field.type === "number-range" && (
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="font-jakarta text-brand/50 mb-1.5 block text-xs font-medium">
                    Min
                  </label>
                  <input
                    type="number"
                    value={draft[`${field.key}_min`]?.[0] ?? ""}
                    onChange={(e) => setNumber(`${field.key}_min`, e.target.value)}
                    placeholder={field.minPlaceholder ?? "Min"}
                    className="border-borderSubtle font-jakarta text-brand placeholder:text-brand/40 focus:ring-primary/20 h-10 w-full [appearance:textfield] rounded-lg border bg-white px-3 text-sm focus:ring-2 focus:outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                  />
                </div>
                <div className="flex-1">
                  <label className="font-jakarta text-brand/50 mb-1.5 block text-xs font-medium">
                    Max
                  </label>
                  <input
                    type="number"
                    value={draft[`${field.key}_max`]?.[0] ?? ""}
                    onChange={(e) => setNumber(`${field.key}_max`, e.target.value)}
                    placeholder={field.maxPlaceholder ?? "Max"}
                    className="border-borderSubtle font-jakarta text-brand placeholder:text-brand/40 focus:ring-primary/20 h-10 w-full [appearance:textfield] rounded-lg border bg-white px-3 text-sm focus:ring-2 focus:outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                  />
                </div>
              </div>
            )}

            {field.type === "date-range" &&
              (() => {
                const fromVal = draft[`${field.key}_from`]?.[0]
                const fromDate = fromVal ? new Date(fromVal + "T00:00:00") : undefined
                return (
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <label className="font-jakarta text-brand/50 mb-1.5 block text-xs font-medium">
                        From
                      </label>
                      <DatePicker
                        value={fromVal}
                        onChange={(v) => {
                          setDate(`${field.key}_from`, v)
                          const toVal = draft[`${field.key}_to`]?.[0]
                          if (toVal && v && toVal < v) setDate(`${field.key}_to`, "")
                        }}
                        placeholder="Start date"
                        maxDate={new Date()}
                      />
                    </div>
                    <div className="flex-1">
                      <label className="font-jakarta text-brand/50 mb-1.5 block text-xs font-medium">
                        To
                      </label>
                      <DatePicker
                        value={draft[`${field.key}_to`]?.[0]}
                        onChange={(v) => setDate(`${field.key}_to`, v)}
                        placeholder="End date"
                        disabled={!fromVal}
                        minDate={fromDate}
                      />
                    </div>
                  </div>
                )
              })()}
          </div>
        ))}
      </div>
    </Modal>
  )
}
