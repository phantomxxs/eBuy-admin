import type { ReactNode } from "react"
import { cn } from "@/lib/utils"
import { Switch } from "@/components/ui/switch"
import { Skeleton } from "@/components/ui/skeleton"

export const SectionCard = ({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle?: string
  children: ReactNode
}) => (
  <div className="border-borderSubtle overflow-hidden rounded-xl border bg-white">
    <div className="border-borderSubtle border-b px-6 py-4">
      <h2 className="font-jakarta text-brand text-sm font-semibold">{title}</h2>
      {subtitle && <p className="font-jakarta text-brand/50 mt-0.5 text-xs">{subtitle}</p>}
    </div>
    <div className="p-6">{children}</div>
  </div>
)

export const ToggleRow = ({
  label,
  desc,
  checked,
  onChange,
}: {
  label: string
  desc?: string
  checked: boolean
  onChange: () => void
}) => (
  <div className="flex items-center justify-between py-3">
    <div>
      <p className="font-jakarta text-brand text-sm font-medium">{label}</p>
      {desc && <p className="font-jakarta text-brand/50 text-xs">{desc}</p>}
    </div>
    <Switch size="lg" checked={checked} onCheckedChange={onChange} />
  </div>
)

export const SectionLoading = () => (
  <div className="border-borderSubtle overflow-hidden rounded-xl border bg-white">
    {/* header */}
    <div className="border-borderSubtle border-b px-6 py-4">
      <Skeleton className="h-4 w-36" />
      <Skeleton className="mt-1.5 h-3 w-52" />
    </div>
    {/* field grid */}
    <div className="grid grid-cols-1 gap-4 p-6 lg:grid-cols-2">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex flex-col gap-1.5">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-10 w-full rounded-lg" />
        </div>
      ))}
      <div className="flex flex-col gap-1.5 lg:col-span-2">
        <Skeleton className="h-3 w-32" />
        <Skeleton className="h-10 w-full rounded-lg" />
      </div>
      <div className="flex flex-col gap-1.5 lg:col-span-2">
        <Skeleton className="h-3 w-28" />
        <Skeleton className="h-24 w-full rounded-lg" />
      </div>
    </div>
  </div>
)

export const ComingSoonSection = ({ label }: { label: string }) => (
  <div className="border-borderSubtle flex h-40 items-center justify-center rounded-xl border bg-white">
    <p className="font-jakarta text-brand/40 text-sm">{label} — coming soon</p>
  </div>
)

export const SettingsField = ({
  label,
  children,
  className,
  error,
}: {
  label: string
  children: ReactNode
  className?: string
  error?: string
}) => (
  <div className={cn("flex flex-col gap-1.5", className)}>
    <label className="font-jakarta text-brand text-sm font-semibold tracking-[-0.04em]">
      {label}
    </label>
    {children}
    {error && <p className="font-jakarta text-destructive text-xs">{error}</p>}
  </div>
)

export const SettingsInput = ({
  value,
  onChange,
  onBlur,
  placeholder,
  type = "text",
}: {
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onBlur?: () => void
  placeholder?: string
  type?: string
}) => (
  <input
    type={type}
    value={value}
    onChange={onChange}
    onBlur={onBlur}
    placeholder={placeholder}
    className="font-jakarta text-brand placeholder:text-brand/40 focus:border-primary/30 focus:ring-primary/20 border-brand/8 h-10 w-full rounded-lg border bg-white px-4 text-sm tracking-[-0.02em] outline-none focus:ring-1"
  />
)

export const SettingsSelect = ({
  value,
  onChange,
  options,
}: {
  value: string
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void
  options: string[]
}) => (
  <select
    value={value}
    onChange={onChange}
    className="font-jakarta text-brand focus:border-primary/30 focus:ring-primary/20 border-brand/8 h-10 w-full rounded-lg border bg-white px-4 text-sm outline-none focus:ring-1"
  >
    {options.map((o) => (
      <option key={o} value={o}>
        {o}
      </option>
    ))}
  </select>
)
