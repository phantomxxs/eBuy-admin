import { z } from "zod"

export const createLocationSchema = z.object({
  storeName: z.string().min(1, "Store name is required"),
  country: z.string().min(1, "Country is required"),
  state: z.string().min(1, "State is required"),
  lga: z.string().optional(),
  streetAddress: z.string().min(1, "Street address is required"),
  contactEmail: z.string().min(1, "Contact email is required").email("Invalid email address"),
  contactPhone: z.string().optional(),
  status: z.string().min(1, "Status is required"),
  pickupEnabled: z.boolean(),
  walkInEnabled: z.boolean(),
  consultationEnabled: z.boolean(),
  alwaysFufill: z.boolean(),
})

export const editLocationSchema = z.object({
  name: z.string().min(1, "Store name is required"),
  country: z.string().min(1, "Country is required"),
  state: z.string().min(1, "State is required"),
  lga: z.string().optional(),
  address: z.string().min(1, "Address is required"),
  contact: z.string().min(1, "Contact email is required").email("Invalid email address"),
  phone: z.string().optional(),
  status: z.string().min(1, "Status is required"),
  pickupEnabled: z.boolean(),
  walkInEnabled: z.boolean(),
  consultationEnabled: z.boolean(),
  alwaysFufill: z.boolean(),
})

export type CreateLocationFormValues = z.infer<typeof createLocationSchema>
export type EditLocationFormValues = z.infer<typeof editLocationSchema>
