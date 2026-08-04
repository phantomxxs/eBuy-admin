import {
  BarChart2,
  Boxes,
  Bell,
  ClipboardList,
  CreditCard,
  Image,
  LayoutDashboard,
  LogOut,
  MapPin,
  MessageSquare,
  Package,
  Percent,
  Settings,
  Shield,
  ShoppingCart,
  Tag,
  Users,
} from "lucide-react"
import Logo from "./logo"

interface PreviewAppLayoutProps {
  children: React.ReactNode
}

const NAV_GROUPS = [
  {
    label: "Overview",
    items: [{ label: "Dashboard", icon: LayoutDashboard, active: true }],
  },
  {
    label: "Catalog",
    items: [
      { label: "Products", icon: Package, active: false },
      { label: "Categories", icon: Tag, active: false },
    ],
  },
  {
    label: "Commerce",
    items: [
      { label: "Orders", icon: ShoppingCart, active: false },
      { label: "Customers", icon: Users, active: false },
      { label: "Promotions", icon: Percent, active: false },
    ],
  },
  {
    label: "Operations",
    items: [
      { label: "Transactions", icon: CreditCard, active: false },
      { label: "Locations", icon: MapPin, active: false },
      { label: "Inventory", icon: Boxes, active: false },
      { label: "Banners", icon: Image, active: false },
    ],
  },
  {
    label: "Admin",
    items: [
      { label: "Staff & Roles", icon: Shield, active: false },
      { label: "Analytics", icon: BarChart2, active: false },
      { label: "Logs", icon: ClipboardList, active: false },
      { label: "Settings", icon: Settings, active: false },
    ],
  },
  {
    label: "Messaging",
    items: [{ label: "Messaging", icon: MessageSquare, active: false }],
  },
]

export default function PreviewAppLayout({ children }: PreviewAppLayoutProps) {
  return (
    <div className="flex h-screen overflow-hidden bg-white">
      {/* ── Static sidebar ── */}
      <div className="border-borderSubtle flex w-56 shrink-0 flex-col border-r bg-white">
        {/* Logo */}
        <div className="border-borderSubtle flex h-16 shrink-0 items-center gap-2.5 border-b px-4">
          <Logo />
        </div>

        {/* Nav */}
        <div className="no-scrollbar flex flex-1 flex-col gap-4 overflow-y-auto px-3 py-4">
          {NAV_GROUPS.map((group) => (
            <div key={group.label} className="flex flex-col gap-0.5">
              <span className="font-jakarta text-brand/35 mb-1 px-2 text-[9px] font-semibold tracking-widest uppercase">
                {group.label}
              </span>
              {group.items.map(({ label, icon: Icon, active }) => (
                <div
                  key={label}
                  className={`flex items-center gap-2.5 rounded-lg px-2 py-2 ${
                    active ? "bg-primary/8 text-primary" : "text-brand/55"
                  }`}
                >
                  <Icon size={15} />
                  <span className="font-jakarta text-sm font-medium">{label}</span>
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="border-borderSubtle border-t px-3 py-3">
          <div className="text-brand/55 flex items-center gap-2.5 rounded-lg px-2 py-2">
            <LogOut size={15} />
            <span className="font-jakarta text-sm font-medium">Logout</span>
          </div>
        </div>
      </div>

      {/* ── Main content ── */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Static top bar */}
        <div className="flex h-16 shrink-0 items-center justify-between border-b px-6">
          <div />
          <div className="flex items-center gap-4">
            <div className="bg-borderSubtle flex h-10 w-10 items-center justify-center rounded-full">
              <Bell size={16} className="text-brand" />
            </div>
            <div className="bg-borderSubtle h-10 w-px" />
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 text-primary font-jakarta flex h-9 w-9 items-center justify-center rounded-full text-xs font-semibold">
                TS
              </div>
              <div className="flex flex-col">
                <span className="font-jakarta text-brand text-sm font-semibold">Trey Song</span>
                <span className="font-jakarta text-brand/40 text-xs">Super admin</span>
              </div>
            </div>
          </div>
        </div>

        <main className="no-scrollbar flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  )
}
