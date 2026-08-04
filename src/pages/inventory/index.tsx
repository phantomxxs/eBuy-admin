import { useState } from "react"
import { useDebounce } from "@/hooks/useDebounce"
import { useQueryState } from "nuqs"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import MetricCard from "@/components/shared/metric-card"
import TableToolbar from "@/components/shared/table-toolbar"
import { useGetInventoryByProduct, useGetInventoryMetrics } from "@/store/queries/inventory"
import PageSkeleton from "@/components/shared/page-skeleton"
import TransferStockModal from "@/components/inventory/transfer-stock-modal"
import LocationInventoryModal from "@/components/inventory/location-inventory-modal"
import RestockModal from "@/components/inventory/restock-modal"
import AdjustStockModal from "@/components/inventory/adjust-stock-modal"
import BulkAdjustModal from "@/components/inventory/bulk-adjust-modal"
import ImportCsvModal from "@/components/inventory/import-csv-modal"
import ByProductTab from "@/components/inventory/tabs/by-product-tab"
import ByLocationTab from "@/components/inventory/tabs/by-location-tab"
import TransfersTab from "@/components/inventory/tabs/transfers-tab"
import ActivityLogsTab from "@/components/inventory/tabs/activity-logs-tab"
import FilterModal, { type FilterValues, type FilterField } from "@/components/shared/filter-modal"
import { INVENTORY_TAB, type InventoryTab } from "@/utils/inventory"
import type { InventoryByProduct } from "@/types/inventory"

const VIEW_TABS = Object.values(INVENTORY_TAB)

