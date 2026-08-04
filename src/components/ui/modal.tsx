import type { ReactNode } from "react"
import { VisuallyHidden } from "radix-ui"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import type { VariantProps } from "class-variance-authority"
import type { buttonVariants } from "@/components/ui/button-variants"
import { useIsMobile } from "@/hooks/useIsMobile"

type ButtonTheme = VariantProps<typeof buttonVariants>["variant"]

export interface ModalProps {
  isOpen: boolean
  onClose: () => void

  // Layout variant
  variant?: "drawer" | "dialog"

  // Dialog-specific
  className?: string

  // Header
  title?: string
  titleIcon?: ReactNode
  customHeader?: ReactNode
  hideHeader?: boolean

  // Content
  children: ReactNode

  // Footer
  primaryText?: string
  onClick?: () => void
  primaryBtnType?: "submit" | "button"
  primaryBtnId?: string
  loading?: boolean
  disabled?: boolean
  theme?: ButtonTheme
  secondaryText?: string
  secondaryBtnId?: string
  footerLeft?: ReactNode
  customFooter?: ReactNode
  hideFooter?: boolean

  // Prevent dismissal (backdrop click / ESC) while async work is in flight
  preventClose?: boolean

  // Drawer-only options
  position?: "right" | "left" | "top" | "bottom"
  size?: "default" | "small"
  width?: string
}

// ── Main export ───────────────────────────────────────────────

export default function Modal({
  isOpen,
  onClose,
  variant = "drawer",
  className,
  title,
  titleIcon,
  customHeader,
  hideHeader = false,
  children,
  primaryText,
  onClick,
  primaryBtnType = "button",
  primaryBtnId,
  loading = false,
  disabled = false,
  theme = "default",
  secondaryText = "Cancel",
  secondaryBtnId,
  footerLeft,
  customFooter,
  hideFooter = false,
  preventClose = false,
  position = "right",
  size = "default",
  width,
}: ModalProps) {
  const isMobile = useIsMobile()
  const resolvedVariant = variant === "dialog" && isMobile ? "drawer" : variant
  const resolvedPosition =
    isMobile && (variant === "dialog" || position === "right" || position === "left")
      ? "bottom"
      : position

  const showDefaultHeader = !hideHeader && !customHeader && !!title
  const showDefaultFooter = !hideFooter && !customFooter && !!(primaryText || secondaryText)

  const body = (
    <>
      {!hideHeader && (
        <ModalHeader
          custom={customHeader}
          title={title}
          titleIcon={titleIcon}
          show={showDefaultHeader}
          isDialog={resolvedVariant === "dialog"}
        />
      )}
      {(hideHeader && hideFooter) || (customHeader != null && customFooter != null) ? (
        <div className="flex-1 overflow-y-auto">{children}</div>
      ) : (
        <div className="flex-1 overflow-y-auto">{children}</div>
      )}
      {(!hideFooter || customFooter) && (
        <ModalFooter
          custom={customFooter}
          show={showDefaultFooter}
          primaryText={primaryText}
          onClick={onClick}
          primaryBtnType={primaryBtnType}
          primaryBtnId={primaryBtnId}
          loading={loading}
          disabled={disabled}
          theme={theme}
          secondaryText={secondaryText}
          secondaryBtnId={secondaryBtnId}
          footerLeft={footerLeft}
          onClose={onClose}
        />
      )}
    </>
  )

  if (resolvedVariant === "dialog") {
    return (
      <Dialog open={isOpen} onOpenChange={(open) => !open && !preventClose && onClose()}>
        <DialogContent
          showCloseButton={false}
          className={className ?? "max-w-md p-0"}
          style={width ? { width, maxWidth: width } : undefined}
        >
          {(!title || hideHeader) && (
            <VisuallyHidden.Root>
              <DialogTitle>{title ?? "Dialog"}</DialogTitle>
              <DialogDescription>Dialog</DialogDescription>
            </VisuallyHidden.Root>
          )}
          <div
            className="flex max-h-[90vh] flex-col gap-0"
            style={width ? { maxWidth: width } : undefined}
          >
            {body}
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && !preventClose && onClose()}>
      <SheetContent
        side={resolvedPosition}
        showCloseButton={false}
        className={
          resolvedPosition === "bottom"
            ? "flex max-h-[90vh] flex-col gap-0 rounded-t-2xl p-0"
            : resolvedPosition === "left"
              ? "flex flex-col gap-0 p-0 sm:inset-y-6 sm:left-6 sm:h-[calc(100vh-3rem)] sm:max-w-md sm:rounded-xl"
              : "flex flex-col gap-0 p-0 sm:inset-y-6 sm:right-6 sm:h-[calc(100vh-3rem)] sm:max-w-md sm:rounded-xl"
        }
        style={
          resolvedPosition !== "bottom"
            ? width
              ? { width, maxWidth: width }
              : size === "small"
                ? { maxWidth: 400 }
                : undefined
            : undefined
        }
      >
        {!showDefaultHeader && (
          <VisuallyHidden.Root>
            <SheetTitle>{title ?? "Panel"}</SheetTitle>
            <SheetDescription>Panel</SheetDescription>
          </VisuallyHidden.Root>
        )}
        <div
          className="flex flex-1 flex-col gap-0 overflow-hidden"
          style={width ? { maxWidth: width } : undefined}
        >
          {body}
        </div>
      </SheetContent>
    </Sheet>
  )
}

