import { useCallback, useRef, useState } from "react"
import { useQueryState } from "nuqs"
import { Building2, Bell, Lock, CreditCard, ShoppingCart } from "lucide-react"
import { cn } from "@/lib/utils"
import { SETTINGS_SECTION, type SettingsSectionId } from "@/utils/settings"
import { Button } from "@/components/ui/button"
import StoreInfoSection from "@/components/settings/store-info-section"
import OrderManagementSection from "@/components/settings/order-management-section"
import PaymentFinanceSection from "@/components/settings/payment-finance-section"
import NotificationsSection from "@/components/settings/notifications-section"
import SecuritySection from "@/components/settings/security-section"

const SETTINGS_SECTIONS = [
  {
    id: SETTINGS_SECTION.BRAND_BUSINESS,
    label: "Brand & Business",
    mobileLabel: "Brand",
    icon: Building2,
  },
  {
    id: SETTINGS_SECTION.ORDER_MANAGEMENT,
    label: "Order Management",
    mobileLabel: "Orders",
    icon: ShoppingCart,
  },
  {
    id: SETTINGS_SECTION.PAYMENTS_FINANCE,
    label: "Payments & Finance",
    mobileLabel: "Payments",
    icon: CreditCard,
  },
  {
    id: SETTINGS_SECTION.NOTIFICATIONS,
    label: "Notification preferences",
    mobileLabel: "Notifications",
    icon: Bell,
  },
  {
    id: SETTINGS_SECTION.SECURITY,
    label: "Security & Access",
    mobileLabel: "Security",
    icon: Lock,
  },
]

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useQueryState<SettingsSectionId>("section", {
    defaultValue: SETTINGS_SECTION.BRAND_BUSINESS,
    parse: (v) =>
      Object.values(SETTINGS_SECTION).includes(v as SettingsSectionId)
        ? (v as SettingsSectionId)
        : SETTINGS_SECTION.BRAND_BUSINESS,
  })

  const saveRef = useRef<(() => void) | undefined>(undefined)
  const registerSave = useCallback((fn: () => void) => {
    saveRef.current = fn
  }, [])

  const [isDirty, setIsDirty] = useState(false)
  const registerDirty = useCallback((dirty: boolean) => setIsDirty(dirty), [])

  return (
    <div className="page-bg min-h-full">
      {/* ── Page header ── */}
      <div className="border-borderSubtle border-b bg-white px-4 py-4 lg:px-6 lg:py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-jakarta text-brand text-base font-semibold tracking-[-0.04em]">
              Settings
            </h1>
            <p className="font-jakarta text-brand/60 mt-0.5 text-sm font-medium tracking-[-0.04em]">
              Store configuration and preferences
            </p>
          </div>
          <Button variant="secondary" onClick={() => saveRef.current?.()} disabled={!isDirty}>
            Save changes
          </Button>
        </div>
      </div>

      {/* ── Mobile tab strip ── */}
      <div className="no-scrollbar border-borderSubtle overflow-x-auto border-b bg-white px-5 lg:hidden">
        <div className="flex min-w-max">
          {SETTINGS_SECTIONS.map((section) => {
            const Icon = section.icon
            const isActive = activeSection === section.id
            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={cn(
                  "font-jakarta flex items-center gap-2 border-b-2 px-4 py-3.5 text-sm whitespace-nowrap transition-colors",
                  isActive
                    ? "border-primary text-primary font-semibold"
                    : "text-brand/60 hover:text-brand border-transparent font-medium",
                )}
              >
                <Icon size={14} className="shrink-0" />
                {section.mobileLabel}
              </button>
            )
          })}
        </div>
      </div>

      <div className="flex p-4 lg:gap-0 lg:p-6">
        {/* ── Secondary sidebar (desktop only) ── */}
        <aside className="hidden w-55 shrink-0 lg:block">
          <div className="border-borderSubtle overflow-hidden rounded-xl border bg-white">
            {SETTINGS_SECTIONS.map((section) => {
              const Icon = section.icon
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={cn(
                    "border-borderSubtle flex w-full items-center gap-3 border-b px-4 py-3.5 text-left transition-colors last:border-0",
                    activeSection === section.id
                      ? "bg-primary/5 text-primary"
                      : "text-brand/70 hover:bg-brand/5",
                  )}
                >
                  <Icon size={14} className="shrink-0" />
                  <p className="font-jakarta text-sm font-medium whitespace-nowrap">
                    {section.label}
                  </p>
                </button>
              )
            })}
          </div>
        </aside>

        {/* ── Main content ── */}
        <div className="w-full lg:ml-6 lg:max-w-241.5 lg:flex-1">
          {activeSection === SETTINGS_SECTION.BRAND_BUSINESS && (
            <StoreInfoSection registerSave={registerSave} registerDirty={registerDirty} />
          )}
          {activeSection === SETTINGS_SECTION.ORDER_MANAGEMENT && (
            <OrderManagementSection registerSave={registerSave} registerDirty={registerDirty} />
          )}
          {activeSection === SETTINGS_SECTION.PAYMENTS_FINANCE && (
            <PaymentFinanceSection registerSave={registerSave} registerDirty={registerDirty} />
          )}
          {activeSection === SETTINGS_SECTION.NOTIFICATIONS && (
            <NotificationsSection registerSave={registerSave} registerDirty={registerDirty} />
          )}
          {activeSection === SETTINGS_SECTION.SECURITY && (
            <SecuritySection registerSave={registerSave} registerDirty={registerDirty} />
          )}
        </div>
      </div>
    </div>
  )
}
