import { useForm } from "@tanstack/react-form"
import Modal from "@/components/ui/modal"
import { Button } from "@/components/ui/button"
import FormInput from "@/components/ui/form-input"
import Dropdown from "@/components/ui/dropdown"
import { createStaffSchema, type CreateStaffFormValues } from "@/validations/staff"
import { validateField } from "@/lib/utils"
import { useGetRoleOptions } from "@/store/queries/staff"
import { useCreateStaff } from "@/store/mutations/staff"
import LocationSearchInput from "@/components/ui/location-search-input"
import { showAlert } from "@/store/alerts"

interface Props {
  isOpen: boolean
  onClose: () => void
}

export default function CreateStaffModal({ isOpen, onClose }: Props) {
  const { data: roleOptions } = useGetRoleOptions()
  const createStaff = useCreateStaff()

  const form = useForm({
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      role: "",
      storeAccess: [] as string[],
    } satisfies CreateStaffFormValues,
    onSubmit: ({ value }) => {
      const allLocations = value.storeAccess.includes("0")
      createStaff.mutate(
        {
          firstname: value.firstName,
          lastname: value.lastName,
          email: value.email,
          password: value.password,
          roleId: Number(value.role),
          storeAccess: allLocations ? [] : value.storeAccess,
          ...(allLocations && { allLocations: true }),
        },
        {
          onSuccess: () => {
            showAlert({ variant: "success", message: "Staff member created successfully" })
            form.reset()
            onClose()
          },
          onError: (error) => showAlert({ variant: "error", message: error.message }),
        },
      )
    },
  })

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      variant="dialog"
      hideFooter
      preventClose={createStaff.isPending}
      customHeader={
        <div className="border-borderSubtle flex items-center justify-between border-b px-6 py-5">
          <h2 className="font-jakarta text-brand text-base font-semibold">Create staff</h2>
        </div>
      }
      customFooter={
        <div className="border-borderSubtle border-t px-4 py-4 sm:px-6">
          <div className="flex gap-2">
            <Button
              variant="subtle"
              className="flex-1"
              onClick={onClose}
              disabled={createStaff.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="secondary"
              className="flex-1"
              disabled={createStaff.isPending}
              loading={createStaff.isPending}
              onClick={() => form.handleSubmit()}
            >
              Create staff
            </Button>
          </div>
        </div>
      }
    >
      <div className="flex flex-col gap-4 px-6 py-5">
        <div className="grid grid-cols-2 gap-3">
          <form.Field
            name="firstName"
            validators={{
              onBlur: ({ value }) => validateField(createStaffSchema, "firstName", value),
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
              onBlur: ({ value }) => validateField(createStaffSchema, "lastName", value),
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
          validators={{ onBlur: ({ value }) => validateField(createStaffSchema, "email", value) }}
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

        <form.Field
          name="password"
          validators={{
            onBlur: ({ value }) => validateField(createStaffSchema, "password", value),
          }}
        >
          {(field) => (
            <FormInput
              label="Password"
              type="password"
              value={field.state.value}
              onChange={field.handleChange}
              onBlur={field.handleBlur}
              placeholder="Min. 8 characters"
              error={field.state.meta.errors[0]?.toString()}
            />
          )}
        </form.Field>

        <form.Field
          name="role"
          validators={{ onBlur: ({ value }) => validateField(createStaffSchema, "role", value) }}
        >
          {(field) => (
            <Dropdown
              label="Role"
              options={roleOptions ?? []}
              value={field.state.value}
              onChange={field.handleChange}
              onBlur={field.handleBlur}
              placeholder="Select a role"
              error={field.state.meta.errors[0]?.toString()}
            />
          )}
        </form.Field>

        <form.Field
          name="storeAccess"
          validators={{
            onBlur: ({ value }) => validateField(createStaffSchema, "storeAccess", value),
          }}
        >
          {(field) => (
            <LocationSearchInput
              multiple
              showAllOption
              label="Store access"
              value={field.state.value}
              onChange={field.handleChange}
              onBlur={field.handleBlur}
              placeholder="Search locations…"
              error={field.state.meta.errors[0]?.toString()}
            />
          )}
        </form.Field>
      </div>
    </Modal>
  )
}
