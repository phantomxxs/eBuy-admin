import { Link, useNavigate } from "@tanstack/react-router"
import { useEffect } from "react"
import { useForm } from "@tanstack/react-form"
import AuthLayout from "@/components/shared/AuthLayout"
import FormInput from "@/components/ui/form-input"
import { Button } from "@/components/ui/button"
import { ROUTES } from "@/lib/routes"
import { useLogin } from "@/store/mutations/auth"
import { useUserStore } from "@/store/user"
import { loginSchema, type LoginFormValues } from "@/validations/auth"
import { validateField } from "@/lib/utils"

export default function LoginPage() {
  const { mutate: login, isPending, error } = useLogin()
  const isAuthenticated = useUserStore((s) => s.isAuthenticated)
  const navigate = useNavigate()

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
      remember: false as boolean,
    } satisfies LoginFormValues,
    onSubmit: ({ value }) => {
      login({ email: value.email, password: value.password })
    },
  })

  useEffect(() => {
    if (isAuthenticated) navigate({ to: ROUTES.dashboard })
  }, [isAuthenticated])

  return (
    <AuthLayout>
      <div className="w-full max-w-125">
        {/* Card */}
        <form
          onSubmit={(e) => {
            e.preventDefault()
            form.handleSubmit()
          }}
          className="shadow-auth rounded-2xl border border-gray-100 bg-white"
        >
          {/* Header */}
          <div className="px-6 pt-6 pb-5">
            <h2 className="text-brand font-sans text-[17px] font-semibold">Welcome back</h2>
            <p className="font-jakarta text-brand/55 mt-1 text-xs">
              Enter your credentials to log in to your admin dashboard.
            </p>
          </div>

          {/* Fields */}
          <div className="flex flex-col gap-4 px-6">
            <form.Field
              name="email"
              validators={{ onBlur: ({ value }) => validateField(loginSchema, "email", value) }}
            >
              {(field) => (
                <FormInput
                  label="Email address"
                  placeholder="Enter email address"
                  type="email"
                  name="email"
                  value={field.state.value}
                  onChange={field.handleChange}
                  onBlur={field.handleBlur}
                  error={field.state.meta.errors[0]?.toString()}
                />
              )}
            </form.Field>

            <form.Field
              name="password"
              validators={{ onBlur: ({ value }) => validateField(loginSchema, "password", value) }}
            >
              {(field) => (
                <FormInput
                  label="Password"
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

            {/* Remember + Forgot */}
            <form.Field name="remember">
              {(field) => (
                <div className="flex items-center justify-between">
                  <label className="flex cursor-pointer items-center gap-2">
                    <input
                      type="checkbox"
                      checked={field.state.value}
                      onChange={(e) => field.handleChange(e.target.checked)}
                      className="accent-primary h-4 w-4 rounded border-gray-300"
                    />
                    <span className="font-jakarta text-brand/70 text-xs">Remember for 30 days</span>
                  </label>
                  <Link
                    to={ROUTES.resetPassword}
                    search={{ token: "" }}
                    className="font-jakarta text-primary text-xs font-semibold no-underline hover:underline"
                  >
                    Forgot password
                  </Link>
                </div>
              )}
            </form.Field>
          </div>

          {/* Error */}
          {error && (
            <p className="font-jakarta text-destructive mt-2 px-6 text-center text-xs">
              {error.message}
            </p>
          )}

          {/* Action */}
          <div className="px-6 pt-4 pb-6">
            <form.Subscribe selector={(s) => [s.values.email, s.values.password]}>
              {([email, password]) => (
                <Button
                  type="submit"
                  loading={isPending}
                  disabled={!email || !password}
                  className="w-full!"
                >
                  Login
                </Button>
              )}
            </form.Subscribe>
          </div>
        </form>

        {/* Footer */}
        <p className="font-jakarta text-brand/60 mt-5 text-center text-xs">
          Don't have an account?{" "}
          <Link
            to={ROUTES.signup}
            className="text-primary font-semibold no-underline hover:underline"
          >
            Create one
          </Link>
        </p>
      </div>
    </AuthLayout>
  )
}
