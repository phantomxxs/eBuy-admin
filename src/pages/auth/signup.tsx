import { Link } from "@tanstack/react-router"
import { useForm } from "@tanstack/react-form"
import AuthLayout from "@/components/shared/AuthLayout"
import Dropdown from "@/components/ui/dropdown"
import { Button } from "@/components/ui/button"
import { ROUTES } from "@/lib/routes"
import FormInput from "@/components/ui/form-input"
import { signupSchema, type SignupFormValues } from "@/validations/auth"
import { validateField } from "@/lib/utils"

const ROLE_OPTIONS = [
  { label: "Store manager", value: "store-manager" },
  { label: "Admin", value: "admin" },
  { label: "Viewer", value: "viewer" },
]

const STORE_OPTIONS = [
  { label: "eBuy Lagos, eBuy Abuja...", value: "all" },
  { label: "eBuy Lagos", value: "lagos" },
  { label: "eBuy Abuja", value: "abuja" },
]

export default function SignupPage() {
  const form = useForm({
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      role: "",
      storeAccess: "",
      password: "",
      confirmPassword: "",
      agreed: false as boolean,
    } satisfies SignupFormValues,
    onSubmit: ({ value: _value }) => {
      // TODO: wire up signup mutation
    },
  })

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
            <h2 className="text-brand font-sans text-[17px] font-semibold">Welcome to eBuy 🌟</h2>
            <p className="font-jakarta text-brand/55 mt-1 text-xs">
              Complete the details below to set up your eBuy admin profile.
            </p>
          </div>

          {/* Fields */}
          <div className="flex flex-col gap-4 px-6">
            {/* First + Last name */}
            <div className="grid grid-cols-2 gap-4">
              <form.Field
                name="firstName"
                validators={{
                  onBlur: ({ value }) => validateField(signupSchema, "firstName", value),
                }}
              >
                {(field) => (
                  <FormInput
                    label="First name"
                    placeholder="Busayo"
                    name="firstName"
                    value={field.state.value}
                    onChange={field.handleChange}
                    onBlur={field.handleBlur}
                    error={field.state.meta.errors[0]?.toString()}
                  />
                )}
              </form.Field>
              <form.Field
                name="lastName"
                validators={{
                  onBlur: ({ value }) => validateField(signupSchema, "lastName", value),
                }}
              >
                {(field) => (
                  <FormInput
                    label="Last name"
                    placeholder="Gallagher"
                    name="lastName"
                    value={field.state.value}
                    onChange={field.handleChange}
                    onBlur={field.handleBlur}
                    error={field.state.meta.errors[0]?.toString()}
                  />
                )}
              </form.Field>
            </div>

            <form.Field
              name="email"
              validators={{ onBlur: ({ value }) => validateField(signupSchema, "email", value) }}
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

            {/* Role + Store access */}
            <div className="grid grid-cols-2 gap-4">
              <form.Field
                name="role"
                validators={{ onBlur: ({ value }) => validateField(signupSchema, "role", value) }}
              >
                {(field) => (
                  <Dropdown
                    label="Role"
                    options={ROLE_OPTIONS}
                    value={field.state.value}
                    onChange={field.handleChange}
                    onBlur={field.handleBlur}
                    placeholder="Store manager"
                    error={field.state.meta.errors[0]?.toString()}
                  />
                )}
              </form.Field>
              <form.Field
                name="storeAccess"
                validators={{
                  onBlur: ({ value }) => validateField(signupSchema, "storeAccess", value),
                }}
              >
                {(field) => (
                  <Dropdown
                    label="Store access"
                    options={STORE_OPTIONS}
                    value={field.state.value}
                    onChange={field.handleChange}
                    onBlur={field.handleBlur}
                    placeholder="eBuy Lagos, eBuy Abuja..."
                    error={field.state.meta.errors[0]?.toString()}
                  />
                )}
              </form.Field>
            </div>

            <form.Field
              name="password"
              validators={{ onBlur: ({ value }) => validateField(signupSchema, "password", value) }}
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

            {/* Terms */}
            <form.Field name="agreed">
              {(field) => (
                <label className="flex cursor-pointer items-start gap-2">
                  <input
                    type="checkbox"
                    checked={field.state.value}
                    onChange={(e) => field.handleChange(e.target.checked)}
                    className="accent-primary mt-0.5 h-4 w-4 shrink-0 rounded border-gray-300"
                  />
                  <span className="font-jakarta text-brand/70 text-xs leading-relaxed">
                    I agree to the{" "}
                    <a href="#" className="text-primary font-semibold no-underline hover:underline">
                      Terms and Conditions
                    </a>{" "}
                    and{" "}
                    <a href="#" className="text-primary font-semibold no-underline hover:underline">
                      Privacy Policy
                    </a>
                  </span>
                </label>
              )}
            </form.Field>
          </div>

          {/* Action */}
          <div className="px-6 pt-6 pb-6">
            <form.Subscribe selector={(s) => s.values.agreed}>
              {(agreed) => (
                <Button
                  type="submit"
                  disabled={!agreed}
                  className="h-12 w-full rounded-full text-sm font-bold"
                >
                  Create account
                </Button>
              )}
            </form.Subscribe>
          </div>
        </form>

        {/* Footer */}
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
