import { Trash2, EyeOff, Archive, PauseCircle, Eye } from "lucide-react"
import Modal from "@/components/ui/modal"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type Variant = "delete" | "deactivate" | "reactivate" | "archive" | "pause"

const VARIANT_CONFIG: Record<
  Variant,
  {
    Icon: React.ElementType
    iconBg: string
    iconColor: string
    title: (entityType: string) => string
    description: (entityName: string | undefined, entityType: string) => string
    confirmLabel: (entityType: string) => string
    buttonClass: string
  }
> = {
  delete: {
    Icon: Trash2,
    iconBg: "bg-danger/8",
    iconColor: "text-danger",
    title: (t) => `Delete ${t}`,
    description: (name, t) =>
      name
        ? `Are you sure you want to delete "${name}"? This action cannot be undone.`
        : `Are you sure you want to delete this ${t}? This action cannot be undone.`,
    confirmLabel: (t) => `Delete ${t}`,
    buttonClass: "border border-danger/8 bg-danger/4 text-danger hover:bg-danger/8",
  },
  deactivate: {
    Icon: EyeOff,
    iconBg: "bg-statusWarning/10",
    iconColor: "text-statusWarning",
    title: (t) => `Deactivate ${t}`,
    description: (name, t) =>
      name
        ? `Are you sure you want to deactivate "${name}"? You can reactivate it at any time.`
        : `Are you sure you want to deactivate this ${t}? You can reactivate it at any time.`,
    confirmLabel: (t) => `Deactivate ${t}`,
    buttonClass:
      "border border-statusWarning/20 bg-statusWarning/8 text-statusWarning hover:bg-statusWarning/15",
  },
  reactivate: {
    Icon: Eye,
    iconBg: "bg-statusSuccess/10",
    iconColor: "text-statusSuccess",
    title: (t) => `Activate ${t}`,
    description: (name, t) =>
      name
        ? `Are you sure you want to activate "${name}"?`
        : `Are you sure you want to activate this ${t}?`,
    confirmLabel: (t) => `Activate ${t}`,
    buttonClass:
      "border border-statusSuccess/20 bg-statusSuccess/8 text-statusSuccess hover:bg-statusSuccess/15",
  },
  archive: {
    Icon: Archive,
    iconBg: "bg-hint/10",
    iconColor: "text-hint",
    title: (t) => `Archive ${t}`,
    description: (name, t) =>
      name
        ? `Are you sure you want to archive "${name}"? You can unarchive it at any time.`
        : `Are you sure you want to archive this ${t}? You can unarchive it at any time.`,
    confirmLabel: (t) => `Archive ${t}`,
    buttonClass: "border border-hint/20 bg-hint/8 text-hint hover:bg-hint/15",
  },
  pause: {
    Icon: PauseCircle,
    iconBg: "bg-statusWarning/10",
    iconColor: "text-statusWarning",
    title: (t) => `Pause ${t}`,
    description: (name, t) =>
      name
        ? `Are you sure you want to pause "${name}"? You can resume it at any time.`
        : `Are you sure you want to pause this ${t}? You can resume it at any time.`,
    confirmLabel: (t) => `Pause ${t}`,
    buttonClass:
      "border border-statusWarning/20 bg-statusWarning/8 text-statusWarning hover:bg-statusWarning/15",
  },
}

interface Props {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  entityType: string
  entityName?: string
  variant?: Variant
  isLoading?: boolean
}

export default function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  entityType,
  entityName,
  variant = "delete",
  isLoading,
}: Props) {
  const cfg = VARIANT_CONFIG[variant]
  const { Icon } = cfg

  const customFooter = (
    <div className="border-borderSubtle flex w-full gap-3 border-t px-6 py-4">
      <Button variant="subtle" onClick={onClose} className="flex-1" disabled={isLoading}>
        Cancel
      </Button>
      <Button
        variant="ghost"
        onClick={onConfirm}
        loading={isLoading}
        disabled={isLoading}
        className={cn(cfg.buttonClass, "flex-1")}
      >
        {cfg.confirmLabel(entityType)}
      </Button>
    </div>
  )

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      variant="dialog"
      className="max-w-sm p-0"
      preventClose={isLoading}
      customFooter={customFooter}
    >
      <div className="flex flex-col items-center px-6 py-6 text-center">
        <div
          className={`mb-4 flex h-12 w-12 items-center justify-center rounded-full ${cfg.iconBg}`}
        >
          <Icon size={20} className={cfg.iconColor} />
        </div>
        <h2 className="font-jakarta text-brand text-base font-semibold">{cfg.title(entityType)}</h2>
        <p className="font-jakarta text-brand/60 mt-2 text-sm">
          {cfg.description(entityName, entityType)}
        </p>
      </div>
    </Modal>
  )
}