// ── Sub-components ────────────────────────────────────────────

interface ModalHeaderProps {
  custom?: ReactNode
  title?: string
  titleIcon?: ReactNode
  show: boolean
  isDialog?: boolean
}

const ModalHeader = ({ custom, title, titleIcon, show, isDialog }: ModalHeaderProps) => {
  if (custom) return <>{custom}</>

  if (!show) return null

  return (
    <div className="flex items-center border-b border-gray-100 px-6 py-5">
      {isDialog ? (
        <DialogTitle className="font-jakarta text-brand flex items-center gap-2 text-base font-semibold">
          {titleIcon}
          {title}
        </DialogTitle>
      ) : (
        <SheetTitle className="font-jakarta text-brand flex items-center gap-2 text-base font-semibold">
          {titleIcon}
          {title}
        </SheetTitle>
      )}
    </div>
  )
}

interface ModalFooterProps {
  custom?: ReactNode
  show: boolean
  primaryText?: string
  onClick?: () => void
  primaryBtnType?: "submit" | "button"
  primaryBtnId?: string
  loading?: boolean
  disabled?: boolean
  theme?: ButtonTheme
  secondaryText?: string
  secondaryBtnId?: string
  footerLeft?: ReactNode
  onClose: () => void
}

const ModalFooter = ({
  custom,
  show,
  primaryText,
  onClick,
  primaryBtnType,
  primaryBtnId,
  loading,
  disabled,
  theme,
  secondaryText,
  secondaryBtnId,
  footerLeft,
  onClose,
}: ModalFooterProps) => {
  if (custom) return <>{custom}</>

  if (!show) return null

  return (
    <div className="border-t border-gray-100 px-4 py-4 sm:px-6">
      {footerLeft && <div className="mb-3">{footerLeft}</div>}
      <div className="flex gap-2">
        {secondaryText && (
          <Button
            id={secondaryBtnId}
            label={secondaryText}
            variant="subtle"
            size="default"
            type="button"
            onClick={onClose}
            className="flex-1"
          />
        )}
        {primaryText && (
          <Button
            id={primaryBtnId}
            label={loading ? "Loading…" : primaryText}
            theme={theme}
            size="default"
            type={primaryBtnType}
            disabled={disabled || loading}
            onClick={onClick}
            className="flex-1"
          />
        )}
      </div>
    </div>
  )
}
