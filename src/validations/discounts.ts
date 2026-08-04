import { z } from "zod"

const today = () => {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
}

export const createDiscountSchema = z.object({
  name: z.string().min(1, "Promotion name is required"),
  discountType: z.string().min(1, "Discount type is required"),
  discountValue: z.string().min(1, "Discount value is required"),
  categoryIds: z.array(z.string()).optional(),
  startDate: z
    .string()
    .min(1, "Start date is required")
    .refine((v) => new Date(v) >= today(), "Start date must be today or later"),
  endDate: z.string().min(1, "End date is required"),
  customerEligibility: z.string().optional(),
  usageLimit: z.string().optional(),
})

export type CreateDiscountFormValues = z.infer<typeof createDiscountSchema>

export const editDiscountSchema = z.object({
  name: z.string().min(1, "Promotion name is required"),
  discountType: z.string().min(1, "Discount type is required"),
  discount: z.string().min(1, "Discount value is required"),
  categoryIds: z.array(z.string()).optional(),
  status: z.string().min(1, "Status is required"),
  usageLimit: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
})

export type EditDiscountFormValues = z.infer<typeof editDiscountSchema>
