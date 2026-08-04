import { X } from "lucide-react"
import { useForm } from "@tanstack/react-form"
import { validateField } from "@/lib/utils"
import Modal from "@/components/ui/modal"
import FormInput from "@/components/ui/form-input"
import { Button } from "@/components/ui/button"
import { showAlert } from "@/store/alerts"
import { guestCustomerSchema, type GuestCustomerFormValues } from "@/validations/orders"

interface Props {
  isOpen: boolean
  onClose: () => void
  onConfirm: (info: GuestCustomerFormValues) => void
}

export const GuestCustomerModal = ({ isOpen, onClose, onConfirm }: Props) => {
  const form = useForm({
    defaultValues: {
      guestFirstName: "",
      guestLastName: "",
      guestEmail: "",
      guestPhone: "",
    } satisfies GuestCustomerFormValues,
    onSubmit: ({ value }) => {
      onConfirm(value)
      form.reset()
    },
  })

  const handleClose = () => {
    form.reset()
    onClose()
  }

  const handleConfirm = () => {
    if (!form.getFieldValue("guestEmail").trim()) {
      showAlert({ variant: "error", message: "Guest email is required" })
      return
    }
    form.handleSubmit()
  }

  const customHeader = (
    <div className="border-borderSubtle flex items-center justify-between border-b px-6 py-4">
      <div>
        <h3 className="font-jakarta text-brand text-sm font-semibold">Add guest customer</h3>
        <p className="font-jakarta text-brand/50 mt-0.5 text-xs">
          Continue without a registered account
        </p>
      </div>
      <button onClick={handleClose} className="text-brand/40 hover:text-brand rounded p-1">
        <X size={14} />
      </button>
    </div>
  )

  const customFooter = (
    <div className="border-borderSubtle flex flex-col gap-2 border-t px-6 py-4 md:flex-row">
      <Button variant="outline" onClick={handleClose} className="flex-1">
        Cancel
      </Button>
      <Button variant="secondary" onClick={handleConfirm} className="flex-1">
        Add guest
      </Button>
    </div>
  )

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      variant="dialog"
      customHeader={customHeader}
      customFooter={customFooter}
      className="p-0!"
    >
      <div className="flex flex-col gap-4 p-6">
        {/* Email — required */}
        <form.Field
          name="guestEmail"
          validators={{
            onBlur: ({ value }) => validateField(guestCustomerSchema, "guestEmail", value),
          }}
        >
          {(field) => (
            <FormInput
              label="Email"
              value={field.state.value}
              onChange={field.handleChange}
              onBlur={field.handleBlur}
              placeholder="guest@email.com"
              type="email"
              required
              error={field.state.meta.errors[0]?.toString()}
            />
          )}
        </form.Field>

        {/* First + Last name — optional */}
        <div className="flex gap-4">
          <form.Field name="guestFirstName">
            {(field) => (
              <FormInput
                label="First name"
                value={field.state.value}
                onChange={field.handleChange}
                onBlur={field.handleBlur}
                placeholder="Optional"
              />
            )}
          </form.Field>
          <form.Field name="guestLastName">
            {(field) => (
              <FormInput
                label="Last name"
                value={field.state.value}
                onChange={field.handleChange}
                onBlur={field.handleBlur}
                placeholder="Optional"
              />
            )}
          </form.Field>
        </div>

        {/* Phone — optional */}
        <form.Field name="guestPhone">
          {(field) => (
            <FormInput
              label="Phone"
              value={field.state.value}
              onChange={field.handleChange}
              onBlur={field.handleBlur}
              placeholder="+234 800 000 0000"
            />
          )}
        </form.Field>
      </div>
    </Modal>
  )
}
