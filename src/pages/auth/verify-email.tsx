import { Link } from "@tanstack/react-router"
import { useState } from "react"
import AuthLayout from "@/components/shared/AuthLayout"
import OtpInput from "@/components/ui/otp-input"
import { Button } from "@/components/ui/button"
import { ROUTES } from "@/lib/routes"

export default function VerifyEmailPage() {
  const [otp, setOtp] = useState("")
  const email = "busayo@gmail.com"

  return (
    <AuthLayout>
      <div className="w-full max-w-[500px]">
        {/* Card */}
        <div className="shadow-auth rounded-2xl border border-gray-100 bg-white">
          {/* Header */}
          <div className="px-6 pt-6 pb-5">
            <h2 className="text-brand font-sans text-[17px] font-semibold">Verify your email</h2>
            <p className="font-jakarta text-brand/55 mt-1 text-xs leading-relaxed">
              We sent a 6-digit code to <span className="text-brand font-semibold">{email}</span>.
              Enter it below to activate your account.
            </p>
          </div>

          {/* OTP input */}
          <div className="px-6">
            <OtpInput value={otp} onChange={setOtp} length={6} />
          </div>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-3 px-6 pt-6 pb-6">
            <Button className="h-12 rounded-full text-sm font-bold" disabled={otp.length < 6}>
              Verify & continue
            </Button>
            <Button variant="outline" className="h-12 rounded-full text-sm font-bold">
              Resend code
            </Button>
          </div>
        </div>

        {/* Footer */}
        <p className="font-jakarta text-brand/60 mt-5 text-center text-xs">
          Wrong email?{" "}
          <Link
            to={ROUTES.signup}
            className="text-primary font-semibold no-underline hover:underline"
          >
            Go back
          </Link>
        </p>
      </div>
    </AuthLayout>
  )
}
