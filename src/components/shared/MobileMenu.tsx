import { useNavigate, useRouterState } from "@tanstack/react-router"
import { useLogout } from "@/store/mutations/auth"
import { useUserStore } from "@/store/user"
import { X } from "lucide-react"
import {
  BarChart2,
  Boxes,
  CreditCard,
  Image,
  LayoutDashboard,
  LogOut,
  MapPin,
  MessageSquare,
  Package,
  Percent,
  ScrollText,
  Settings,
  Shield,
  ShoppingCart,
  Tag,
  Users,
} from "lucide-react"
import { Sheet, SheetContent, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { VisuallyHidden } from "radix-ui"
import { cn } from "@/lib/utils"
import { ROUTES } from "@/lib/routes"
import Logo from "./logo"

// ── Types ──────────────────────────────────────────────────────────────────────

interface MobileMenuProps {
  isOpen: boolean
  onClose: () => void
}

interface NavItem {
  label: string
  icon: React.ReactNode
  route: string
}

interface NavGroup {
  label: string
  items: NavItem[]
}

// ── Nav structure (mirrors AppSidebar) ────────────────────────────────────────

const NAV_GROUPS: NavGroup[] = [
  {
    label: "Overview",
    items: [
      {
        label: "Dashboard",
        icon: <LayoutDashboard size={14} />,
        route: ROUTES.dashboard,
      },
    ],
  },
  {
    label: "Catalog",
    items: [
      {
        label: "Categories",
        icon: <Tag size={14} />,
        route: ROUTES.categories,
      },
      {
        label: "Products",
        icon: <Package size={14} />,
        route: ROUTES.products,
      },
    ],
  },
  {
    label: "Commerce",
    items: [
      {
        label: "Orders",
        icon: <ShoppingCart size={14} />,
        route: ROUTES.orders,
      },
      {
        label: "Customers",
        icon: <Users size={14} />,
        route: ROUTES.customers,
      },
      {
        label: "Discounts",
        icon: <Percent size={14} />,
        route: ROUTES.discounts,
      },
    ],
  },
  {
    label: "Operations",
    items: [
      {
        label: "Transactions",
        icon: <CreditCard size={14} />,
        route: ROUTES.transactions,
      },
      {
        label: "Locations",
        icon: <MapPin size={14} />,
        route: ROUTES.locations,
      },
      {
        label: "Inventory",
        icon: <Boxes size={14} />,
        route: ROUTES.inventory,
      },
      { label: "Banners", icon: <Image size={14} />, route: ROUTES.banners },
    ],
  },
  {
    label: "Admin",
    items: [
      {
        label: "Staff & Roles",
        icon: <Shield size={14} />,
        route: ROUTES.staff,
      },
      {
        label: "Analytics",
        icon: <BarChart2 size={14} />,
        route: ROUTES.analytics,
      },
      {
        label: "Activity Logs",
        icon: <ScrollText size={14} />,
        route: ROUTES.logs,
      },
      {
        label: "Settings",
        icon: <Settings size={14} />,
        route: ROUTES.settings,
      },
    ],
  },
  {
    label: "Messaging",
    items: [
      {
        label: "Messaging",
        icon: <MessageSquare size={14} />,
        route: ROUTES.messaging,
      },
    ],
  },
]

// ── Main export ────────────────────────────────────────────────────────────────

export default function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const navigate = useNavigate()
  const { location } = useRouterState()
  const path = location.pathname
  const { mutate: logout } = useLogout()
  const storeUser = useUserStore((s) => s.user)

  const fullName = storeUser ? `${storeUser.firstname} ${storeUser.lastname}`.trim() : ""
  const email = storeUser?.email ?? ""
  const initials = fullName
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  const go = (route: string) => {
    navigate({ to: route as never })
    onClose()
  }

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side="left"
        showCloseButton={false}
        className="flex w-full max-w-[320px] flex-col gap-0 overflow-hidden p-0"
      >
        <VisuallyHidden.Root>
          <SheetTitle>Navigation menu</SheetTitle>
          <SheetDescription>Mobile navigation</SheetDescription>
        </VisuallyHidden.Root>

        {/* ── Header ── */}
        <div className="border-brand/3 shadow-soft flex items-center justify-between border-b px-4 py-3.5">
          <div className="flex items-center gap-2.5">
            <Logo />
          </div>
          <button
            onClick={onClose}
            className="text-brand/40 hover:bg-brand/5 hover:text-brand flex h-8 w-8 items-center justify-center rounded-lg transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* ── Nav ── */}
        <div className="no-scrollbar flex-1 overflow-y-auto px-4 py-4">
          <div className="flex flex-col gap-4">
            {NAV_GROUPS.map((group) => (
              <div key={group.label} className="flex flex-col gap-1">
                <p className="font-jakarta text-brand/35 text-xxs mb-0.5 px-3 font-bold tracking-widest uppercase">
                  {group.label}
                </p>
                {group.items.map((item) => {
                  const isActive = path === item.route
                  return (
                    <button
                      key={item.route}
                      onClick={() => go(item.route)}
                      className={cn(
                        "font-jakarta flex h-10 w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                        isActive ? "text-secondary bg-blur" : "text-brand hover:bg-brand/5",
                      )}
                    >
                      <span
                        className={cn(
                          "flex h-3.5 w-3.5 shrink-0 items-center justify-center",
                          isActive ? "text-secondary" : "text-brand/50",
                        )}
                      >
                        {item.icon}
                      </span>
                      <span className="tracking-[-0.04em]">{item.label}</span>
                    </button>
                  )
                })}
              </div>
            ))}
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="border-brand/6 flex flex-col gap-1 border-t px-4 py-4">
          <div className="flex items-center gap-2.5 rounded-lg px-3 py-2">
            <div className="bg-primary/15 font-jakarta text-primary flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-jakarta text-brand truncate text-sm font-semibold">{fullName}</p>
              <p className="font-jakarta text-brand/45 truncate text-xs">{email}</p>
            </div>
          </div>
          <button
            onClick={() => {
              onClose()
              logout()
            }}
            className="font-jakarta text-danger hover:bg-danger/6 flex h-10 w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors"
          >
            <LogOut size={14} className="shrink-0" />
            <span className="tracking-[-0.04em]">Logout</span>
          </button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
