import { useEffect } from "react"
import { Link } from "@tanstack/react-router"
import { useForm } from "@tanstack/react-form"
import { Route } from "@/routes/set-password"
import AuthLayout from "@/components/shared/AuthLayout"
import FormInput from "@/components/ui/form-input"
import { Button } from "@/components/ui/button"
import { ROUTES } from "@/lib/routes"
import { setPasswordSchema, type SetPasswordFormValues } from "@/validations/auth"
import { validateField } from "@/lib/utils"
import { useValidatePasswordResetToken, useConfirmPasswordReset } from "@/store/mutations/auth"
import { showAlert } from "@/store/alerts"

export default function SetPasswordPage() {
  const { token } = Route.useSearch()
  const validate = useValidatePasswordResetToken()
  const confirm = useConfirmPasswordReset()

  useEffect(() => {
    if (!token) return
    validate.mutate(token, {
      onError: () =>
        showAlert({
          variant: "error",
          message: "This reset link is invalid or has expired. Please request a new one.",
        }),
    })
  }, [token])

  const form = useForm({
    defaultValues: { password: "", confirmPassword: "" } satisfies SetPasswordFormValues,
    onSubmit: ({ value }) => {
      if (!token) {
        showAlert({
          variant: "error",
          message: "Reset token is missing. Please use the link from your email.",
        })
        return
      }
      confirm.mutate(
        { token, password: value.password, confirmPassword: value.confirmPassword },
        {
          onError: (e) => showAlert({ variant: "error", message: e.message }),
        },
      )
    },
  })

  const isInvalidToken = validate.isError && !validate.isPending
  const isReady = token && !isInvalidToken

  return (
    <AuthLayout>
      <div className="w-full max-w-125">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            form.handleSubmit()
          }}
          className="shadow-auth rounded-2xl border border-gray-100 bg-white"
        >
          <div className="px-6 pt-6 pb-5">
            <h2 className="text-brand font-sans text-[17px] font-semibold">Set password</h2>
            <p className="font-jakarta text-brand/55 mt-1 text-xs">
              {isInvalidToken
                ? "This reset link is invalid or has already been used."
                : "Choose a strong password you haven't used before."}
            </p>
          </div>

          {isReady && (
            <div className="flex flex-col gap-4 px-6">
              <form.Field
                name="password"
                validators={{
                  onBlur: ({ value }) => validateField(setPasswordSchema, "password", value),
                }}
              >
                {(field) => (
                  <FormInput
                    label="New password"
                    placeholder="Enter password"
                    type="password"
                    showPasswordToggle
                    name="password"
                    value={field.state.value}
                    onChange={field.handleChange}
                    onBlur={field.handleBlur}
                    error={field.state.meta.errors[0]?.toString()}
                  />
                )}
              </form.Field>
              <form.Field
                name="confirmPassword"
                validators={{
                  onBlur: ({ value, fieldApi }) => {
                    const pw = fieldApi.form.getFieldValue("password")
                    if (!value) return "Please confirm your password"
                    if (value !== pw) return "Passwords do not match"
                  },
                }}
              >
                {(field) => (
                  <FormInput
                    label="Confirm password"
                    placeholder="Enter password"
                    type="password"
                    showPasswordToggle
                    name="confirmPassword"
                    value={field.state.value}
                    onChange={field.handleChange}
                    onBlur={field.handleBlur}
                    error={field.state.meta.errors[0]?.toString()}
                  />
                )}
              </form.Field>
            </div>
          )}

          <div className="px-6 pt-6 pb-6">
            {isInvalidToken ? (
              <Link to={ROUTES.resetPassword} search={{ token: "" }}>
                <Button type="button" className="h-12 w-full rounded-full text-sm font-bold">
                  Request a new link
                </Button>
              </Link>
            ) : (
              <Button
                type="submit"
                className="h-12 w-full rounded-full text-sm font-bold"
                loading={confirm.isPending || validate.isPending}
                disabled={!isReady}
              >
                Update password
              </Button>
            )}
          </div>
        </form>

        <p className="font-jakarta text-brand/60 mt-5 text-center text-xs">
          Already have an account?{" "}
          <Link
            to={ROUTES.login}
            className="text-primary font-semibold no-underline hover:underline"
          >
            Login
          </Link>
        </p>
      </div>
    </AuthLayout>
  )
}
