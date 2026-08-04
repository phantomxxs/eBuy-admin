import * as React from "react"
import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

// ── Collapsed context ──────────────────────────────────────────────────────────

const SidebarCollapsedContext = React.createContext(false)
const useSidebarCollapsed = () => React.useContext(SidebarCollapsedContext)

// ── Sidebar root ──────────────────────────────────────────────────────────────

interface SidebarProps {
  children: React.ReactNode
  collapsed?: boolean
  className?: string
}

export function Sidebar({ children, collapsed = false, className }: SidebarProps) {
  return (
    <SidebarCollapsedContext.Provider value={collapsed}>
      <TooltipProvider>
        <aside
          className={cn(
            "border-border flex h-screen shrink-0 flex-col border-r bg-white transition-all duration-200",
            collapsed ? "w-[64px]" : "w-[220px]",
            className,
          )}
        >
          {children}
        </aside>
      </TooltipProvider>
    </SidebarCollapsedContext.Provider>
  )
}

// ── Sidebar header ────────────────────────────────────────────────────────────

interface SidebarHeaderProps {
  children: React.ReactNode
  className?: string
}

export function SidebarHeader({ children, className }: SidebarHeaderProps) {
  const collapsed = useSidebarCollapsed()
  return (
    <div className={cn("shrink-0 px-4 py-5", collapsed && "flex justify-center px-0", className)}>
      {children}
    </div>
  )
}

// ── Sidebar content (scrollable nav area) ─────────────────────────────────────

interface SidebarContentProps {
  children: React.ReactNode
  className?: string
}

export function SidebarContent({ children, className }: SidebarContentProps) {
  return (
    <div className={cn("no-scrollbar flex-1 overflow-y-auto px-3 py-2", className)}>{children}</div>
  )
}

// ── Sidebar footer ────────────────────────────────────────────────────────────

interface SidebarFooterProps {
  children: React.ReactNode
  className?: string
}

export function SidebarFooter({ children, className }: SidebarFooterProps) {
  return (
    <div className={cn("border-border shrink-0 border-t px-3 py-3", className)}>{children}</div>
  )
}

// ── Sidebar group (section with optional label) ───────────────────────────────

interface SidebarGroupProps {
  label?: string
  children: React.ReactNode
  className?: string
}

export function SidebarGroup({ label, children, className }: SidebarGroupProps) {
  const collapsed = useSidebarCollapsed()
  return (
    <div className={cn("mb-4", className)}>
      {label && !collapsed && (
        <p className="font-jakarta text-brand/35 mb-1 px-3 text-[10px] font-semibold tracking-widest uppercase">
          {label}
        </p>
      )}
      {label && collapsed && <div className="bg-border/40 mx-2 mb-1 h-px" />}
      <div className="space-y-0.5">{children}</div>
    </div>
  )
}

// ── Sidebar menu item ─────────────────────────────────────────────────────────

interface SidebarMenuItemProps {
  label: string
  icon: React.ReactNode
  isActive?: boolean
  onClick?: () => void
  badge?: React.ReactNode
  className?: string
}

export function SidebarMenuItem({
  label,
  icon,
  isActive,
  onClick,
  badge,
  className,
}: SidebarMenuItemProps) {
  const collapsed = useSidebarCollapsed()

  const button = (
    <button
      onClick={onClick}
      className={cn(
        "flex w-full cursor-pointer items-center rounded-lg px-3 py-2 text-left transition-colors",
        collapsed ? "justify-center px-0" : "gap-2.5",
        isActive ? "bg-primary/8 text-primary" : "text-brand/60 hover:bg-brand/5 hover:text-brand",
        className,
      )}
    >
      <span
        className={cn(
          "flex h-4 w-4 shrink-0 items-center justify-center [&_svg]:size-4",
          isActive ? "text-primary" : "text-brand/40",
        )}
      >
        {icon}
      </span>
      {!collapsed && (
        <>
          <span className="font-jakarta flex-1 text-xs font-medium">{label}</span>
          {badge}
        </>
      )}
    </button>
  )

  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{button}</TooltipTrigger>
        <TooltipContent side="right">{label}</TooltipContent>
      </Tooltip>
    )
  }

  return button
}
