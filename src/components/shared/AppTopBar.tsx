import { PanelLeft } from "lucide-react"
import { useSidebarStore } from "@/store/sidebar"
import { useUserStore } from "@/store/user"
import NotificationBell from "@/components/shared/notification-bell"

export default function AppTopBar() {
  const { toggle } = useSidebarStore()
  const storeUser = useUserStore((s) => s.user)

  const fullName = storeUser ? `${storeUser.firstname} ${storeUser.lastname}`.trim() : ""
  const roleName = storeUser?.role?.name ?? ""
  const initials = fullName
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  return (
    <div className="border-borderSubtle flex h-18 shrink-0 items-center justify-between border-b bg-white px-6">
      {/* Left: collapse toggle + search */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggle}
          className="text-brand/40 hover:bg-brand/5 hover:text-brand flex h-8 w-8 items-center justify-center rounded-lg transition-colors"
          aria-label="Toggle sidebar"
        >
          <PanelLeft size={16} />
        </button>
      </div>

      {/* Right */}
      <div className="flex items-center gap-4">
        {/* Bell */}
        <NotificationBell />

        {/* Divider */}
        <div className="bg-borderSubtle h-10 w-px" />

        {/* Profile */}
        <div className="flex items-center gap-4">
          <div className="bg-primary/15 font-jakarta text-primary flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold">
            {initials}
          </div>
          <div className="flex flex-col leading-none">
            <span className="font-jakarta text-brand text-sm font-semibold tracking-[-0.04em]">
              {fullName}
            </span>
            <span className="font-jakarta text-brand/60 mt-0.5 text-xs font-medium tracking-[-0.03em]">
              {roleName}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
