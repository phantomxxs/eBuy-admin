import { useMemo } from "react"
import DataTable, { StatusBadge } from "@/components/ui/data-table"
import { WithTooltip } from "@/components/ui/tooltip"
import { useGetLocationOrders } from "@/store/queries/locations"
import type { ColumnDef } from "@tanstack/react-table"
import type { LocationOrder } from "@/types/locations"

interface Props {
  locationId: string
}

export default function OrdersTab({ locationId }: Props) {
  const { data, isLoading } = useGetLocationOrders(locationId)

  const columns = useMemo<ColumnDef<LocationOrder>[]>(
    () => [
      {
        accessorKey: "id",
        header: "ORDER ID",
        cell: ({ getValue }) => {
          const id = getValue<string>()
          return (
            <WithTooltip
              trigger={
                <div className="font-jakarta text-brand max-w-32 overflow-hidden text-xs text-ellipsis whitespace-nowrap">
                  {id}
                </div>
              }
              content={id}
            />
          )
        },
      },
      {
        accessorKey: "customer",
        header: "CUSTOMER",
        cell: ({ getValue }) => {
          const customer = getValue<string>()
          return (
            <WithTooltip
              trigger={
                <div className="font-jakarta text-brand max-w-40 overflow-hidden text-xs text-ellipsis whitespace-nowrap">
                  {customer}
                </div>
              }
              content={customer}
            />
          )
        },
      },
      {
        accessorKey: "amount",
        header: "AMOUNT",
        cell: ({ getValue }) => (
          <span className="font-jakarta text-brand text-xs">
            ₦{getValue<number>().toLocaleString()}.00
          </span>
        ),
      },
      {
        accessorKey: "status",
        header: "STATUS",
        cell: ({ getValue }) => {
          const status = getValue<string>()
          return (
            <StatusBadge
              label={status}
              variant={
                status === "completed" || status === "fulfilled"
                  ? "success"
                  : status === "pending"
                    ? "warning"
                    : status === "cancelled"
                      ? "error"
                      : "default"
              }
              dot
            />
          )
        },
      },
    ],
    [],
  )

  return (
    <div>
      <p className="font-jakarta text-brand/50 text-xs font-semibold tracking-wide uppercase">
        THIS LOCATION'S ORDERS
      </p>
      <div className="mt-3 grid grid-cols-2 gap-3">
        <MiniMetric label="Total orders" value={isLoading ? "—" : (data?.totalOrders ?? 0)} />
        <MiniMetric label="Pending orders" value={isLoading ? "—" : (data?.pendingOrders ?? 0)} />
      </div>

      <div className="mt-5 mb-3 flex items-center justify-between">
        <p className="font-jakarta text-brand text-sm font-semibold">Recent orders</p>
      </div>

      <DataTable
        columns={columns}
        data={data?.items ?? []}
        getRowId={(row: LocationOrder) => row.id}
        isLoading={isLoading}
        emptyMessage="No orders found"
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
