import { useUserStore } from "@/store/user"
import type { Permission } from "@/utils/permissions"

/**
 * Thrown when a request is attempted without the required permission.
 * This is a client-side guard — no network call is made when this is thrown,
 * so it never triggers the 401 logout flow.
 */
export class PermissionDeniedError extends Error {
  readonly permission: string

  constructor(permission: string) {
    super(`Access denied: missing permission '${permission}'`)
    this.name = "PermissionDeniedError"
    this.permission = permission
  }
}

/**
 * Synchronously asserts the current user has the given permission.
 * Throws PermissionDeniedError immediately if not — call this at the
 * top of request functions to prevent unauthorised network calls.
 *
 * @example
 * export const getProducts = async (params: ProductQueryParams) => {
 *   checkPermission(PERMISSIONS.PRODUCTS_VIEW)
 *   const response = await instance.get(PRODUCTS, { params })
 *   return response.data
 * }
 */
export function checkPermission(permission: Permission | string): void {
  const { hasPermission } = useUserStore.getState()
  if (!hasPermission(permission)) {
    throw new PermissionDeniedError(permission)
  }
}

/**
 * Wraps an async request function with a permission check.
 * Throws PermissionDeniedError before any network call if the user
 * lacks the required permission.
 *
 * Use this when you want to co-locate the permission with the call site
 * rather than at the top of the request function.
 *
 * @example
 * export const archiveProduct = (id: string) =>
 *   guardedRequest(PERMISSIONS.PRODUCTS_MANAGE, () =>
 *     instance.patch(PRODUCT(id), { status: "archived" }).then((r) => r.data),
 *   )
 */
export async function guardedRequest<T>(
  permission: Permission | string,
  fn: () => Promise<T>,
): Promise<T> {
  checkPermission(permission)
  return fn()
}

/**
 * Returns true if the current user has ALL of the given permissions.
 */
export function hasAllPermissions(...permissions: Array<Permission | string>): boolean {
  const { hasPermission } = useUserStore.getState()
  return permissions.every(hasPermission)
}

/**
 * Returns true if the current user has ANY of the given permissions.
 */
export function hasAnyPermission(...permissions: Array<Permission | string>): boolean {
  const { hasPermission } = useUserStore.getState()
  return permissions.some(hasPermission)
}
