import type { ClassValue } from "clsx"
import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import type { ZodObject, ZodRawShape } from "zod"
import { GLOBAL_CURRENCY } from "./constants"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function validateField<S extends ZodRawShape, K extends keyof S>(
  schema: ZodObject<S>,
  key: K,
  value: unknown,
): string | undefined {
  const field = schema.shape[key] as unknown as {
    safeParse: (v: unknown) => { success: boolean; error?: { issues: { message: string }[] } }
  }
  const result = field.safeParse(value)
  return result.success ? undefined : result.error?.issues[0].message
}

const toUTCDate = (s: string): Date => {
  // If no timezone info, treat as UTC so local display is correct across environments
  if (/^\d{4}-\d{2}-\d{2}/.test(s) && !s.includes("Z") && !/[+-]\d{2}:?\d{2}$/.test(s)) {
    return new Date(s.replace(" ", "T") + "Z")
  }
  return new Date(s)
}

export const formatDateToCustomFormat = (dateString: string | Date, timeFlag?: boolean) => {
  if (!dateString) return "—"
  const date = typeof dateString === "string" ? toUTCDate(dateString) : new Date(dateString)
  if (isNaN(date.getTime()) || date.getFullYear() <= 0) return "—"

  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ]
  const base = `${date.getDate()}, ${months[date.getMonth()]} ${date.getFullYear()}`

  if (!timeFlag) return base

  const hours = date.getHours()
  const minutes = date.getMinutes().toString().padStart(2, "0")
  const period = hours >= 12 ? "pm" : "am"
  const hour12 = hours % 12 || 12
  return `${base} - ${hour12}:${minutes}${period}`
}

export const formatCurrency = (amount: number | string, currency = GLOBAL_CURRENCY) => {
  // Handle invalid inputs
  if (amount === undefined || amount === null) {
    return `${currency}0.00`
  }

  // Convert to number if it's a string
  const numericAmount = typeof amount === "string" ? parseFloat(amount) : amount

  // Check if it's a valid number
  if (isNaN(numericAmount)) {
    return `${currency}0.00`
  }

  return `${currency}${numericAmount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}
