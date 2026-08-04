import { z } from "zod"

export const createBlogSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description is required"),
  body: z.string().min(1, "Blog body cannot be empty"),
  tags: z.string().optional(), // comma-separated string in form
  status: z.string().min(1, "Status is required"),
})

export type CreateBlogFormValues = z.infer<typeof createBlogSchema>
