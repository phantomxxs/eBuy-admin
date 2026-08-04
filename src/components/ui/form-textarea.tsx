import { cn } from "@/lib/utils"

interface FormTextareaProps {
  label?: string
  placeholder?: string
  value?: string
  onChange?: (value: string) => void
  onBlur?: () => void
  rows?: number
  className?: string
  disabled?: boolean
  name?: string
  error?: string
  required?: boolean
}

export default function FormTextarea({
  label,
  placeholder,
  value,
  onChange,
  onBlur,
  rows = 4,
  className,
  disabled,
  name,
  error,
  required,
}: FormTextareaProps) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {label && (
        <label htmlFor={name} className="font-jakarta text-brand text-xs font-semibold">
          {label}
          {required && <span className="text-destructive ml-0.5">*</span>}
        </label>
      )}
      <textarea
        id={name}
        name={name}
        rows={rows}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        onBlur={onBlur}
        disabled={disabled}
        className={cn(
          "border-input font-jakarta placeholder:text-muted-foreground w-full resize-none rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs transition-[color,box-shadow] outline-none",
          "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
          "disabled:cursor-not-allowed disabled:opacity-50",
          error && "border-destructive focus-visible:ring-destructive/20",
        )}
      />
      {error && <p className="font-jakarta text-destructive text-xs">{error}</p>}
    </div>
  )
}
