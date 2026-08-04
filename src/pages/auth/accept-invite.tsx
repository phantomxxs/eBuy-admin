import { Link, useNavigate, useSearch } from "@tanstack/react-router"
import { useEffect } from "react"
import { useForm } from "@tanstack/react-form"
import AuthLayout from "@/components/shared/AuthLayout"
import FormInput from "@/components/ui/form-input"
import { Button } from "@/components/ui/button"
import { ROUTES } from "@/lib/routes"
import { useValidateInviteToken, useAcceptInvite } from "@/store/mutations/staff"
import { CheckCircle, XCircle, Loader2 } from "lucide-react"
import { setPasswordSchema, type SetPasswordFormValues } from "@/validations/auth"
import { validateField } from "@/lib/utils"
import { useUserStore } from "@/store/user"

export default function AcceptInvitePage() {
  const { token } = useSearch({ from: "/accept-invite" })
  const navigate = useNavigate()
  const clearUser = useUserStore((s) => s.clearUser)

  const validateToken = useValidateInviteToken()
  const acceptInvite = useAcceptInvite()

  const form = useForm({
    defaultValues: { password: "", confirmPassword: "" } satisfies SetPasswordFormValues,
    onSubmit: ({ value }) => {
      acceptInvite.mutate(
        { token, password: value.password },
        { onSuccess: () => navigate({ to: ROUTES.login }) },
      )
    },
  })

  useEffect(() => {
    clearUser()
  }, [])

  useEffect(() => {
    if (token) validateToken.mutate(token)
  }, [token])

  const isTokenValid = validateToken.data?.valid === true
  const isValidating = validateToken.isPending
  const isTokenInvalid = validateToken.isSuccess && !isTokenValid
  const isMissingToken = !token

  return (
    <AuthLayout>
      <div className="w-full max-w-125">
        <div className="shadow-auth rounded-2xl border border-gray-100 bg-white">
          {/* Validating */}
          {isValidating && (
            <div className="flex flex-col items-center gap-3 px-6 py-12">
              <Loader2 className="text-primary animate-spin" size={32} />
              <p className="font-jakarta text-brand/60 text-sm">Verifying your invite link…</p>
            </div>
          )}

          {/* Missing or invalid token */}
          {(isMissingToken || isTokenInvalid) && !isValidating && (
            <div className="flex flex-col items-center gap-3 px-6 py-12 text-center">
              <XCircle className="text-danger" size={36} />
              <h2 className="text-brand font-sans text-[17px] font-semibold">
                {isMissingToken ? "No invite token found" : "Invalid/Expired token"}
              </h2>
              <p className="font-jakarta text-brand/55 text-xs leading-relaxed">
                {isMissingToken
                  ? "This page requires a valid invite link from your email."
                  : "This invite link has already been used or has expired. Ask your admin to resend the invite."}
              </p>
              <Link
                to={ROUTES.login}
                className="font-jakarta text-primary mt-2 text-xs font-semibold hover:underline"
              >
                Back to login
              </Link>
            </div>
          )}

          {/* Success */}
          {acceptInvite.isSuccess && (
            <div className="flex flex-col items-center gap-3 px-6 py-12 text-center">
              <CheckCircle className="text-statusSuccess" size={36} />
              <h2 className="text-brand font-sans text-[17px] font-semibold">Account activated!</h2>
              <p className="font-jakarta text-brand/55 text-xs">
                Your account is ready. You can now log in.
              </p>
              <Link
                to={ROUTES.login}
                className="font-jakarta text-primary mt-2 text-xs font-semibold hover:underline"
              >
                Go to login
              </Link>
            </div>
          )}

          {/* Set password form */}
          {isTokenValid && !acceptInvite.isSuccess && (
            <>
              <div className="px-6 pt-6 pb-5">
                <h2 className="text-brand font-sans text-[17px] font-semibold">
                  Accept your invite
                </h2>
                <p className="font-jakarta text-brand/55 mt-1 text-xs leading-relaxed">
                  Set a password to activate your account and get started.
                </p>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  form.handleSubmit()
                }}
              >
                <div className="flex flex-col gap-4 px-6">
                  <form.Field
                    name="password"
                    validators={{
                      onBlur: ({ value }) => validateField(setPasswordSchema, "password", value),
                    }}
                  >
                    {(field) => (
                      <FormInput
                        label="Create password"
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
                        placeholder="Re-enter password"
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
                  {acceptInvite.isError && (
                    <p className="font-jakarta text-danger text-xs">
                      {(acceptInvite.error as Error)?.message ?? "Something went wrong. Try again."}
                    </p>
                  )}
                </div>

                <div className="w-full px-6 pt-6 pb-6">
                  <Button type="submit" loading={acceptInvite.isPending} className="w-full!">
                    Activate account
                  </Button>
                </div>
              </form>
            </>
          )}
        </div>

        {!acceptInvite.isSuccess && (
          <p className="font-jakarta text-brand/60 mt-5 text-center text-xs">
            Already have an account?{" "}
            <Link
              to={ROUTES.login}
              className="text-primary font-semibold no-underline hover:underline"
            >
              Login
            </Link>
          </p>
        )}
      </div>
    </AuthLayout>
  )
}
