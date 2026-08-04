import { ChevronDown, Check, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible"

export function OrderSection({
  title,
  defaultOpen = false,
  children,
}: {
  title: string
  defaultOpen?: boolean
  children: React.ReactNode
}) {
  return (
    <Collapsible defaultOpen={defaultOpen} className="py-1">
      <CollapsibleTrigger className="group flex w-full items-center justify-between py-3">
        <span className="font-jakarta text-xxs text-brand/35 font-semibold tracking-widest uppercase">
          {title}
        </span>
        <ChevronDown
          size={14}
          className="text-brand/30 transition-transform group-data-[state=open]:rotate-180"
        />
      </CollapsibleTrigger>
      <CollapsibleContent>{children}</CollapsibleContent>
    </Collapsible>
  )
}

export const DetailRow = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="border-borderSubtle flex items-center justify-between border-b py-3">
    <span className="font-jakarta text-brand/50 text-sm">{label}</span>
    {typeof value === "string" ? (
      <span className="font-jakarta text-brand text-sm font-medium">{value}</span>
    ) : (
      value
    )}
  </div>
)

export const StepItem = ({
  label,
  timestamp,
  isDone,
  isLast,
}: {
  label: string
  timestamp?: string
  isDone: boolean
  isLast: boolean
}) => (
  <div className={cn("flex flex-1 flex-col items-center gap-1", !isLast && "flex-1")}>
    <div
      className={cn(
        "flex h-6 w-6 items-center justify-center rounded-full md:h-7 md:w-7",
        isDone ? "bg-green-100" : "bg-gray-100",
      )}
    >
      {isDone ? (
        <Check size={12} className="text-green-600" strokeWidth={2.5} />
      ) : (
        <Loader2 size={12} className="text-gray-400" />
      )}
    </div>
    <span className="font-jakarta text-brand/60 md:text-xxs text-center text-[9px] leading-tight font-semibold">
      {label}
    </span>
    {timestamp && (
      <span className="font-jakarta text-brand/40 md:text-xxs text-center text-[9px]">
        {timestamp}
      </span>
    )}
  </div>
)
