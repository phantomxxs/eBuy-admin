import Logo from "./logo"

interface MobileTopBarProps {
  onMenuOpen: () => void
}

export default function MobileTopBar({ onMenuOpen }: MobileTopBarProps) {
  return (
    <header className="border-brand/3 shadow-soft flex h-15 items-center justify-between border-t border-b bg-white px-4">
      {/* Logo */}
      <div className="flex items-center gap-2.5">
        <Logo />
      </div>

      {/* Hamburger button */}
      <button
        onClick={onMenuOpen}
        aria-label="Open navigation menu"
        className="border-brand/3 bg-brand/1 text-brand/50 hover:bg-brand/5 hover:text-brand flex items-center rounded border p-2 transition-colors"
      >
        <HamburgerIcon />
      </button>
    </header>
  )
}

const HamburgerIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <path d="M2.5 10H17.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M2.5 5H17.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M2.5 15H17.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
)
