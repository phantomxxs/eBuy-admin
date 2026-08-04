import { useState, useEffect } from "react"
import { Link, useNavigate } from "@tanstack/react-router"
import { useForm } from "@tanstack/react-form"
import { Route } from "@/routes/reset-password"
import AuthLayout from "@/components/shared/AuthLayout"
import FormInput from "@/components/ui/form-input"
import { Button } from "@/components/ui/button"
import { ROUTES } from "@/lib/routes"
import {
  resetPasswordSchema,
  setPasswordSchema,
  type ResetPasswordFormValues,
  type SetPasswordFormValues,
} from "@/validations/auth"
import { validateField } from "@/lib/utils"
import {
  useRequestPasswordReset,
  useValidatePasswordResetToken,
  useConfirmPasswordReset,
} from "@/store/mutations/auth"
import { showAlert } from "@/store/alerts"

export default function ResetPasswordPage() {
  const { token } = Route.useSearch()
  const [sent, setSent] = useState(false)

  return (
    <AuthLayout>
      <div className="w-full max-w-125">
        {token ? (
          <SetNewPasswordForm token={token} />
        ) : (
          <RequestResetForm
            sent={sent}
            onSent={() => setSent(true)}
            onReset={() => setSent(false)}
          />
        )}
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

// ── Request reset link form ────────────────────────────────────────────────────

interface RequestResetFormProps {
  sent: boolean
  onSent: () => void
  onReset: () => void
}

function RequestResetForm({ sent, onSent, onReset }: RequestResetFormProps) {
  const requestReset = useRequestPasswordReset()

  const form = useForm({
    defaultValues: { email: "" } satisfies ResetPasswordFormValues,
    onSubmit: ({ value }) => {
      requestReset.mutate(value.email, {
        onSuccess: () => onSent(),
        onError: (e) => showAlert({ variant: "error", message: e.message }),
      })
    },
  })

  return (
    <div className="shadow-auth rounded-2xl border border-gray-100 bg-white">
      <div className="px-6 pt-6 pb-5">
        <h2 className="text-brand font-sans text-[17px] font-semibold">Reset password</h2>
        <p className="font-jakarta text-brand/55 mt-1 text-xs">
          {sent
            ? "Check your inbox — we've sent a reset link to your email address."
            : "Enter your registered email address and we'll send you a reset link."}
        </p>
      </div>

      {!sent && (
        <div className="px-6">
          <form.Field
            name="email"
            validators={{
              onBlur: ({ value }) => validateField(resetPasswordSchema, "email", value),
            }}
          >
            {(field) => (
              <FormInput
                label="Email address"
                placeholder="busayo@gmail.com"
                type="email"
                name="email"
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
        {sent ? (
          <Button type="button" className="w-full!" onClick={onReset}>
            Try a different email
          </Button>
        ) : (
          <Button
            type="button"
            className="w-full!"
            loading={requestReset.isPending}
            onClick={() => form.handleSubmit()}
          >
            Send reset link
          </Button>
        )}
      </div>
    </div>
  )
}

// ── Set new password form ──────────────────────────────────────────────────────

function SetNewPasswordForm({ token }: { token: string }) {
  const validate = useValidatePasswordResetToken()
  const confirm = useConfirmPasswordReset()
  const navigate = useNavigate()

  useEffect(() => {
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
      confirm.mutate(
        { token, password: value.password, confirmPassword: value.confirmPassword },
        {
          onSuccess: () => navigate({ to: ROUTES.login }),
          onError: (e) => showAlert({ variant: "error", message: e.message }),
        },
      )
    },
  })

  const isInvalidToken = validate.isError && !validate.isPending
  const isReady = !isInvalidToken

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        form.handleSubmit()
      }}
      className="shadow-auth rounded-2xl border border-gray-100 bg-white"
    >
      <div className="px-6 pt-6 pb-5">
        <h2 className="text-brand font-sans text-[17px] font-semibold">Set new password</h2>
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
            <Button type="button" className="w-full!">
              Request a new link
            </Button>
          </Link>
        ) : (
          <Button
            type="submit"
            className="w-full!"
            loading={confirm.isPending || validate.isPending}
            disabled={!isReady}
          >
            Update password
          </Button>
        )}
      </div>
    </form>
  )
}
