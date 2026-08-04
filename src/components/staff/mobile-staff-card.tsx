import { cn } from "@/lib/utils"
import { StatusBadge } from "@/components/ui/data-table"
import { userStatusConfig, ROLE_COLORS } from "@/components/table-columns/staff"
import type { AppUser } from "@/types/staff"

const MobileUserCard = ({ user }: { user: AppUser }) => {
  const cfg = userStatusConfig[user.status]
  const roleClass = ROLE_COLORS[user.role] ?? "bg-gray-50 text-gray-600"
  return (
    <div className="border-line flex items-center justify-between rounded-lg border bg-white p-4">
      <div className="flex items-center gap-3">
        <div className="bg-primary/15 font-jakarta text-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold">
          {user.initials}
        </div>
        <div>
          <p className="font-jakarta text-brand text-sm font-semibold">{user.name}</p>
          <p className="font-jakarta text-brand/50 text-xs">{user.email}</p>
          <span
            className={cn(
              "font-jakarta mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-semibold whitespace-nowrap",
              roleClass,
            )}
          >
            {user.role}
          </span>
        </div>
      </div>
      <StatusBadge label={cfg.label} variant={cfg.variant} dot />
    </div>
  )
}

export default MobileUserCard
