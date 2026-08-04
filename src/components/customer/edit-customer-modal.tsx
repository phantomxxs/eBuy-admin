import { useEffect } from "react"
import { useForm } from "@tanstack/react-form"
import { X } from "lucide-react"
import Modal from "@/components/ui/modal"
import { Button } from "@/components/ui/button"
import Dropdown from "@/components/ui/dropdown"
import FormInput from "@/components/ui/form-input"
import type { CustomerDetail } from "@/types/customers"
import { getInitials } from "@/store/normalizers/customers"
import { editCustomerSchema, type EditCustomerFormValues } from "@/validations/customer"
import { validateField } from "@/lib/utils"
import { useUpdateCustomerProfile } from "@/store/mutations/customers"
import { showAlert } from "@/store/alerts"

interface Props {
  isOpen: boolean
  onClose: () => void
  customer: CustomerDetail
}

export default function EditCustomerModal({ isOpen, onClose, customer }: Props) {
  const updateProfile = useUpdateCustomerProfile()

  const form = useForm({
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      isSubscribed: false as boolean,
    } satisfies EditCustomerFormValues,
    onSubmit: ({ value }) => {
      updateProfile.mutate(
        {
          entityId: customer.entity_id,
          firstname: value.firstName,
          lastname: value.lastName,
          email: value.email,
          phoneNumber: value.phone || undefined,
          isSubscribed: value.isSubscribed,
        },
        {
          onSuccess: () => {
            showAlert({ variant: "success", message: "Customer profile updated" })
            onClose()
          },
          onError: (e) => showAlert({ variant: "error", message: e.message }),
        },
      )
    },
  })

  useEffect(() => {
    if (!customer || !isOpen) return
    const nameParts = customer.customer_name.trim().split(/\s+/)
    form.setFieldValue("firstName", nameParts[0] ?? "")
    form.setFieldValue("lastName", nameParts.slice(1).join(" ") ?? "")
    form.setFieldValue("email", customer.email)
    form.setFieldValue("phone", customer.phone ?? "")
    const consent = customer.marketing_consent?.toLowerCase()
    form.setFieldValue("isSubscribed", consent === "opted in" || consent === "subscribed")
  }, [customer, isOpen])

  if (!customer) return null

  const customHeader = (
    <div className="border-line shrink-0 border-b px-6 py-4">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="font-jakarta text-brand text-base font-semibold tracking-[-0.04em]">
            Edit customer profile
          </h2>
          <p className="font-jakarta text-brand/60 mt-0.5 text-sm font-medium tracking-[-0.04em]">
            {customer.customer_id}
          </p>
        </div>
        <button
          onClick={onClose}
          disabled={updateProfile.isPending}
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
          disabled={updateProfile.isPending}
        >
          Cancel
        </Button>
        <Button
          variant="secondary"
          onClick={() => form.handleSubmit()}
          className="flex-1"
          loading={updateProfile.isPending}
        >
          Save changes
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
      preventClose={updateProfile.isPending}
    >
      <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
        <div className="flex items-center gap-4">
          <div className="bg-primary/15 flex h-16 w-16 shrink-0 items-center justify-center rounded-full">
            <span className="font-jakarta text-primary text-xl font-bold">
              {getInitials(customer.customer_name)}
            </span>
          </div>
          <div>
            <p className="font-jakarta text-brand text-sm font-semibold">
              {customer.customer_name}
            </p>
            <p className="font-jakarta text-brand/50 text-xs">{customer.customer_id}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <form.Field
            name="firstName"
            validators={{
              onBlur: ({ value }) => validateField(editCustomerSchema, "firstName", value),
            }}
          >
            {(field) => (
              <FormInput
                label="First name"
                value={field.state.value}
                onChange={field.handleChange}
                onBlur={field.handleBlur}
                placeholder="Enter first name"
                error={field.state.meta.errors[0]?.toString()}
              />
            )}
          </form.Field>
          <form.Field
            name="lastName"
            validators={{
              onBlur: ({ value }) => validateField(editCustomerSchema, "lastName", value),
            }}
          >
            {(field) => (
              <FormInput
                label="Last name"
                value={field.state.value}
                onChange={field.handleChange}
                onBlur={field.handleBlur}
                placeholder="Enter last name"
                error={field.state.meta.errors[0]?.toString()}
              />
            )}
          </form.Field>
          <form.Field
            name="email"
            validators={{
              onBlur: ({ value }) => validateField(editCustomerSchema, "email", value),
            }}
          >
            {(field) => (
              <FormInput
                label="Email address"
                type="email"
                value={field.state.value}
                onChange={field.handleChange}
                onBlur={field.handleBlur}
                placeholder="Enter email"
                error={field.state.meta.errors[0]?.toString()}
              />
            )}
          </form.Field>
          <form.Field name="phone">
            {(field) => (
              <FormInput
                label="Phone number"
                value={field.state.value ?? ""}
                onChange={field.handleChange}
                placeholder="+234 000 000 0000"
              />
            )}
          </form.Field>
          <form.Field name="isSubscribed">
            {(field) => (
              <Dropdown
                label="Marketing consent"
                options={[
                  { label: "Subscribed", value: "true" },
                  { label: "Unsubscribed", value: "false" },
                ]}
                value={String(field.state.value)}
                onChange={(v) => field.handleChange(v === "true")}
                placeholder="Select consent"
              />
            )}
          </form.Field>
        </div>
      </div>
    </Modal>
  )
}
