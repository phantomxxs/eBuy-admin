import { z } from "zod"

export const createVoucherSchema = z.object({
  code: z.string().optional(),
  discountType: z.string().min(1, "Discount type is required"),
  discountValue: z.string().min(1, "Discount value is required"),
  maxUsage: z.string().min(1, "Maximum usage is required"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
})

export type CreateVoucherFormValues = z.infer<typeof createVoucherSchema>

export const editVoucherSchema = createVoucherSchema
export type EditVoucherFormValues = z.infer<typeof editVoucherSchema>
