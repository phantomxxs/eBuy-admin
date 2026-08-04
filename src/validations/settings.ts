import { z } from "zod"

export const storeInfoSchema = z.object({
  brandName: z.string().min(1, "Brand name is required"),
  businessEmail: z.string().min(1, "Business email is required").email("Invalid email address"),
  supportEmail: z.string().email("Invalid email address").or(z.literal("")).optional(),
  storePhone: z.string().optional(),
  websiteUrl: z.string().optional(),
  currency: z.string().min(1, "Currency is required"),
  rcNumber: z.string().optional(),
  tin: z.string().optional(),
  stateId: z.string().optional(),
  lgaId: z.string().optional(),
  registeredHeadOffice: z.string().optional(),
  storeDescription: z.string().optional(),
})

export const changePasswordSchema = z.object({
  oldPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
})

export type StoreInfoFormValues = z.infer<typeof storeInfoSchema>
export type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>
