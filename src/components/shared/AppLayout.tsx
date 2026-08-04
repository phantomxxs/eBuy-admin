import { useState } from "react"
import AppSidebar from "@/components/shared/AppSidebar"
import AppTopBar from "@/components/shared/AppTopBar"
import MobileTopBar from "@/components/shared/MobileTopBar"
import MobileMenu from "@/components/shared/MobileMenu"

interface AppLayoutProps {
  children: React.ReactNode
}

export default function AppLayout({ children }: AppLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden">
      {/* ── Desktop sidebar (hidden on mobile) ── */}
      <div className="hidden lg:block">
        <AppSidebar />
      </div>

      {/* ── Main content area ── */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Desktop top bar */}
        <div className="hidden w-full lg:block">
          <AppTopBar />
        </div>

        {/* Mobile top bar */}
        <div className="lg:hidden">
          <MobileTopBar onMenuOpen={() => setMobileMenuOpen(true)} />
        </div>

        <main className="no-scrollbar flex-1 overflow-y-auto">{children}</main>
      </div>

      {/* ── Mobile menu overlay ── */}
      <MobileMenu isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
    </div>
  )
}
