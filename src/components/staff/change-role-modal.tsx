import { useEffect } from "react"
import { useForm } from "@tanstack/react-form"
import { Info } from "lucide-react"
import Modal from "@/components/ui/modal"
import { Button } from "@/components/ui/button"
import Dropdown from "@/components/ui/dropdown"
import FormTextarea from "@/components/ui/form-textarea"
import { changeRoleSchema, type ChangeRoleFormValues } from "@/validations/staff"
import { validateField } from "@/lib/utils"
import { useGetRoleOptions } from "@/store/queries/staff"
import { useChangeStaffRole } from "@/store/mutations/staff"
import LocationSearchInput from "@/components/ui/location-search-input"
import type { AppUser } from "@/types/staff"
import { showAlert } from "@/store/alerts"

interface Props {
  isOpen: boolean
  onClose: () => void
  user: AppUser | null
}

export default function ChangeRoleModal({ isOpen, onClose, user }: Props) {
  const { data: roleOptions } = useGetRoleOptions()
  const changeRole = useChangeStaffRole()

  const form = useForm({
    defaultValues: {
      role: "",
      storeAccess: [] as string[],
      reason: "",
    } satisfies ChangeRoleFormValues,
    onSubmit: ({ value }) => {
      if (!user) return
      const allLocations = value.storeAccess.includes("0")
      changeRole.mutate(
        {
          id: user.id,
          roleId: Number(value.role),
          storeAccess: allLocations ? [] : value.storeAccess.map(Number),
          reason: value.reason,
          ...(allLocations && { allLocations: true }),
        },
        {
          onSuccess: () => {
            showAlert({ variant: "success", message: "Role updated successfully" })
            form.reset()
            onClose()
          },
          onError: (error) => showAlert({ variant: "error", message: error.message }),
        },
      )
    },
  })

  useEffect(() => {
    if (isOpen) {
      form.setFieldValue("role", "")
      form.setFieldValue("storeAccess", [])
      form.setFieldValue("reason", "")
    }
  }, [isOpen])

  if (!user) return null

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      variant="dialog"
      hideFooter
      preventClose={changeRole.isPending}
      customHeader={
        <div className="border-borderSubtle flex items-center justify-between border-b px-6 py-5">
          <div>
            <h2 className="font-jakarta text-brand text-base font-semibold">Change role</h2>
            <p className="font-jakarta text-brand/50 mt-0.5 text-sm">{user.name}</p>
          </div>
        </div>
      }
      customFooter={
        <div className="border-borderSubtle border-t px-4 py-4 sm:px-6">
          <div className="flex gap-2">
            <Button
              variant="subtle"
              className="flex-1"
              onClick={onClose}
              disabled={changeRole.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="secondary"
              className="flex-1"
              disabled={changeRole.isPending}
              loading={changeRole.isPending}
              onClick={() => form.handleSubmit()}
            >
              Save changes
            </Button>
          </div>
        </div>
      }
    >
      <div className="flex flex-col gap-4 px-6 py-5">
        <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3">
          <Info size={14} className="mt-0.5 shrink-0 text-amber-600" />
          <p className="font-jakarta text-sm text-amber-800">
            Changing this staff member's role immediately updates their access permissions.
          </p>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="font-jakarta text-brand text-sm font-semibold">Current role</label>
          <input
            value={user.role}
            disabled
            className="font-jakarta text-brand/50 border-borderSubtle h-10 w-full cursor-not-allowed rounded-lg border bg-gray-50 px-4 text-sm outline-none"
          />
        </div>

        <form.Field
          name="role"
          validators={{ onBlur: ({ value }) => validateField(changeRoleSchema, "role", value) }}
        >
          {(field) => (
            <Dropdown
              label="New role"
              options={roleOptions ?? []}
              value={field.state.value}
              onChange={field.handleChange}
              onBlur={field.handleBlur}
              placeholder="Select a new role"
              error={field.state.meta.errors[0]?.toString()}
            />
          )}
        </form.Field>

        <form.Field
          name="storeAccess"
          validators={{
            onBlur: ({ value }) => validateField(changeRoleSchema, "storeAccess", value),
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

        <form.Field name="reason">
          {(field) => (
            <FormTextarea
              label="Reason (optional)"
              value={field.state.value ?? ""}
              onChange={field.handleChange}
              onBlur={field.handleBlur}
              placeholder="e.g. yearly promotion"
              rows={3}
            />
          )}
        </form.Field>
      </div>
    </Modal>
  )
}
