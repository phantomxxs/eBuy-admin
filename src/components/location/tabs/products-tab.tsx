import { useMemo } from "react"
import DataTable from "@/components/ui/data-table"
import { WithTooltip } from "@/components/ui/tooltip"
import { useGetLocationProducts } from "@/store/queries/locations"
import type { ColumnDef } from "@tanstack/react-table"
import type { LocationProduct } from "@/types/locations"

interface Props {
  locationId: string
}

export default function ProductsTab({ locationId }: Props) {
  const { data, isLoading } = useGetLocationProducts(locationId)

  const columns = useMemo<ColumnDef<LocationProduct>[]>(
    () => [
      {
        accessorKey: "name",
        header: "PRODUCT",
        cell: ({ getValue }) => {
          const name = getValue<string>()
          return (
            <WithTooltip
              trigger={
                <div className="font-jakarta text-brand max-w-45 overflow-hidden text-xs text-ellipsis whitespace-nowrap">
                  {name}
                </div>
              }
              content={name}
            />
          )
        },
      },
      {
        accessorKey: "sku",
        header: "SKU",
        cell: ({ getValue }) => (
          <span className="font-jakarta text-brand/60 text-xs">{getValue<string>()}</span>
        ),
      },
      {
        accessorKey: "stock",
        header: "STOCK",
        cell: ({ getValue }) => (
          <span className="font-jakarta text-brand text-xs">{getValue<number>()}</span>
        ),
      },
    ],
    [],
  )

  return (
    <div>
      <p className="font-jakarta text-brand/50 text-xs font-semibold tracking-wide uppercase">
        THIS LOCATION'S PRODUCTS
      </p>
      <div className="mt-3 grid grid-cols-2 gap-3">
        <MiniMetric label="Total products" value={isLoading ? "—" : (data?.totalProducts ?? 0)} />
        <MiniMetric label="Active products" value={isLoading ? "—" : (data?.activeProducts ?? 0)} />
      </div>

      <div className="mt-5 mb-3 flex items-center justify-between">
        <p className="font-jakarta text-brand text-sm font-semibold">Top performing products</p>
      </div>

      <DataTable
        columns={columns}
        data={data?.items ?? []}
        getRowId={(row: LocationProduct) => row.id}
        isLoading={isLoading}
        emptyMessage="No products found"
      />
    </div>
  )
}

const MiniMetric = ({ label, value }: { label: string; value: string | number }) => (
  <div className="border-borderSubtle rounded-xl border p-4">
    <p className="font-jakarta text-brand/50 text-xs">{label}</p>
    <p className="font-jakarta text-brand mt-1 text-lg font-semibold">{value}</p>
  </div>
)
