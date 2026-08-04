import { cn } from "@/lib/utils"
import type { AppUser } from "@/types/staff"
import UserDetailsTab from "./staff-details-tab"
import RolePermissionsTab from "./role-permissions-tab"
import ActivityLogsTab from "./activity-logs-tab"

export const TABS = {
  USER_DETAILS: "Staff details",
  ROLE_PERMISSIONS: "Role permissions",
  ACTIVITY_LOGS: "Activity logs",
} as const

export const TABS_LIST = Object.values(TABS)

interface UserTabsProps {
  activeTab: string
  onTabChange: (tab: string) => void
  isLoadingUsers: boolean
  users: AppUser[]
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

export default function UserTabs({
  activeTab,
  onTabChange,
  isLoadingUsers,
  users,
  onView,
  onChangeRole,
  onSendDraft,
  onResendInvite,
  onCancelInvite,
  onEdit,
  onDeactivate,
  onReactivate,
  onDelete,
}: UserTabsProps) {
  return (
    <div className="lg:border-borderSubtle mb-6 overflow-hidden lg:mx-6 lg:rounded-xl lg:border lg:bg-white">
      <div className="border-borderSubtle no-scrollbar flex gap-0 overflow-x-auto border-b px-4">
        {TABS_LIST.map((tab) => (
          <button
            key={tab}
            onClick={() => onTabChange(tab)}
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

      {activeTab === TABS.USER_DETAILS && (
        <UserDetailsTab
          isLoading={isLoadingUsers}
          users={users}
          onView={onView}
          onChangeRole={onChangeRole}
          onSendDraft={onSendDraft}
          onResendInvite={onResendInvite}
          onCancelInvite={onCancelInvite}
          onEdit={onEdit}
          onDeactivate={onDeactivate}
          onReactivate={onReactivate}
          onDelete={onDelete}
        />
      )}
      {activeTab === TABS.ROLE_PERMISSIONS && <RolePermissionsTab />}
      {activeTab === TABS.ACTIVITY_LOGS && <ActivityLogsTab />}
    </div>
  )
}
