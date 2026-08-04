import { useState } from "react"
import { ChevronDown } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"
import { Popover } from "radix-ui"
import type { DateRange } from "react-day-picker"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Calendar } from "@/components/ui/calendar"
import { useGetRevenueChart } from "@/store/queries/dashboard"
import { formatPrice } from "@/utils/shared"
import { cn } from "@/lib/utils"

const PERIOD_PRESETS = [
  { label: "Last 7 days", value: "7d" },
  { label: "Last 30 days", value: "30d" },
  { label: "Last 3 months", value: "90d" },
  { label: "Last year", value: "1y" },
]

function toISO(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
}

function formatShort(date: Date) {
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short" })
}

export default function RevenueChartCard() {
  const [open, setOpen] = useState(false)
  const [view, setView] = useState<"options" | "calendar">("options")
  const [preset, setPreset] = useState("7d")
  const [customRange, setCustomRange] = useState<DateRange | undefined>()
  const [pendingRange, setPendingRange] = useState<DateRange | undefined>()

  const params =
    customRange?.from && customRange?.to
      ? { startDate: toISO(customRange.from), endDate: toISO(customRange.to) }
      : { period: preset }
  const { data, isLoading } = useGetRevenueChart(params)
  const chart = data?.data

  const periodLabel =
    customRange?.from && customRange?.to
      ? `${formatShort(customRange.from)} – ${formatShort(customRange.to)}`
      : (PERIOD_PRESETS.find((p) => p.value === preset)?.label ?? "Last 7 days")

  return (
    <div className="border-borderSubtle order-1 overflow-hidden rounded-xl border bg-white xl:order-2">
      {/* Header */}
      <div className="border-borderSubtle flex items-center justify-between border-b px-4 py-3.5">
        <span className="font-jakarta text-brand text-sm font-semibold tracking-[-0.04em]">
          Revenue
        </span>
        <Popover.Root
          open={open}
          onOpenChange={(o) => {
            setOpen(o)
            if (!o) setView("options")
          }}
        >
          <Popover.Trigger asChild>
            <button className="font-jakarta text-brand/60 hover:text-brand flex items-center gap-1 text-xs font-medium transition-colors">
              {periodLabel} <ChevronDown size={12} />
            </button>
          </Popover.Trigger>
          <Popover.Portal>
            <Popover.Content
              align="end"
              sideOffset={6}
              className="border-borderSubtle z-50 w-48 overflow-hidden rounded-xl border bg-white shadow-lg"
            >
              {view === "options" ? (
                <div className="py-1">
                  {PERIOD_PRESETS.map((p) => (
                    <button
                      key={p.value}
                      onClick={() => {
                        setPreset(p.value)
                        setCustomRange(undefined)
                        setOpen(false)
                      }}
                      className={cn(
                        "font-jakarta w-full px-4 py-2.5 text-left text-sm transition-colors hover:bg-gray-50",
                        preset === p.value && !customRange
                          ? "text-primary font-semibold"
                          : "text-brand",
                      )}
                    >
                      {p.label}
                    </button>
                  ))}
                  <div className="border-borderSubtle border-t">
                    <button
                      onClick={() => {
                        setPendingRange(customRange)
                        setView("calendar")
                      }}
                      className={cn(
                        "font-jakarta w-full px-4 py-2.5 text-left text-sm transition-colors hover:bg-gray-50",
                        customRange ? "text-primary font-semibold" : "text-brand",
                      )}
                    >
                      Custom range…
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <Calendar
                    mode="range"
                    selected={pendingRange}
                    onSelect={setPendingRange}
                    numberOfMonths={1}
                  />
                  <div className="border-borderSubtle flex gap-2 border-t px-3 py-3">
                    <Button
                      variant="subtle"
                      size="sm"
                      className="flex-1"
                      onClick={() => setView("options")}
                    >
                      Back
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="flex-1"
                      disabled={!pendingRange?.from || !pendingRange?.to}
                      onClick={() => {
                        setCustomRange(pendingRange)
                        setOpen(false)
                        setView("options")
                      }}
                    >
                      Apply
                    </Button>
                  </div>
                </div>
              )}
            </Popover.Content>
          </Popover.Portal>
        </Popover.Root>
      </div>

      {/* Stats row */}
      <div className="border-borderSubtle grid grid-cols-2 border-b">
        <div className="border-borderSubtle border-r px-4 py-4">
          <p className="font-jakarta text-brand/50 text-xs font-medium">Avg. order value</p>
          {isLoading ? (
            <Skeleton className="mt-2 h-5 w-20" />
          ) : (
            <p className="font-jakarta text-brand mt-1 text-base font-bold tracking-[-0.04em]">
              {formatPrice(chart?.avgOrderValue ?? 0)}
            </p>
          )}
        </div>
        <div className="px-4 py-4">
          <p className="font-jakarta text-brand/50 text-xs font-medium">Orders today</p>
          {isLoading ? (
            <Skeleton className="mt-2 h-5 w-10" />
          ) : (
            <p className="font-jakarta text-brand mt-1 text-base font-bold tracking-[-0.04em]">
              {chart?.ordersToday ?? 0}
            </p>
          )}
        </div>
      </div>

      {/* Chart */}
      {isLoading ? (
        <div className="flex items-end gap-1.5 px-4 py-6">
          {Array.from({ length: 7 }).map((_, i) => (
            <Skeleton
              key={i}
              className="flex-1 rounded-sm"
              style={{ height: `${40 + Math.sin(i) * 30 + 30}px` }}
            />
          ))}
        </div>
      ) : (
        <div className="px-3 pt-4 pb-0">
          <ResponsiveContainer width="100%" height={140}>
            <BarChart
              data={chart?.data ?? []}
              barCategoryGap="20%"
              barSize={52}
              margin={{ top: 4, right: 4, bottom: 0, left: 0 }}
            >
              <XAxis
                dataKey="day"
                axisLine={false}
                tickLine={false}
                tick={{
                  fontFamily: "Inter",
                  fontSize: 10,
                  fill: "var(--color-chartAxis)",
                }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{
                  fontFamily: "Inter",
                  fontSize: 10,
                  fill: "var(--color-chartAxis)",
                }}
                width={36}
                tickFormatter={(v: number) => {
                  if (v === 0) return "0"
                  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}m`
                  if (v >= 1_000) return `${(v / 1_000).toFixed(0)}k`
                  return String(v)
                }}
              />
              <Tooltip
                contentStyle={{
                  fontFamily: "Inter",
                  fontSize: 12,
                  border: "1px solid var(--color-borderSubtle)",
                  borderRadius: 8,
                  boxShadow: "var(--shadow-tooltip)",
                }}
                cursor={{ fill: "var(--color-brand-ghost, rgba(55,0,32,0.03))" }}
              />
              <Bar dataKey="orders" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
