import { Plus, Eye, Tag, UserPlus } from "lucide-react"
import { useNavigate } from "@tanstack/react-router"
import { cn } from "@/lib/utils"
import { ROUTES } from "@/lib/routes"

const QUICK_ACTIONS = [
  {
    label: "Add product",
    icon: Plus,
    bg: "bg-primary/10",
    color: "text-primary",
    route: ROUTES.products,
  },
  {
    label: "View orders",
    icon: Eye,
    bg: "bg-orange-100",
    color: "text-orange-500",
    route: ROUTES.orders,
  },
  {
    label: "New promotion",
    icon: Tag,
    bg: "bg-purple-100",
    color: "text-purple-600",
    route: ROUTES.promotions,
  },
  {
    label: "Invite staff",
    icon: UserPlus,
    bg: "bg-emerald-100",
    color: "text-emerald-600",
    route: ROUTES.staff,
  },
]

export default function QuickActions() {
  const navigate = useNavigate()
  return (
    <div className="border-borderSubtle overflow-hidden rounded-xl border bg-white">
      <div className="border-borderSubtle border-b px-4 py-3.5">
        <span className="font-jakarta text-brand text-sm font-semibold tracking-[-0.04em]">
          Quick actions
        </span>
      </div>
      <div className="bg-border grid grid-cols-2 gap-px p-0">
        {QUICK_ACTIONS.map(({ label, icon: Icon, bg, color, route }) => (
          <button
            key={label}
            onClick={() => navigate({ to: route as never })}
            className="flex items-center gap-3 bg-white px-4 py-4 text-left transition-colors hover:bg-gray-50 active:bg-gray-100"
          >
            <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg", bg)}>
              <Icon size={15} className={color} />
            </div>
            <span className="font-jakarta text-brand text-sm font-medium">{label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