export default function InventoryPage() {
  const { data, isLoading } = useGetInventoryByProduct({
    pageSize: 1,
  })
  const [activeTab, setActiveTab] = useQueryState<InventoryTab>("tab", {
    defaultValue: INVENTORY_TAB.BY_PRODUCT,
    parse: (v) =>
      VIEW_TABS.includes(v as InventoryTab) ? (v as InventoryTab) : INVENTORY_TAB.BY_PRODUCT,
  })
  const [search, setSearch] = useState("")
  const debouncedSearch = useDebounce(search)

  const [showTransfer, setShowTransfer] = useState(false)
  const [showLocationInventory, setShowLocationInventory] = useState(false)
  const [showRestock, setShowRestock] = useState(false)
  const [showAdjust, setShowAdjust] = useState(false)
  const [showBulkAdjust, setShowBulkAdjust] = useState(false)
  const [showImportCsv, setShowImportCsv] = useState(false)
  const [showAdjustMenu, setShowAdjustMenu] = useState(false)
  const [showFilter, setShowFilter] = useState(false)
  const [filters, setFilters] = useState<FilterValues>({})
  const [selectedLocation, setSelectedLocation] = useState<
    { id: string; name: string } | undefined
  >(undefined)
  const [selectedProduct, setSelectedProduct] = useState<InventoryByProduct | null>(null)

  if (isLoading) return <PageSkeleton metricCount={4} />

  return (
    <div className="page-bg min-h-full">
      {/* Page header */}
      <div className="border-borderSubtle flex flex-col justify-between gap-3 border-b bg-white p-4 md:flex-row md:items-center md:p-6">
        <div>
          <h1 className="font-jakarta text-brand text-base font-semibold tracking-[-0.04em]">
            Inventory
          </h1>
          <p className="font-jakarta text-brand/60 mt-0.5 text-sm font-medium tracking-[-0.04em]">
            Track and manage stock levels
          </p>
        </div>
        <div className="flex w-full items-center gap-3 lg:w-[unset]">
          <div className="flex-1">
            <Button variant="subtle" className="w-full" onClick={() => setShowTransfer(true)}>
              Transfer stock
            </Button>
          </div>
          <div className="relative flex-1">
            <Button
              variant="secondary"
              className="w-full"
              onClick={() => setShowAdjustMenu((prev) => !prev)}
            >
              Adjust stock ▾
            </Button>
            {showAdjustMenu && (
              <div className="border-borderSubtle absolute top-full right-0 z-50 mt-1 w-44 rounded-xl border bg-white py-1 shadow-lg">
                {[
                  {
                    label: "Adjust stock",
                    action: () => {
                      setShowAdjust(true)
                      setShowAdjustMenu(false)
                    },
                  },
                  {
                    label: "Restock",
                    action: () => {
                      setShowRestock(true)
                      setShowAdjustMenu(false)
                    },
                  },
                  {
                    label: "Bulk adjust",
                    action: () => {
                      setShowBulkAdjust(true)
                      setShowAdjustMenu(false)
                    },
                  },
                  {
                    label: "Import CSV",
                    action: () => {
                      setShowImportCsv(true)
                      setShowAdjustMenu(false)
                    },
                  },
                ].map(({ label, action }) => (
                  <button
                    key={label}
                    onClick={action}
                    className="font-jakarta text-brand w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50"
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Metric cards */}
      {data && (
        <div className="no-scrollbar flex grid-cols-3 gap-3 overflow-x-auto p-4 lg:grid lg:grid-cols-5 lg:p-6">
          {(
            [
              { label: "In stock", value: data?.total_units_in_stock ?? 0 },
              { label: "Low stock", value: data?.low_stock_count ?? 0 },
              { label: "Out of stock", value: data?.out_of_stock_count ?? 0 },
            ] as const
          ).map((m) => (
            <MetricCard key={m.label} label={m.label} value={m.value} />
          ))}
        </div>
      )}

      {/* Table section */}
      <div className="lg:border-borderSubtle mb-6 overflow-hidden lg:mx-6 lg:rounded-xl lg:border lg:bg-white">
        {/* Tabs */}
        <div className="border-borderSubtle no-scrollbar mb-4 flex gap-0 overflow-x-auto border-b px-4 md:mb-0">
          {VIEW_TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab)
                setFilters({})
              }}
              className={cn(
                "font-jakarta shrink-0 border-b-2 px-4 py-3 text-sm font-medium transition-colors",
                activeTab === tab
                  ? "border-primary text-primary"
                  : "text-brand/50 hover:text-brand border-transparent",
              )}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Toolbar */}
        <TableToolbar
          search={search}
          onSearchChange={setSearch}
          placeholder="Search…"
          onFilterClick={() => setShowFilter(true)}
          activeFiltersCount={Object.values(filters).reduce((s, v) => s + v.length, 0)}
        />

        {/* Tab content */}
        {activeTab === INVENTORY_TAB.BY_PRODUCT && (
          <ByProductTab
            search={debouncedSearch}
            status={filters.stock_status?.join(",") || undefined}
            onRestock={(item) => {
              setSelectedProduct(item)
              setShowRestock(true)
            }}
            onAdjust={(item) => {
              setSelectedProduct(item)
              setShowAdjust(true)
            }}
          />
        )}
        {activeTab === INVENTORY_TAB.BY_LOCATION && (
          <ByLocationTab
            search={debouncedSearch}
            onView={(id, name) => {
              setSelectedLocation({ id, name })
              setShowLocationInventory(true)
            }}
          />
        )}
        {activeTab === INVENTORY_TAB.TRANSFERS && (
          <TransfersTab search={debouncedSearch} status={filters.status?.join(",") || undefined} />
        )}
        {activeTab === INVENTORY_TAB.ACTIVITY_LOGS && (
          <ActivityLogsTab
            search={debouncedSearch}
            adjustmentType={filters.adjustment_type?.join(",") || undefined}
          />
        )}
      </div>

      {/* Modals */}
      <TransferStockModal
        isOpen={showTransfer}
        onClose={() => setShowTransfer(false)}
        product={selectedProduct}
      />
      <LocationInventoryModal
        isOpen={showLocationInventory}
        onClose={() => setShowLocationInventory(false)}
        locationId={selectedLocation?.id ?? null}
        locationName={selectedLocation?.name}
      />
      <RestockModal
        isOpen={showRestock}
        onClose={() => {
          setShowRestock(false)
          setSelectedProduct(null)
        }}
        product={selectedProduct}
      />
      <AdjustStockModal
        isOpen={showAdjust}
        onClose={() => {
          setShowAdjust(false)
          setSelectedProduct(null)
        }}
        product={selectedProduct}
      />
      <BulkAdjustModal isOpen={showBulkAdjust} onClose={() => setShowBulkAdjust(false)} />
      <ImportCsvModal isOpen={showImportCsv} onClose={() => setShowImportCsv(false)} />
      <FilterModal
        isOpen={showFilter}
        onClose={() => setShowFilter(false)}
        title="Filter inventory"
        fields={INVENTORY_FILTERS[activeTab] ?? []}
        values={filters}
        onApply={(v) => {
          setFilters(v)
        }}
      />
    </div>
  )
}

// ── Filter configs (per tab) ────────────────────────────────────────────────────

const INVENTORY_FILTERS: Partial<Record<InventoryTab, FilterField[]>> = {
  [INVENTORY_TAB.BY_PRODUCT]: [
    {
      key: "stock_status",
      label: "Stock status",
      options: [
        { label: "In stock", value: "in_stock" },
        { label: "Low stock", value: "low_stock" },
        { label: "Out of stock", value: "out_of_stock" },
      ],
    },
  ],
  [INVENTORY_TAB.TRANSFERS]: [
    {
      key: "status",
      label: "Status",
      options: [
        { label: "Completed", value: "completed" },
        { label: "Pending", value: "pending" },
        { label: "Cancelled", value: "cancelled" },
      ],
    },
  ],
  [INVENTORY_TAB.ACTIVITY_LOGS]: [
    {
      key: "adjustment_type",
      label: "Adjustment type",
      options: [
        { label: "Restock", value: "restock" },
        { label: "Adjustment", value: "adjustment" },
        { label: "Transfer", value: "transfer" },
        { label: "Sale", value: "sale" },
        { label: "Return", value: "return" },
      ],
    },
  ],
}
