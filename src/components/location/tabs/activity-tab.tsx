import { useMemo } from "react"
import DataTable from "@/components/ui/data-table"
import { WithTooltip } from "@/components/ui/tooltip"
import { formatDateToCustomFormat } from "@/lib/utils"
import { useGetLocationActivity } from "@/store/queries/locations"
import type { ColumnDef } from "@tanstack/react-table"
import type { LocationActivity } from "@/types/locations"

interface Props {
  locationId: string
}

export default function ActivityTab({ locationId }: Props) {
  const { data: activity, isLoading } = useGetLocationActivity(locationId)

  const columns = useMemo<ColumnDef<LocationActivity>[]>(
    () => [
      {
        accessorKey: "date",
        header: "DATE",
        cell: ({ getValue }) => (
          <span className="font-jakarta text-brand/60 text-xs whitespace-nowrap">
            {getValue<string>() ? formatDateToCustomFormat(getValue<string>(), true) : "—"}
          </span>
        ),
      },
      {
        accessorKey: "activity",
        header: "ACTIVITY",
        cell: ({ getValue }) => {
          const text = getValue<string>()
          return (
            <WithTooltip
              trigger={
                <div className="font-jakarta text-brand max-w-52 overflow-hidden text-xs text-ellipsis whitespace-nowrap">
                  {text}
                </div>
              }
              content={text}
            />
          )
        },
      },
      {
        accessorKey: "by",
        header: "BY",
        cell: ({ getValue }) => (
          <span className="font-jakarta text-brand/60 text-xs">{getValue<string>()}</span>
        ),
      },
    ],
    [],
  )

  return (
    <DataTable
      columns={columns}
      data={activity ?? []}
      getRowId={(_, i) => String(i)}
      isLoading={isLoading}
      emptyMessage="No activity found"
    />
  )
}
