import { z } from "zod"

export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/svg+xml",
  "image/webp",
] as const
export const MAX_FILE_SIZE_MB = 5
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024

export function validateFileSize(file: File): string | undefined {
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return `"${file.name}" exceeds the ${MAX_FILE_SIZE_MB}MB size limit.`
  }
}

export function validateImageFiles(files: File[]): string | undefined {
  for (const file of files) {
    if (!ALLOWED_IMAGE_TYPES.includes(file.type as (typeof ALLOWED_IMAGE_TYPES)[number])) {
      return `"${file.name}" is not a supported format. Use JPEG, PNG, or GIF.`
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return `"${file.name}" exceeds the ${MAX_FILE_SIZE_MB}MB size limit.`
    }
  }
}

export const productSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  status: z.string().optional(),
  brandName: z.string().min(1, "Brand name is required"),
  category: z.array(z.string()).min(1, "Category is required"),
  price: z.string().min(1, "Price is required"),
  sku: z.string().optional(),
  skinType: z.array(z.string()).min(1, "Skin type is required"),
  stock: z.string().min(1, "Stock quantity is required"),
  lowStockAlert: z.string().min(1, "Low stock alert is required"),
  discount: z.string().min(1, "Discount is required"),
  location: z.array(z.string()).min(1, "Location is required"),
  description: z.string().min(1, "Description is required"),
  ingredients: z.string().min(1, "Ingredients is required"),
  howToUse: z.string().optional(),
  weight: z.string().optional(),
})

export type ProductFormValues = z.infer<typeof productSchema>

export const masterCatalogImportSchema = z.object({
  price: z.string().min(1, "Price is required"),
  stockQty: z.string().min(1, "Stock quantity is required"),
  location: z.array(z.string()).min(1, "Location is required"),
  category: z.array(z.string()).min(1, "Category is required"),
  skinType: z.array(z.string()).min(1, "Skin type is required"),
  sku: z.string().optional(),
  lowStockAlert: z.string().optional(),
  discount: z.string().optional(),
  status: z.string().min(1, "Status is required"),
})

export type MasterCatalogImportFormValues = z.infer<typeof masterCatalogImportSchema>
