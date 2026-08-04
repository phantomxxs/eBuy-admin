import { useEffect } from "react"
import { X, CheckCircle2, XCircle, AlertTriangle, Info } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAlertStore, type AlertItem, type AlertVariant } from "@/store/alerts"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"

const ICON_MAP: Record<AlertVariant, React.ElementType> = {
  success: CheckCircle2,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
}

export default function EBuyAlertContainer() {
  const alerts = useAlertStore((s) => s.alerts)
  return (
    <div
      className="fixed top-4 right-4 z-[200] flex w-80 max-w-[calc(100vw-2rem)] flex-col gap-2"
      aria-live="polite"
      aria-label="Notifications"
    >
      {alerts.map((alert) => (
        <AlertToast key={alert.id} alert={alert} />
      ))}
    </div>
  )
}

function AlertToast({ alert }: { alert: AlertItem }) {
  const dismiss = useAlertStore((s) => s.dismiss)
  const duration = alert.duration ?? 4000

  useEffect(() => {
    if (duration === 0) return
    const t = setTimeout(() => dismiss(alert.id), duration)
    return () => clearTimeout(t)
  }, [alert.id, duration, dismiss])

  const Icon = ICON_MAP[alert.variant]

  return (
    <Alert
      variant={alert.variant}
      className={cn(
        "shadow-float animate-in fade-in slide-in-from-right-4 relative pr-8 duration-200",
      )}
    >
      <Icon size={16} />
      {alert.title && <AlertTitle>{alert.title}</AlertTitle>}
      <AlertDescription>{alert.message}</AlertDescription>
      <button
        onClick={() => dismiss(alert.id)}
        aria-label="Dismiss"
        className="absolute top-2.5 right-2.5 rounded p-0.5 opacity-60 transition-opacity hover:opacity-100"
      >
        <X size={14} />
      </button>
    </Alert>
  )
}
