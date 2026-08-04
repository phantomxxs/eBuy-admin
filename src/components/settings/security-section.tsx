import { useEffect, useRef } from "react"
import { useForm } from "@tanstack/react-form"
import { useStore } from "@tanstack/react-store"
import { validateField } from "@/lib/utils"
import { useGetSecurityAccess } from "@/store/queries/settings"
import { useUpdateSecurityAccess, useChangePassword } from "@/store/mutations/settings"
import { showAlert } from "@/store/alerts"
import FormInput from "@/components/ui/form-input"
import { Button } from "@/components/ui/button"
import { changePasswordSchema, type ChangePasswordFormValues } from "@/validations/settings"
import { ToggleRow, SectionLoading } from "./shared"

type Props = {
  registerSave: (fn: () => void) => void
  registerDirty: (dirty: boolean) => void
}

export default function SecuritySection({ registerSave, registerDirty }: Props) {
  const { data, isLoading } = useGetSecurityAccess()
  const settings = data?.data
  const updateSecurityAccess = useUpdateSecurityAccess()
  const changePasswordMutation = useChangePassword()

  const securityForm = useForm({
    defaultValues: {
      notify_login_from_new_device: false as boolean,
    },
    onSubmit: async ({ value }) => {
      updateSecurityAccess.mutate(value, {
        onSuccess: () => showAlert({ variant: "success", message: "Security settings saved" }),
        onError: (e) => showAlert({ variant: "error", message: e.message }),
      })
    },
  })

  useEffect(() => {
    if (!settings) return
    securityForm.setFieldValue(
      "notify_login_from_new_device",
      settings.notify_login_from_new_device,
    )
  }, [settings])

  const isDirty = useStore(securityForm.store, (s) => s.isDirty)
  useEffect(() => {
    registerDirty(isDirty)
  }, [isDirty, registerDirty])

  const saveFnRef = useRef(() => securityForm.handleSubmit())
  saveFnRef.current = () => securityForm.handleSubmit()

  useEffect(() => {
    registerSave(() => saveFnRef.current())
  }, [registerSave])

  const passwordForm = useForm({
    defaultValues: {
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    } satisfies ChangePasswordFormValues,
    onSubmit: async ({ value }) => {
      changePasswordMutation.mutate(
        { old_password: value.oldPassword, new_password: value.newPassword },
        {
          onSuccess: () => {
            showAlert({ variant: "success", message: "Password updated successfully" })
            passwordForm.reset()
          },
          onError: (e) => showAlert({ variant: "error", message: e.message }),
        },
      )
    },
  })

  if (isLoading) return <SectionLoading />

  return (
    <div className="border-borderSubtle overflow-hidden rounded-xl border bg-white">
      <div className="border-borderSubtle border-b px-6 py-4">
        <h2 className="font-jakarta text-brand text-sm font-semibold">Security &amp; Access</h2>
        <p className="font-jakarta text-brand/50 mt-0.5 text-xs">
          Control access and security settings
        </p>
      </div>

      <div className="p-6">
        <p className="font-jakarta text-brand mb-3 text-xs font-semibold tracking-widest uppercase">
          Change Password
        </p>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <passwordForm.Field
            name="oldPassword"
            validators={{
              onBlur: ({ value }) => validateField(changePasswordSchema, "oldPassword", value),
            }}
          >
            {(field) => (
              <FormInput
                label="Old password"
                type="password"
                showPasswordToggle
                placeholder="Enter old password"
                value={field.state.value}
                onChange={field.handleChange}
                onBlur={field.handleBlur}
                error={field.state.meta.errors[0]?.toString()}
              />
            )}
          </passwordForm.Field>
          <passwordForm.Field
            name="newPassword"
            validators={{
              onBlur: ({ value }) => validateField(changePasswordSchema, "newPassword", value),
            }}
          >
            {(field) => (
              <FormInput
                label="New password"
                type="password"
                showPasswordToggle
                placeholder="Enter new password"
                value={field.state.value}
                onChange={field.handleChange}
                onBlur={field.handleBlur}
                error={field.state.meta.errors[0]?.toString()}
              />
            )}
          </passwordForm.Field>
        </div>
        <div className="mt-4">
          <passwordForm.Field
            name="confirmPassword"
            validators={{
              onBlur: ({ value, fieldApi }) => {
                const pw = fieldApi.form.getFieldValue("newPassword")
                if (!value) return "Please confirm your password"
                if (value !== pw) return "Passwords do not match"
              },
            }}
          >
            {(field) => (
              <FormInput
                label="Confirm new password"
                type="password"
                showPasswordToggle
                placeholder="Confirm new password"
                value={field.state.value}
                onChange={field.handleChange}
                onBlur={field.handleBlur}
                error={field.state.meta.errors[0]?.toString()}
              />
            )}
          </passwordForm.Field>
        </div>
        <div className="mt-4">
          <Button
            variant="secondary"
            loading={changePasswordMutation.isPending}
            onClick={() => passwordForm.handleSubmit()}
          >
            Update password
          </Button>
        </div>

        <div className="border-borderSubtle my-6 border-t" />

        <p className="font-jakarta text-brand mb-3 text-xs font-semibold tracking-widest uppercase">
          Login Security
        </p>
        <securityForm.Field name="notify_login_from_new_device">
          {(field) => (
            <ToggleRow
              label="Notify on Login from New Device"
              checked={field.state.value}
              onChange={() => field.handleChange(!field.state.value)}
            />
          )}
        </securityForm.Field>
      </div>
    </div>
  )
}
