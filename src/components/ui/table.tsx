import { cn } from "@/lib/utils"

// ── Primitives ────────────────────────────────────────────────

export const Table = ({
  className,
  children,
}: {
  className?: string
  children: React.ReactNode
}) => (
  <div className="w-full overflow-x-auto">
    <table className={cn("w-full border-collapse", className)}>{children}</table>
  </div>
)

export const TableHead = ({
  className,
  children,
}: {
  className?: string
  children: React.ReactNode
}) => <thead className={className}>{children}</thead>

export const TableBody = ({
  className,
  children,
}: {
  className?: string
  children: React.ReactNode
}) => <tbody className={className}>{children}</tbody>

export const TableRow = ({
  className,
  onClick,
  children,
}: {
  className?: string
  onClick?: () => void
  children: React.ReactNode
}) => (
  <tr
    onClick={onClick}
    className={cn(
      "border-brand/3 border-b transition-colors last:border-0",
      onClick && "hover:bg-brand/2 cursor-pointer",
      className,
    )}
  >
    {children}
  </tr>
)

export const TableHeaderCell = ({
  className,
  style,
  children,
}: {
  className?: string
  style?: React.CSSProperties
  children: React.ReactNode
}) => (
  <th
    style={style}
    className={cn(
      "font-jakarta text-brand/60 h-12 px-6 py-2 text-left text-sm leading-[1.5] font-medium tracking-[-0.04em] whitespace-nowrap",
      className,
    )}
  >
    {children}
  </th>
)

export const TableCell = ({
  className,
  style,
  children,
}: {
  className?: string
  style?: React.CSSProperties
  children: React.ReactNode
}) => (
  <td
    style={style}
    className={cn(
      "font-jakarta text-brand h-16 px-6 py-2 text-sm leading-normal font-medium tracking-[-0.04em]",
      className,
    )}
  >
    {children}
  </td>
)
