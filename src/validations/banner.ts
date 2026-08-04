import { z } from "zod"

export const bannerSchema = z.object({
  isHeroBanner: z.boolean(),
  image: z.instanceof(File).optional(),
  bannerName: z.string().min(1, "Banner name is required"),
  bannerType: z.string().min(1, "Banner type is required"),
  cta: z.string().min(1, "CTA label is required"),
  ctaLink: z.string().min(1, "CTA link is required"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
})

export type BannerFormValues = z.infer<typeof bannerSchema>
