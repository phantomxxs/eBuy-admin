import type { Staff, AppUser } from "@/types/staff"

export function normalizeStaff(raw: Staff): AppUser {
  const name = `${raw.firstname} ${raw.lastname}`.trim()
  const initials = `${raw.firstname?.[0] ?? ""}${raw.lastname?.[0] ?? ""}`.toUpperCase()
  const storeAccess =
    raw.store_access === "all"
      ? "All stores"
      : raw.store_access_labels?.join(", ") || "Selected stores"
  return {
    id: String(raw.user_id),
    name,
    email: raw.email,
    initials,
    role: raw.role?.name ?? "",
    storeAccess,
    dateAdded: raw.date_added,
    status: raw.status as AppUser["status"],
    inviteId: raw.invite_id ? String(raw.invite_id) : undefined,
  }
}
