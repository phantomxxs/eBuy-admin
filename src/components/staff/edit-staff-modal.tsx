import { useEffect } from "react"
import { useForm } from "@tanstack/react-form"
import { X } from "lucide-react"
import Modal from "@/components/ui/modal"
import { Button } from "@/components/ui/button"
import FormInput from "@/components/ui/form-input"
import { editStaffSchema, type EditStaffFormValues } from "@/validations/staff"
import { validateField } from "@/lib/utils"
import { useUpdateStaff } from "@/store/mutations/staff"
import type { AppUser } from "@/types/staff"
import { showAlert } from "@/store/alerts"

interface Props {
  isOpen: boolean
  onClose: () => void
  user: AppUser | null
}

export default function EditStaffModal({ isOpen, onClose, user }: Props) {
  const updateStaff = useUpdateStaff()

  const form = useForm({
    defaultValues: { firstName: "", lastName: "", email: "" } satisfies EditStaffFormValues,
    onSubmit: ({ value }) => {
      if (!user) return
      updateStaff.mutate(
        { id: user.id, firstname: value.firstName, lastname: value.lastName, email: value.email },
        {
          onSuccess: () => {
            showAlert({ variant: "success", message: "Staff updated successfully" })
            onClose()
          },
          onError: (error) => showAlert({ variant: "error", message: error.message }),
        },
      )
    },
  })

  useEffect(() => {
    if (user && isOpen) {
      const [firstName = "", ...rest] = user.name.split(" ")
      form.reset({ firstName, lastName: rest.join(" "), email: user.email })
    }
  }, [user, isOpen])

  if (!user) return null

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      variant="drawer"
      width="520px"
      preventClose={updateStaff.isPending}
      customHeader={
        <div className="border-line shrink-0 border-b px-6 py-4">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="font-jakarta text-brand text-base font-semibold tracking-[-0.04em]">
                Edit staff
              </h2>
              <p className="font-jakarta text-brand/60 mt-0.5 text-sm">{user.name}</p>
            </div>
            <button
              onClick={onClose}
              className="text-brand/40 hover:text-brand ml-4 shrink-0 rounded p-0.5 transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      }
      customFooter={
        <div className="border-borderSubtle shrink-0 border-t p-4 sm:p-6">
          <div className="flex gap-3">
            <Button
              variant="subtle"
              onClick={onClose}
              className="flex-1"
              disabled={updateStaff.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="secondary"
              onClick={() => form.handleSubmit()}
              className="flex-1"
              disabled={updateStaff.isPending}
              loading={updateStaff.isPending}
            >
              Save changes
            </Button>
          </div>
        </div>
      }
    >
      <div className="flex flex-col gap-4 px-6 py-5">
        <p className="font-jakarta text-brand/60 text-xs font-semibold tracking-wide uppercase">
          Personal information
        </p>
        <div className="grid grid-cols-2 gap-3">
          <form.Field
            name="firstName"
            validators={{
              onBlur: ({ value }) => validateField(editStaffSchema, "firstName", value),
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
              onBlur: ({ value }) => validateField(editStaffSchema, "lastName", value),
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
        </div>
        <form.Field
          name="email"
          validators={{ onBlur: ({ value }) => validateField(editStaffSchema, "email", value) }}
        >
          {(field) => (
            <FormInput
              label="Email address"
              type="email"
              value={field.state.value}
              onChange={field.handleChange}
              onBlur={field.handleBlur}
              placeholder="Enter email address"
              error={field.state.meta.errors[0]?.toString()}
            />
          )}
        </form.Field>
      </div>
    </Modal>
  )
}
