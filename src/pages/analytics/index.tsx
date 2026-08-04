import { useState } from "react"
import { ChevronDown, Download } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie } from "recharts"
import { Popover } from "radix-ui"
import { cn } from "@/lib/utils"
import { MetricCard, MobileDashboardMetricCard } from "@/components/dashboard/metric-card"
import { useGetAnalytics } from "@/store/queries/analytics"
import { formatPrice } from "@/utils/shared"
import PageSkeleton from "@/components/shared/page-skeleton"
import { ChartContainer, ChartTooltip, type ChartConfig } from "@/components/ui/chart"

const PIE_COLORS = ["#E8A3BE", "#F8C8DA", "#F5E3EC", "#E6E6EB", "#F8F8F8"]

const PERIOD_PRESETS = [
  { label: "Last 7 days", value: "7d" },
  { label: "Last 30 days", value: "30d" },
  { label: "Last 3 months", value: "90d" },
  { label: "Last year", value: "1y" },
]

export default function AnalyticsPage() {
  const [categoryPeriod, setCategoryPeriod] = useState("7d")
  const [chartPeriod, setChartPeriod] = useState("7d")

  const { data: dashboard, isLoading } = useGetAnalytics({
    period: "30d",
    categoryPeriod,
    chartPeriod,
  })

  if (isLoading) return <PageSkeleton metricCount={4} />

  return (
    <div className="page-bg min-h-full">
      {/* ── Page header ── */}
      <div className="border-borderSubtle flex flex-col justify-between gap-3 border-b bg-white p-4 md:flex-row md:items-center md:p-6">
        <div>
          <h1 className="font-jakarta text-brand text-base font-semibold tracking-[-0.04em]">
            Analytics
          </h1>
          <p className="font-jakarta text-brand/60 mt-0.5 text-sm font-medium tracking-[-0.04em]">
            Track your store performance and insights
          </p>
        </div>
        <button className="font-jakarta text-brand/70 border-borderSubtle flex w-fit items-center gap-2 rounded-lg border bg-white px-4 py-2.5 text-sm font-medium transition-colors hover:bg-gray-50">
          <Download size={14} />
          Export report
        </button>
      </div>

      <div className="space-y-4 px-4 py-4 md:space-y-6 md:px-6 md:py-6">
        {/* ── Row 1: Metric cards ── */}
        {dashboard && (
          <>
            <div className="no-scrollbar flex gap-3 overflow-x-auto md:hidden">
              {dashboard.metrics.map((m, i) => (
                <MobileDashboardMetricCard key={m.label} metric={m} index={i} />
              ))}
            </div>
            <div className="hidden grid-cols-2 gap-3 md:grid xl:grid-cols-4">
              {dashboard.metrics.map((m, i) => (
                <MetricCard
                  key={m.label}
                  label={m.label}
                  value={m.value}
                  change={m.change}
                  changeType={m.changeType}
                  index={i}
                  currency={false}
                />
              ))}
            </div>
          </>
        )}

        {/* ── Row 2: Category pie + Top products ── */}
        {dashboard && (
          <div className="flex flex-col gap-4 xl:grid xl:grid-cols-[2fr_3fr]">
            {/* Revenue by top category */}
            <div className="border-borderSubtle overflow-hidden rounded-xl border bg-white">
              <div className="border-borderSubtle flex items-center justify-between border-b px-5 py-3.5">
                <span className="font-jakarta text-brand text-sm font-semibold tracking-[-0.04em]">
                  Revenue by top category
                </span>
                <PeriodPicker value={categoryPeriod} onChange={setCategoryPeriod} />
              </div>
              <div className="flex items-center gap-2 px-4 py-5">
                {/* eslint-disable-next-line react-hooks/rules-of-hooks */}
                {(() => {
                  const chartConfig = Object.fromEntries(
                    dashboard.categoryRevenue.map((cat, i) => [
                      cat.name,
                      { label: cat.name, color: PIE_COLORS[i % PIE_COLORS.length] },
                    ]),
                  ) satisfies ChartConfig
                  const pieData = dashboard.categoryRevenue.map((cat, i) => ({
                    ...cat,
                    fill: PIE_COLORS[i % PIE_COLORS.length],
                  }))
                  return (
                    <ChartContainer config={chartConfig} className="h-40 w-40 shrink-0">
                      <PieChart>
                        <ChartTooltip
                          cursor={false}
                          content={({ active, payload }) => {
                            if (!active || !payload?.length) return null
                            const d = payload[0].payload
                            return (
                              <div className="border-borderSubtle font-jakarta grid min-w-32 gap-1 rounded-lg border bg-white px-2.5 py-1.5 text-xs shadow-xl">
                                <div className="flex items-center gap-1.5">
                                  <div
                                    className="h-2 w-2 shrink-0 rounded-[2px]"
                                    style={{ background: d.fill }}
                                  />
                                  <span className="text-brand font-semibold">{d.name}</span>
                                </div>
                                <span className="text-brand/50 tabular-nums">
                                  {d.value}% · {formatCompact(d.revenue)}
                                </span>
                              </div>
                            )
                          }}
                        />
                        <Pie
                          data={pieData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          innerRadius={46}
                          outerRadius={76}
                          paddingAngle={2}
                          strokeWidth={0}
                        />
                      </PieChart>
                    </ChartContainer>
                  )
                })()}
                <div className="min-w-0 flex-1 space-y-2.5">
                  {dashboard.categoryRevenue.map((cat) => (
                    <div key={cat.name} className="flex items-center gap-2">
                      <div
                        className="h-2 w-2 shrink-0 rounded-sm"
                        style={{ background: cat.color }}
                      />
                      <span className="font-jakarta text-brand/80 truncate text-xs font-medium">
                        {cat.name}
                        {cat.revenue > 0 && (
                          <>
                            {" – "}
                            <span className="text-brand font-semibold">
                              {formatCompact(cat.revenue)}
                            </span>{" "}
                            <span className="text-brand/50">({cat.value}%)</span>
                          </>
                        )}
                        {cat.revenue === 0 && (
                          <span className="text-brand/50"> ({cat.value}%)</span>
                        )}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Top selling products */}
            <div className="border-borderSubtle overflow-hidden rounded-xl border bg-white">
              <div className="border-borderSubtle border-b px-5 py-3.5">
                <span className="font-jakarta text-brand text-sm font-semibold tracking-[-0.04em]">
                  Top selling products
                </span>
              </div>
              {/* Table header */}
              <div className="border-borderSubtle bg-brand/1 grid grid-cols-[40px_1fr_80px_100px] border-b px-5 py-2.5">
                {["#", "PRODUCT", "UNITS", "REVENUE"].map((h) => (
                  <span
                    key={h}
                    className="font-jakarta text-brand/40 text-[11px] font-bold tracking-wider uppercase"
                  >
                    {h}
                  </span>
                ))}
              </div>
              {dashboard.topProducts.map((p) => (
                <div
                  key={p.rank}
                  className="border-borderSubtle grid grid-cols-[40px_1fr_80px_100px] items-center border-b px-5 py-3.5 last:border-0"
                >
                  <span className="font-jakarta text-brand/40 text-sm font-bold">{p.rank}</span>
                  <span className="font-jakarta text-brand truncate pr-4 text-sm font-medium">
                    {p.product}
                  </span>
                  <span className="font-jakarta text-brand text-sm font-semibold">
                    {p.unitsSold.toLocaleString()}
                  </span>
                  <span className="font-jakarta text-brand text-sm font-semibold">
                    {formatPrice(p.revenue)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Row 3: Revenue bar chart (full width) ── */}
        {dashboard && (
          <div className="border-borderSubtle overflow-hidden rounded-xl border bg-white">
            {/* Card header */}
            <div className="border-borderSubtle flex items-center justify-between border-b px-5 py-3.5">
              <span className="font-jakarta text-brand text-sm font-semibold tracking-[-0.04em]">
                Revenue
              </span>
              <PeriodPicker value={chartPeriod} onChange={setChartPeriod} />
            </div>
            {/* Stats row */}
            <div className="border-borderSubtle grid grid-cols-2 border-b">
              <div className="border-borderSubtle border-r px-5 py-4">
                <p className="font-jakarta text-brand/50 text-xs font-medium">Avg. order value</p>
                <p className="font-jakarta text-brand mt-1 text-base font-bold tracking-[-0.04em]">
                  {formatPrice(dashboard.avgOrderValue)}
                </p>
              </div>
              <div className="px-5 py-4">
                <p className="font-jakarta text-brand/50 text-xs font-medium">Orders today</p>
                <p className="font-jakarta text-brand mt-1 text-base font-bold tracking-[-0.04em]">
                  {dashboard.ordersToday}
                </p>
              </div>
            </div>
            {/* Bar chart */}
            <div className="px-4 pt-5 pb-0">
              <ResponsiveContainer width="100%" height={220}>
                <BarChart
                  data={dashboard.revenueChart}
                  barCategoryGap="20%"
                  barSize={125}
                  margin={{ top: 4, right: 4, bottom: 0, left: 0 }}
                >
                  <XAxis
                    dataKey="day"
                    axisLine={false}
                    tickLine={false}
                    tick={{
                      fontFamily: "Inter",
                      fontSize: 11,
                      fill: "var(--color-chartAxis)",
                    }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{
                      fontFamily: "Inter",
                      fontSize: 11,
                      fill: "var(--color-chartAxis)",
                    }}
                    width={60}
                    tickFormatter={(v: number) => `₦${(v / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    contentStyle={{
                      fontFamily: "Inter",
                      fontSize: 12,
                      border: "1px solid var(--color-borderSubtle)",
                      borderRadius: 8,
                      boxShadow: "var(--shadow-tooltip)",
                    }}
                    formatter={(value: number) => [formatPrice(value), "Revenue"]}
                    cursor={{ fill: "var(--color-line)" }}
                  />
                  <Bar dataKey="revenue" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Sub-components ──────────────────────────────────────────────────────────

function PeriodPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false)
  const label = PERIOD_PRESETS.find((p) => p.value === value)?.label ?? "Last 7 days"

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <button className="font-jakarta text-brand/60 hover:text-brand flex items-center gap-1 text-xs font-medium transition-colors">
          {label} <ChevronDown size={12} />
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          align="end"
          sideOffset={6}
          className="border-borderSubtle z-50 w-44 overflow-hidden rounded-xl border bg-white shadow-lg"
        >
          <div className="py-1">
            {PERIOD_PRESETS.map((p) => (
              <button
                key={p.value}
                onClick={() => {
                  onChange(p.value)
                  setOpen(false)
                }}
                className={cn(
                  "font-jakarta w-full px-4 py-2.5 text-left text-sm transition-colors hover:bg-gray-50",
                  value === p.value ? "text-primary font-semibold" : "text-brand",
                )}
              >
                {p.label}
              </button>
            ))}
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}

function formatCompact(n: number): string {
  if (n >= 1_000_000) return `₦${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `₦${(n / 1_000).toFixed(1)}K`
  return `₦${n}`
}
