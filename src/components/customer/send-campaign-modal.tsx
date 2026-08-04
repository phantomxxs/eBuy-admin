import { useForm } from "@tanstack/react-form"
import { X } from "lucide-react"
import Modal from "@/components/ui/modal"
import { Button } from "@/components/ui/button"
import FormInput from "@/components/ui/form-input"
import FormTextarea from "@/components/ui/form-textarea"
import Dropdown from "@/components/ui/dropdown"
import { useCreateCustomerCampaign } from "@/store/mutations/customers"
import { showAlert } from "@/store/alerts"

interface Props {
  isOpen: boolean
  onClose: () => void
}

const AUDIENCE_OPTIONS = [
  { label: "All customers", value: "all" },
  { label: "Registered customers only", value: "registered" },
]

export default function SendCampaignModal({ isOpen, onClose }: Props) {
  const createCampaign = useCreateCustomerCampaign()

  const form = useForm({
    defaultValues: {
      subject: "",
      message: "",
      audience: "all",
    },
    onSubmit: ({ value }) => {
      const payload = {
        subject: value.subject,
        message: value.message,
        registeredOnly: value.audience === "registered",
        guestOnly: value.audience === "guest",
        status:
          value.audience === "active" || value.audience === "inactive" ? value.audience : undefined,
      }

      createCampaign.mutate(payload, {
        onSuccess: () => {
          showAlert({ variant: "success", message: "Campaign sent successfully" })
          form.reset()
          onClose()
        },
        onError: (e) => showAlert({ variant: "error", message: e.message }),
      })
    },
  })

  const customHeader = (
    <div className="border-line shrink-0 border-b px-6 py-4">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="font-jakarta text-brand text-base font-semibold tracking-[-0.04em]">
            Send campaign
          </h2>
          <p className="font-jakarta text-brand/60 mt-0.5 text-sm font-medium tracking-[-0.04em]">
            Compose and send an email campaign to your customers
          </p>
        </div>
        <button
          onClick={onClose}
          disabled={createCampaign.isPending}
          className="text-brand/40 hover:text-brand ml-4 shrink-0 rounded p-0.5 transition-colors disabled:opacity-40"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  )

  const customFooter = (
    <div className="border-borderSubtle shrink-0 border-t p-4 sm:p-6">
      <div className="flex gap-3">
        <Button
          variant="subtle"
          onClick={onClose}
          className="flex-1"
          disabled={createCampaign.isPending}
        >
          Cancel
        </Button>
        <Button
          variant="secondary"
          onClick={() => form.handleSubmit()}
          className="flex-1"
          loading={createCampaign.isPending}
        >
          Send campaign
        </Button>
      </div>
    </div>
  )

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      variant="drawer"
      customHeader={customHeader}
      customFooter={customFooter}
      width="560px"
      preventClose={createCampaign.isPending}
    >
      <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
        <form.Field
          name="subject"
          validators={{
            onBlur: ({ value }) => (!value.trim() ? "Subject is required" : undefined),
          }}
        >
          {(field) => (
            <FormInput
              label="Subject"
              value={field.state.value}
              onChange={field.handleChange}
              onBlur={field.handleBlur}
              placeholder="Enter campaign subject"
              error={field.state.meta.errors[0]?.toString()}
            />
          )}
        </form.Field>

        <form.Field
          name="message"
          validators={{
            onBlur: ({ value }) => (!value.trim() ? "Message is required" : undefined),
          }}
        >
          {(field) => (
            <FormTextarea
              label="Message"
              value={field.state.value}
              onChange={field.handleChange}
              onBlur={field.handleBlur}
              placeholder="Write your campaign message..."
              rows={6}
              error={field.state.meta.errors[0]?.toString()}
            />
          )}
        </form.Field>

        <form.Field name="audience">
          {(field) => (
            <Dropdown
              label="Audience"
              options={AUDIENCE_OPTIONS}
              value={field.state.value}
              onChange={field.handleChange}
              placeholder="Select audience"
            />
          )}
        </form.Field>
      </div>
    </Modal>
  )
}
