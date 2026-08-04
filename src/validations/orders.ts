import { z } from "zod"

export const processRefundSchema = z.object({
  refundType: z.enum(["full", "partial"], { message: "Please select a refund type" }),
  reason: z.string().min(1, "Please select a reason"),
  notes: z.string().optional(),
})

export type ProcessRefundFormValues = z.infer<typeof processRefundSchema>

export const walkInOrderSchema = z.object({
  storeLocation: z.string().min(1, "Store location is required"),
  customerId: z.string().default(""),
  servedBy: z.string().min(1, "Please select who is serving this order"),
  orderNotes: z.string().default(""),
  paymentMethod: z.string().min(1, "Payment method is required"),
  paymentStatus: z.string().min(1, "Payment status is required"),
  fulfillmentStatus: z.string().default(""),
  discountCode: z.string().default(""),
  isGuestCustomer: z.boolean().default(false),
  guestFirstName: z.string().default(""),
  guestLastName: z.string().default(""),
  guestEmail: z.string().default(""),
  guestPhone: z.string().default(""),
  appliedDiscountId: z.string().default(""),
  appliedDiscountCode: z.string().default(""),
  appliedDiscountName: z.string().default(""),
  appliedDiscountAmount: z.number().default(0),
})

export type WalkInOrderFormValues = z.infer<typeof walkInOrderSchema>

export const guestCustomerSchema = z.object({
  guestFirstName: z.string().default(""),
  guestLastName: z.string().default(""),
  guestEmail: z.string().min(1, "Email is required").email("Invalid email address"),
  guestPhone: z.string().default(""),
})

export type GuestCustomerFormValues = z.infer<typeof guestCustomerSchema>
