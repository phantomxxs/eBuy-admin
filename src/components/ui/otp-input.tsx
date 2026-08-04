import type { SlotProps } from "input-otp"
import { OTPInput } from "input-otp"
import { cn } from "@/lib/utils"

interface OtpInputProps {
  value: string
  onChange: (value: string) => void
  length?: number
  disabled?: boolean
}

const OtpInput = ({ value, onChange, length = 6, disabled }: OtpInputProps) => (
  <OTPInput
    maxLength={length}
    value={value}
    onChange={onChange}
    disabled={disabled}
    containerClassName="flex items-center gap-2 sm:gap-3 justify-center"
    render={({ slots }) => (
      <>
        {slots.map((slot, i) => (
          <OtpSlot key={i} slot={slot} />
        ))}
      </>
    )}
  />
)

// ── Sub-components ────────────────────────────────────────────

interface OtpSlotProps {
  slot: SlotProps
}

const OtpSlot = ({ slot }: OtpSlotProps) => (
  <div
    className={cn(
      "font-jakarta text-brand bg-surface relative flex h-11 w-11 items-center justify-center rounded-xl border text-base font-semibold transition-all sm:h-15 sm:w-15.5 sm:text-xl",
      slot.isActive && "border-primary ring-primary/20 bg-white ring-2",
      !slot.isActive && slot.char && "border-primary/40 bg-white",
      !slot.isActive && !slot.char && "border-transparent",
    )}
  >
    {slot.char}
    {slot.hasFakeCaret && <FakeCaret />}
  </div>
)

const FakeCaret = () => (
  <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
    <div className="bg-brand animate-caret-blink h-5 w-px" />
  </div>
)

export default OtpInput
