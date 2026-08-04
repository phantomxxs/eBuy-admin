import { useForm } from "@tanstack/react-form"
import { useRef, useState } from "react"
import { Info } from "lucide-react"
import Modal from "@/components/ui/modal"
import { Button } from "@/components/ui/button"
import Dropdown from "@/components/ui/dropdown"
import FormInput from "@/components/ui/form-input"
import { inviteUserSchema, type InviteUserFormValues } from "@/validations/staff"
import { validateField } from "@/lib/utils"
import { useGetRoleOptions } from "@/store/queries/staff"
import { useCreateInvite } from "@/store/mutations/staff"
import LocationSearchInput from "@/components/ui/location-search-input"
import { showAlert } from "@/store/alerts"

interface InviteUserModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function InviteUserModal({ isOpen, onClose }: InviteUserModalProps) {
  const { data: roleOptions } = useGetRoleOptions()
  const createInvite = useCreateInvite()
  const sendRef = useRef(false)
  const [activeAction, setActiveAction] = useState<"draft" | "send" | null>(null)

  const form = useForm({
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      role: "",
      storeAccess: [] as string[],
    } satisfies InviteUserFormValues,
    onSubmit: ({ value }) => {
      const allLocations = value.storeAccess.includes("0")
      createInvite.mutate(
        {
          firstname: value.firstName,
          lastname: value.lastName,
          email: value.email,
          roleId: Number(value.role),
          storeAccess: allLocations ? [] : value.storeAccess,
          send: sendRef.current,
          ...(allLocations && { allLocations: true }),
        },
        {
          onSuccess: () => {
            showAlert({
              variant: "success",
              message: sendRef.current ? "Invite sent successfully" : "Invite saved as draft",
            })
            form.reset()
            setActiveAction(null)
            onClose()
          },
          onError: (error) => {
            setActiveAction(null)
            showAlert({ variant: "error", message: error.message })
          },
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
      preventClose={createInvite.isPending}
      customHeader={
        <div className="border-borderSubtle flex items-center justify-between border-b px-6 py-5">
          <h2 className="font-jakarta text-brand text-base font-semibold">Invite staff</h2>
        </div>
      }
      customFooter={
        <div className="border-borderSubtle border-t px-4 py-4 sm:px-6">
          <div className="flex gap-2">
            <Button
              variant="subtle"
              className="flex-1"
              disabled={createInvite.isPending}
              loading={activeAction === "draft" && createInvite.isPending}
              onClick={() => {
                sendRef.current = false
                setActiveAction("draft")
                form.handleSubmit()
              }}
            >
              Save as draft
            </Button>
            <Button
              variant="secondary"
              className="flex-1"
              disabled={createInvite.isPending}
              loading={activeAction === "send" && createInvite.isPending}
              onClick={() => {
                sendRef.current = true
                setActiveAction("send")
                form.handleSubmit()
              }}
            >
              Send invite
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
              onBlur: ({ value }) => validateField(inviteUserSchema, "firstName", value),
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
              onBlur: ({ value }) => validateField(inviteUserSchema, "lastName", value),
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
          validators={{ onBlur: ({ value }) => validateField(inviteUserSchema, "email", value) }}
        >
          {(field) => (
            <FormInput
              label="Email address"
              value={field.state.value}
              onChange={field.handleChange}
              onBlur={field.handleBlur}
              placeholder="Enter email address"
              type="email"
              error={field.state.meta.errors[0]?.toString()}
            />
          )}
        </form.Field>

        <form.Field
          name="role"
          validators={{ onBlur: ({ value }) => validateField(inviteUserSchema, "role", value) }}
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
            onChange: ({ value }) => validateField(inviteUserSchema, "storeAccess", value),
            onBlur: ({ value }) => validateField(inviteUserSchema, "storeAccess", value),
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

        <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3">
          <Info size={14} className="mt-0.5 shrink-0 text-amber-600" />
          <p className="font-jakarta text-sm text-amber-800">
            A secure, time-limited invitation link will be sent to the user's email. They will be
            prompted to create a password before accessing the account.
          </p>
        </div>
      </div>
    </Modal>
  )
}
