import { z } from "zod"

export const adjustStockSchema = z.object({
  product: z.string().min(1, "Product is required"),
  location: z.string().min(1, "Location is required"),
  adjustmentType: z.string().min(1, "Adjustment type is required"),
  units: z.string().min(1, "Units is required"),
  price: z.string().optional(),
  reason: z.string().min(1, "Reason is required"),
  notes: z.string().optional(),
})

export const restockSchema = z.object({
  product: z.string().min(1, "Product is required"),
  location: z.string().min(1, "Location is required"),
  adjustmentType: z.string().min(1, "Adjustment type is required"),
  units: z.string().min(1, "Units is required"),
  reason: z.string().min(1, "Reason is required"),
  notes: z.string().optional(),
})

export const transferStockSchema = z.object({
  product: z.string().min(1, "Product is required"),
  fromLocation: z.string().min(1, "From location is required"),
  toLocation: z.string().min(1, "To location is required"),
  units: z.string().min(1, "Units is required"),
  reason: z.string().min(1, "Reason is required"),
  notes: z.string().optional(),
})

export const bulkAdjustSchema = z.object({
  adjustmentType: z.string().min(1, "Adjustment type is required"),
  reason: z.string().min(1, "Reason is required"),
  notes: z.string().optional(),
})

export type AdjustStockFormValues = z.infer<typeof adjustStockSchema>
export type RestockFormValues = z.infer<typeof restockSchema>
export type TransferStockFormValues = z.infer<typeof transferStockSchema>
export type BulkAdjustFormValues = z.infer<typeof bulkAdjustSchema>
