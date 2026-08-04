import { z } from "zod"

export const composeMessageSchema = z.object({
  audience: z.enum(["customers", "staff"]),
  customerSegment: z.string().optional(),
  channels: z.array(z.string()).min(1, "Select at least one channel"),
  messageTitle: z.string().min(1, "Message title is required"),
  messageBody: z.string().min(1, "Message body is required"),
  ctaText: z.string().optional(),
  ctaLink: z.string().optional(),
  schedule: z.enum(["now", "later"]),
  scheduleDate: z.string().optional(),
  scheduleTime: z.string().optional(),
})

export type ComposeMessageFormValues = z.infer<typeof composeMessageSchema>
