import { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useCustomerBulkAction } from "@/store/mutations/customers"
import { showAlert } from "@/store/alerts"
import type { CustomerDetail } from "@/types/customers"
import { CustomerStatus } from "@/lib/constants"

interface Props {
  selectedCustomers: CustomerDetail[]
  onComplete: () => void
}

export default function BulkActionPanel({ selectedCustomers, onComplete }: Props) {
  const [showEmailForm, setShowEmailForm] = useState(false)
  const [emailSubject, setEmailSubject] = useState("")
  const [emailMessage, setEmailMessage] = useState("")
  const bulkAction = useCustomerBulkAction()

  const registeredCustomers = selectedCustomers.filter(
    (c) => c.customer_type !== CustomerStatus.GUEST,
  )
  const guestCustomers = selectedCustomers.filter((c) => c.customer_type === CustomerStatus.GUEST)
  const customerIds = registeredCustomers.map((c) => c.entity_id)
  const guestEmails = guestCustomers.map((c) => c.email)

  const handleAction = (action: string) => {
    bulkAction.mutate(
      { action, customerIds, guestEmails },
      {
        onSuccess: () => {
          showAlert({
            variant: "success",
            message: `Action "${action.replace(/_/g, " ")}" applied to ${selectedCustomers.length} customer(s)`,
          })
          onComplete()
        },
        onError: (e) => showAlert({ variant: "error", message: e.message }),
      },
    )
  }

  const handleSendEmail = () => {
    if (!emailSubject.trim() || !emailMessage.trim()) {
      showAlert({ variant: "error", message: "Subject and message are required" })
      return
    }
    bulkAction.mutate(
      {
        action: "send_direct_email",
        customerIds,
        guestEmails,
        subject: emailSubject,
        message: emailMessage,
      },
      {
        onSuccess: () => {
          showAlert({
            variant: "success",
            message: `Email sent to ${selectedCustomers.length} customer(s)`,
          })
          setShowEmailForm(false)
          setEmailSubject("")
          setEmailMessage("")
          onComplete()
        },
        onError: (e) => showAlert({ variant: "error", message: e.message }),
      },
    )
  }

  if (showEmailForm) {
    return (
      <div className="space-y-3">
        <input
          value={emailSubject}
          onChange={(e) => setEmailSubject(e.target.value)}
          placeholder="Subject"
          className="font-jakarta text-brand placeholder:text-brand/40 border-brand/8 focus:border-primary/30 w-full rounded-lg border bg-white px-3 py-2.5 text-sm outline-none"
        />
        <textarea
          rows={3}
          value={emailMessage}
          onChange={(e) => setEmailMessage(e.target.value)}
          placeholder="Message"
          className="font-jakarta text-brand placeholder:text-brand/40 border-brand/8 focus:border-primary/30 w-full resize-none rounded-lg border bg-white px-3 py-2.5 text-sm outline-none"
        />
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="flex-1"
            disabled={bulkAction.isPending}
            onClick={() => {
              setShowEmailForm(false)
              setEmailSubject("")
              setEmailMessage("")
            }}
          >
            Back
          </Button>
          <Button
            variant="secondary"
            className="flex-1"
            loading={bulkAction.isPending}
            onClick={handleSendEmail}
          >
            Send email
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-1">
      <ActionButton
        label="Activate accounts"
        onClick={() => handleAction("activate")}
        disabled={bulkAction.isPending}
      />
      <ActionButton
        label="Deactivate accounts"
        onClick={() => handleAction("deactivate")}
        disabled={bulkAction.isPending}
      />
      <ActionButton
        label="Suspend accounts"
        onClick={() => handleAction("suspend")}
        disabled={bulkAction.isPending}
        variant="warning"
      />
      <ActionButton
        label="Send password reset"
        onClick={() => handleAction("send_password_reset_email")}
        disabled={bulkAction.isPending}
      />
      <ActionButton
        label="Send direct email"
        onClick={() => setShowEmailForm(true)}
        disabled={bulkAction.isPending}
      />
      <div className="border-borderSubtle my-1 border-t" />
      <ActionButton
        label="Delete profiles"
        onClick={() => handleAction("delete_profile")}
        disabled={bulkAction.isPending}
        variant="danger"
      />
    </div>
  )
}

const ActionButton = ({
  label,
  onClick,
  disabled,
  variant = "default",
}: {
  label: string
  onClick: () => void
  disabled: boolean
  variant?: "default" | "warning" | "danger"
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={cn(
      "font-jakarta w-full rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors disabled:opacity-50",
      variant === "danger" && "text-danger hover:bg-danger/5",
      variant === "warning" && "text-statusWarning hover:bg-statusWarning/5",
      variant === "default" && "text-brand hover:bg-brand/5",
    )}
  >
    {label}
  </button>
)
