import { z } from "zod"

export const inviteUserSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  role: z.string().min(1, "Role is required"),
  storeAccess: z.array(z.string()).min(1, "Store access is required"),
})

export const createStaffSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.string().min(1, "Role is required"),
  storeAccess: z.array(z.string()).min(1, "Store access is required"),
})

export const editStaffSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().min(1, "Email is required").email("Invalid email address"),
})

export const changeRoleSchema = z.object({
  role: z.string().min(1, "Role is required"),
  storeAccess: z.array(z.string()).min(1, "Store access is required"),
  reason: z.string().optional(),
})

// legacy — kept for any remaining consumers
export const editUserSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  role: z.string().min(1, "Role is required"),
  status: z.string().min(1, "Status is required"),
  storeAccess: z.string().optional(),
})

export type InviteUserFormValues = z.infer<typeof inviteUserSchema>
export type CreateStaffFormValues = z.infer<typeof createStaffSchema>
export type EditStaffFormValues = z.infer<typeof editStaffSchema>
export type ChangeRoleFormValues = z.infer<typeof changeRoleSchema>
export type EditUserFormValues = z.infer<typeof editUserSchema>
