import { CheckCircle2, XCircle, AlertTriangle, Info } from "lucide-react"
import { cn } from "@/lib/utils"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"

type AlertVariant = "success" | "error" | "warning" | "info"

const ICON_MAP: Record<AlertVariant, React.ElementType> = {
  success: CheckCircle2,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
}

export interface EBuyAlertProps {
  variant: AlertVariant
  message: string | null
  title?: string
  className?: string
}

export default function EBuyAlert({ variant, message, title, className }: EBuyAlertProps) {
  if (!message) return null
  const Icon = ICON_MAP[variant]
  return (
    <Alert variant={variant} className={cn("", className)}>
      <Icon size={16} />
      {title && <AlertTitle>{title}</AlertTitle>}
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  )
}
