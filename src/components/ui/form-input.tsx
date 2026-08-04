import { useState } from "react"
import { Eye, EyeOff } from "lucide-react"
import { cn } from "@/lib/utils"
import { Input } from "./input"

interface FormInputProps {
  label?: string
  placeholder?: string
  value?: string
  onChange?: (value: string) => void
  onBlur?: () => void
  type?: string
  className?: string
  disabled?: boolean
  name?: string
  id?: string
  error?: string
  showPasswordToggle?: boolean
  required?: boolean
}

export default function FormInput({
  label,
  placeholder,
  value,
  onChange,
  onBlur,
  type = "text",
  className,
  disabled,
  name,
  id,
  error,
  showPasswordToggle,
  required,
}: FormInputProps) {
  const [showPwd, setShowPwd] = useState(false)
  const resolvedType =
    showPasswordToggle && type === "password" ? (showPwd ? "text" : "password") : type

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {label && (
        <label htmlFor={id ?? name} className="font-jakarta text-brand text-xs font-semibold">
          {label}
          {required && <span className="text-destructive ml-0.5">*</span>}
        </label>
      )}
      <div className="relative">
        <Input
          id={id ?? name}
          name={name}
          type={resolvedType}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          onBlur={onBlur}
          disabled={disabled}
          className={cn(
            "font-jakarta placeholder:text-brand/30 border-border rounded-lg text-sm",
            showPasswordToggle && "pr-10",
            error && "border-destructive focus-visible:ring-destructive/20",
          )}
        />
        {showPasswordToggle && type === "password" && (
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setShowPwd((v) => !v)}
            className="text-brand/40 hover:text-brand/70 absolute top-1/2 right-3 -translate-y-1/2 transition-colors"
          >
            {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>
      {error && <p className="font-jakarta text-destructive text-xs">{error}</p>}
    </div>
  )
}
