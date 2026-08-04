import { cn, formatDateToCustomFormat } from "@/lib/utils"
import { type ColumnDef, StatusBadge } from "@/components/ui/data-table"
import { RowActionsMenu } from "@/components/ui/dropdown-menu"
import { WithTooltip } from "@/components/ui/tooltip"
import type { AppUser, UserStatus } from "@/types/staff"

const STATUS_CONFIG: Record<
  UserStatus,
  { label: string; variant: "success" | "warning" | "neutral" | "default" }
> = {
  active: { label: "Active", variant: "success" },
  inactive: { label: "Inactive", variant: "default" },
  pending: { label: "Pending", variant: "warning" },
  invited: { label: "Invited", variant: "neutral" },
  draft: { label: "Draft", variant: "neutral" },
}

export const ROLE_COLORS: Record<string, string> = {
  "Super Admin": "bg-blush text-secondary",
  Admin: "bg-purple-50 text-purple-700",
  "Store Manager": "bg-blue-50 text-blue-700",
  Support: "bg-amber-50 text-amber-700",
  Analyst: "bg-green-50 text-green-700",
}

interface UserColumnActions {
  onView: (user: AppUser) => void
  onChangeRole: (user: AppUser) => void
  onSendDraft: (user: AppUser) => void
  onResendInvite: (user: AppUser) => void
  onCancelInvite: (user: AppUser) => void
  onEdit: (user: AppUser) => void
  onDeactivate: (user: AppUser) => void
  onReactivate: (user: AppUser) => void
  onDelete: (user: AppUser) => void
}

export function makeUserColumns({
  onView,
  onChangeRole,
  onSendDraft,
  onResendInvite,
  onCancelInvite,
  onEdit,
  onDeactivate,
  onReactivate,
  onDelete,
}: UserColumnActions): ColumnDef<AppUser>[] {
  return [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="bg-primary/15 font-jakarta text-primary flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold">
            {row.original.initials}
          </div>
          <div className="flex min-w-0 flex-col">
            <WithTooltip
              trigger={
                <p className="font-jakarta text-brand inline-block max-w-36 truncate text-sm font-medium whitespace-nowrap">
                  {row.original.name}
                </p>
              }
              content={row.original.name}
            />
            <WithTooltip
              trigger={
                <p className="font-jakarta text-brand/50 inline-block max-w-36 truncate text-xs whitespace-nowrap">
                  {row.original.email}
                </p>
              }
              content={row.original.email}
            />
          </div>
        </div>
      ),
    },
    {
      accessorKey: "role",
      header: "Role",
      cell: ({ row }) => (
        <span
          className={cn(
            "font-jakarta rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap",
            ROLE_COLORS[row.original.role] ?? "bg-gray-50 text-gray-600",
          )}
        >
          {row.original.role}
        </span>
      ),
    },
    {
      accessorKey: "storeAccess",
      header: "Store access",
      cell: ({ row }) => (
        <span className="font-jakarta text-brand/60 text-sm whitespace-nowrap">
          {row.original.storeAccess}
        </span>
      ),
    },
    {
      accessorKey: "dateAdded",
      header: "Date added",
      cell: ({ row }) => (
        <span className="font-jakarta text-brand/60 text-sm whitespace-nowrap">
          {formatDateToCustomFormat(row.original.dateAdded)}
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const cfg = STATUS_CONFIG[row.original.status]
        return <StatusBadge label={cfg.label} variant={cfg.variant} dot />
      },
    },
    {
      id: "actions",
      header: "",
      size: 60,
      cell: ({ row }) => {
        const user = row.original
        const isDraft = user.status === "draft"
        const isInvited = user.status === "invited" || user.status === "pending"
        const isInactive = user.status === "inactive"

        const items = isDraft
          ? [
              { label: "View details", onClick: () => onView(user) },
              { label: "Send invite", onClick: () => onSendDraft(user) },
              {
                label: "Cancel invite",
                onClick: () => onCancelInvite(user),
                variant: "destructive" as const,
              },
            ]
          : isInvited
            ? [
                { label: "View details", onClick: () => onView(user) },
                { label: "Resend invite", onClick: () => onResendInvite(user) },
                {
                  label: "Cancel invite",
                  onClick: () => onCancelInvite(user),
                  variant: "destructive" as const,
                },
              ]
            : isInactive
              ? [
                  { label: "View details", onClick: () => onView(user) },
                  { label: "Edit staff", onClick: () => onEdit(user) },
                  { label: "Reactivate", onClick: () => onReactivate(user) },
                  {
                    label: "Delete staff",
                    onClick: () => onDelete(user),
                    variant: "destructive" as const,
                  },
                ]
              : [
                  { label: "View details", onClick: () => onView(user) },
                  { label: "Edit staff", onClick: () => onEdit(user) },
                  { label: "Change role", onClick: () => onChangeRole(user) },
                  { label: "Deactivate", onClick: () => onDeactivate(user) },
                  {
                    label: "Delete staff",
                    onClick: () => onDelete(user),
                    variant: "destructive" as const,
                  },
                ]

        return (
          <div onClick={(e) => e.stopPropagation()}>
            <RowActionsMenu items={items} />
          </div>
        )
      },
    },
  ]
}

export { STATUS_CONFIG as userStatusConfig }
