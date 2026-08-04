import { useNavigate, useRouterState } from "@tanstack/react-router"
import { useLogout } from "@/store/mutations/auth"
import { useSidebarStore } from "@/store/sidebar"
import {
  BarChart2,
  Boxes,
  ClipboardList,
  CreditCard,
  FileText,
  Gift,
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
  Star,
  Tag,
  Ticket,
  Users,
} from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { ROUTES } from "@/lib/routes"
import { PERMISSIONS, type Permission } from "@/utils/permissions"
import { useUserStore } from "@/store/user"
import { useGetProductMetrics } from "@/store/queries/products"
import CounterTag from "@/components/ui/counter-tag"
import Logo from "./logo"
import type { ReactNode } from "react"

interface NavItem {
  label: string
  icon: ReactNode
  route: string
  /** If set, item is hidden when the user lacks this permission. */
  permission?: Permission
  badge?: ReactNode
}

interface NavGroup {
  label: string
  items: NavItem[]
}

export default function AppSidebar() {
  const navigate = useNavigate()
  const { location } = useRouterState()
  const path = location.pathname
  const { data: metricsData } = useGetProductMetrics()
  const productTotal = metricsData?.total
  const { mutate: logout } = useLogout()
  const { collapsed } = useSidebarStore()
  const hasPermission = useUserStore((s) => s.hasPermission)
  const permissionsLoaded = useUserStore((s) => s.permissions.length > 0)

  const go = (to: string) => navigate({ to: to as never })

  const groups: NavGroup[] = [
    {
      label: "Overview",
      items: [
        {
          label: "Dashboard",
          icon: <LayoutDashboard />,
          route: ROUTES.dashboard,
          permission: PERMISSIONS.DASHBOARD_VIEW_METRICS,
        },
      ],
    },
    {
      label: "Catalog",
      items: [
        {
          // No API permission for categories yet — visible to all
          label: "Categories",
          icon: <Tag />,
          route: ROUTES.categories,
        },
        {
          label: "Products",
          icon: <Package />,
          route: ROUTES.products,
          permission: PERMISSIONS.PRODUCTS_VIEW,
          badge:
            productTotal !== undefined ? <CounterTag count={productTotal} size="sm" /> : undefined,
        },
      ],
    },
    {
      label: "Commerce",
      items: [
        {
          label: "Orders",
          icon: <ShoppingCart />,
          route: ROUTES.orders,
          permission: PERMISSIONS.ORDERS_VIEW,
        },
        {
          label: "Customers",
          icon: <Users />,
          route: ROUTES.customers,
          permission: PERMISSIONS.CUSTOMERS_VIEW_LIST,
        },
        {
          label: "Discounts",
          icon: <Percent />,
          route: ROUTES.discounts,
          permission: PERMISSIONS.PROMOTIONS_VIEW,
        },
        {
          label: "Reviews",
          icon: <Star />,
          route: ROUTES.reviews,
          permission: PERMISSIONS.REVIEWS_VIEW,
        },
      ],
    },
    {
      label: "Marketing",
      items: [
        {
          // No API permission yet — visible to all
          label: "Gift Cards",
          icon: <Gift />,
          route: ROUTES.giftCards,
        },
        {
          // No API permission yet — visible to all
          label: "Vouchers",
          icon: <Ticket />,
          route: ROUTES.vouchers,
        },
        {
          // No API permission yet — visible to all
          label: "Blog",
          icon: <FileText />,
          route: ROUTES.blogs,
        },
      ],
    },
    {
      label: "Operations",
      items: [
        {
          label: "Transactions",
          icon: <CreditCard />,
          route: ROUTES.transactions,
          permission: PERMISSIONS.TRANSACTIONS_VIEW,
        },
        {
          label: "Locations",
          icon: <MapPin />,
          route: ROUTES.locations,
          permission: PERMISSIONS.LOCATIONS_VIEW,
        },
        {
          label: "Inventory",
          icon: <Boxes />,
          route: ROUTES.inventory,
          permission: PERMISSIONS.INVENTORY_VIEW,
        },
        {
          label: "Banners",
          icon: <Image />,
          route: ROUTES.banners,
          permission: PERMISSIONS.BANNERS_VIEW,
        },
      ],
    },
    {
      label: "Admin",
      items: [
        {
          label: "Staff & Roles",
          icon: <Shield />,
          route: ROUTES.staff,
          permission: PERMISSIONS.STAFF_VIEW,
        },
        {
          label: "Analytics",
          icon: <BarChart2 />,
          route: ROUTES.analytics,
          permission: PERMISSIONS.ANALYTICS_VIEW,
        },
        {
          // No API permission yet — visible to all
          label: "Logs",
          icon: <ClipboardList />,
          route: ROUTES.logs,
        },
        {
          label: "Settings",
          icon: <Settings />,
          route: ROUTES.settings,
          permission: PERMISSIONS.SETTINGS_VIEW,
        },
      ],
    },
    {
      label: "Messaging",
      items: [
        {
          // No API permission yet — visible to all
          label: "Messaging",
          icon: <MessageSquare />,
          route: ROUTES.messaging,
        },
      ],
    },
  ]

  // Filter each group's items by permission; drop groups that become empty.
  // If no permissions have been loaded yet (e.g. super admin with empty array,
  // or API strings not yet synced), fail-open and show all items.
  const visibleGroups = groups
    .map((group) => ({
      ...group,
      items: group.items.filter(
        (item) => !item.permission || !permissionsLoaded || hasPermission(item.permission),
      ),
    }))
    .filter((group) => group.items.length > 0)

  return (
    <Sidebar collapsed={collapsed}>
      {/* Logo */}
      <SidebarHeader>
        <div className="flex items-center gap-2.5">
          <Logo onClick={() => navigate({ to: ROUTES.dashboard })} />
        </div>
      </SidebarHeader>

      {/* Nav */}
      <SidebarContent>
        {visibleGroups.map((group) => (
          <SidebarGroup key={group.label} label={group.label}>
            {group.items.map((item) => (
              <SidebarMenuItem
                key={item.route}
                label={item.label}
                icon={item.icon}
                isActive={
                  item.route === ROUTES.products ? path.startsWith(item.route) : path === item.route
                }
                onClick={() => go(item.route)}
                badge={item.badge}
              />
            ))}
          </SidebarGroup>
        ))}
      </SidebarContent>

      {/* Footer — logout */}
      <SidebarFooter>
        <SidebarMenuItem label="Logout" icon={<LogOut />} onClick={() => logout()} />
      </SidebarFooter>
    </Sidebar>
  )
}
