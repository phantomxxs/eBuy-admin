import { Link } from "@tanstack/react-router"
import { ROUTES } from "@/lib/routes"
import DashboardPreview from "@/components/shared/DashboardPreview"
import PreviewAppLayout from "@/components/shared/PreviewAppLayout"
import Logo from "./logo"

interface AuthLayoutProps {
  children: React.ReactNode
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen">
      {/* ── Left branded panel ── */}
      <div
        className="relative hidden flex-col overflow-hidden px-25 pt-25 lg:flex lg:w-[45%]"
        style={{
          background:
            "linear-gradient(175deg, var(--color-secondary) 4.07%, var(--color-brandMid) 96.33%)",
        }}
      >
        {/* Hero text */}
        <div className="relative z-10">
          <h1 className="font-sans text-[2.6rem] leading-[1.1] font-bold tracking-tight text-white">
            Your <em>store,</em>
            <br />
            fully in <em>control.</em>
          </h1>
          <p className="mt-2 max-w-87 text-xs leading-relaxed text-white/65">
            Start managing orders, inventory, and your team from one powerful admin workspace.
          </p>
        </div>

        {/* Dashboard preview */}
        <div
          className="shadow-panel absolute right-0 bottom-0 left-25 overflow-hidden rounded-tl-2xl rounded-tr-2xl border-t border-r border-l border-white/10"
          style={{
            transform: "scale(0.65)",
            transformOrigin: "bottom left",
            width: `${(1 / 0.35) * 100}%`,
            pointerEvents: "none",
          }}
        >
          <PreviewAppLayout>
            <DashboardPreview />
          </PreviewAppLayout>
          {/* Colour overlay */}
          <div
            className="absolute inset-0"
            style={{ background: "var(--color-overlay)", opacity: 0.3 }}
          />
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="surface-light bg-surface flex flex-1 flex-col">
        {/* Logo */}
        <div className="flex items-center gap-3 bg-white px-6 py-4">
          <Link to={ROUTES.dashboard} className="flex items-center gap-3 no-underline">
            <Logo />
          </Link>
        </div>

        {/* Form area — vertically + horizontally centred */}
        <div className="flex flex-1 items-center justify-center px-6 py-8">{children}</div>
      </div>
    </div>
  )
}
