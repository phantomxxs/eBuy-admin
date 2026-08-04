import { useState, Fragment } from "react"
import { Pencil, Trash2, ShieldCheck, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import Modal from "@/components/ui/modal"
import SearchIcon from "@/components/shared/search-icon"
import DeleteConfirmModal from "@/components/ui/delete-confirm-modal"
import EditRoleModal from "@/components/staff/edit-role-modal"
import { useGetRoles, useGetPermissions } from "@/store/queries/staff"
import { useDeleteRole, useBulkUpdateRolePermissions } from "@/store/mutations/staff"
import type { Role } from "@/types/staff"

export default function RolePermissionsTab() {
  const { data: rolesData, isLoading: isLoadingRoles } = useGetRoles()
  const roles = rolesData ?? []
  const { data: permissionGroups = [], isLoading: isLoadingPermissions } = useGetPermissions()
  const isLoading = isLoadingRoles || isLoadingPermissions

  const [overrides, setOverrides] = useState<Record<string, boolean>>({})
  const [editRole, setEditRole] = useState<Role | null>(null)
  const [deleteRole, setDeleteRole] = useState<Role | null>(null)
  const [deleteRoleError, setDeleteRoleError] = useState<string | null>(null)

  const { mutate: doDelete, isPending: isDeleting } = useDeleteRole()
  const { mutate: bulkSave, isPending: isSaving } = useBulkUpdateRolePermissions()

  const allPermissionKeys = permissionGroups.flatMap((g) => g.permissions.map((p) => p.key))

  const isChecked = (roleId: number, key: string) => {
    const override = overrides[`${roleId}-${key}`]
    if (override !== undefined) return override
    return roles.find((r) => r.role_id === roleId)?.permissions.includes(key) ?? false
  }

  const handleSave = () => {
    bulkSave({
      rolePermissions: roles.map((role) => ({
        role_id: role.role_id,
        permissions: allPermissionKeys.filter((key) => isChecked(role.role_id, key)),
      })),
    })
  }

  if (isLoading) {
    return <RolePermissionsTabSkeleton />
  }

  return (
    <>
      {/* Toolbar */}
      <div className="border-borderSubtle flex items-center gap-3 border-b px-4 py-4 lg:justify-between">
        <div className="border-borderSubtle flex max-w-125 flex-1 items-center gap-2 rounded-full border bg-white px-4 py-2.5">
          <SearchIcon />
          <input
            placeholder="Search permissions"
            className="font-jakarta text-brand placeholder:text-brand/60 flex-1 bg-transparent text-sm tracking-[-0.04em] outline-none"
          />
        </div>
        <Button variant="secondary" onClick={handleSave} loading={isSaving}>
          Save permissions
        </Button>
      </div>

      {/* Roles management */}
      <div className="border-borderSubtle border-b px-4 py-4">
        <p className="font-jakarta text-brand/50 mb-3 text-xs font-semibold tracking-wide uppercase">
          Roles
        </p>
        <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
          {roles.map((role) => (
            <RoleChip
              key={role.role_id}
              role={role}
              onEdit={() => setEditRole(role)}
              onDelete={() => setDeleteRole(role)}
            />
          ))}
        </div>
      </div>

      {/* Permission matrix */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-max text-sm">
          <thead>
            <tr className="border-borderSubtle border-b">
              <th className="font-jakarta text-brand/40 min-w-48 px-4 py-3 text-left text-xs font-semibold tracking-wide uppercase">
                PERMISSION
              </th>
              {roles.map((role) => (
                <th
                  key={role.role_id}
                  className="font-jakarta text-brand/40 min-w-28 px-4 py-3 text-center text-xs font-semibold tracking-wide whitespace-nowrap uppercase"
                >
                  {role.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {permissionGroups.map((group) => (
              <Fragment key={group.key}>
                <tr className="border-borderSubtle border-b bg-gray-50/50">
                  <td
                    colSpan={roles.length + 1}
                    className="font-jakarta text-brand px-4 py-2 text-sm font-semibold"
                  >
                    {group.label}
                  </td>
                </tr>
                {group.permissions.map(({ label, key }) => (
                  <tr key={key} className="border-borderSubtle border-b last:border-0">
                    <td className="font-jakarta text-brand/70 px-4 py-3 text-sm">{label}</td>
                    {roles.map((role) => (
                      <td key={role.role_id} className="px-4 py-3 text-center">
                        <input
                          type="checkbox"
                          checked={isChecked(role.role_id, key)}
                          onChange={(e) =>
                            setOverrides((prev) => ({
                              ...prev,
                              [`${role.role_id}-${key}`]: e.target.checked,
                            }))
                          }
                          className="accent-primary h-4 w-4 rounded border-gray-300"
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>

      <EditRoleModal isOpen={!!editRole} onClose={() => setEditRole(null)} role={editRole} />
      <DeleteConfirmModal
        isOpen={!!deleteRole}
        entityType="role"
        entityName={deleteRole?.name}
        onClose={() => setDeleteRole(null)}
        isLoading={isDeleting}
        onConfirm={() => {
          if (deleteRole)
            doDelete(deleteRole.role_id, {
              onSuccess: () => setDeleteRole(null),
              onError: (error) => {
                setDeleteRole(null)
                setDeleteRoleError(error.message)
              },
            })
        }}
      />

      <Modal
        isOpen={!!deleteRoleError}
        onClose={() => setDeleteRoleError(null)}
        variant="dialog"
        className="max-w-sm p-0"
        customFooter={
          <div className="border-borderSubtle border-t px-6 py-4">
            <Button variant="subtle" className="w-full" onClick={() => setDeleteRoleError(null)}>
              Close
            </Button>
          </div>
        }
      >
        <div className="flex flex-col items-center px-6 py-6 text-center">
          <div className="bg-danger/8 mb-4 flex h-12 w-12 items-center justify-center rounded-full">
            <AlertCircle size={20} className="text-danger" />
          </div>
          <h2 className="font-jakarta text-brand text-base font-semibold">Cannot delete role</h2>
          <p className="font-jakarta text-brand/60 mt-2 text-sm">{deleteRoleError}</p>
        </div>
      </Modal>
    </>
  )
}

const RoleChip = ({
  role,
  onEdit,
  onDelete,
}: {
  role: Role
  onEdit: () => void
  onDelete: () => void
}) => (
  <div className="border-borderSubtle flex shrink-0 items-center gap-2.5 rounded-full border bg-white px-3.5 py-2">
    <ShieldCheck size={14} className="text-primary shrink-0" />
    <span className="font-jakarta text-brand text-sm font-medium">{role.name}</span>
    <div className="flex items-center gap-1.5 pl-1">
      <button
        onClick={onEdit}
        className="text-brand/40 hover:text-brand rounded p-0.5 transition-colors"
        title="Edit role"
      >
        <Pencil size={13} />
      </button>
      {!role.is_system && (
        <button
          onClick={onDelete}
          className="text-danger/50 hover:text-danger rounded p-0.5 transition-colors"
          title="Delete role"
        >
          <Trash2 size={13} />
        </button>
      )}
    </div>
  </div>
)

const RolePermissionsTabSkeleton = () => (
  <>
    {/* Toolbar */}
    <div className="border-borderSubtle flex items-center gap-3 border-b px-4 py-4">
      <Skeleton className="h-10 flex-1 rounded-full" />
      <Skeleton className="h-10 w-36 rounded-lg" />
    </div>

    {/* Role chips */}
    <div className="border-borderSubtle border-b px-4 py-4">
      <Skeleton className="mb-3 h-2.5 w-12" />
      <div className="flex gap-2">
        {[80, 72, 100, 88, 96].map((w, i) => (
          <Skeleton key={i} className="h-9 rounded-full" style={{ width: w }} />
        ))}
      </div>
    </div>

    {/* Matrix */}
    <div className="overflow-x-auto">
      <table className="w-full min-w-max">
        <thead>
          <tr className="border-borderSubtle border-b">
            <th className="min-w-48 px-4 py-3 text-left">
              <Skeleton className="h-2.5 w-24" />
            </th>
            {Array.from({ length: 5 }).map((_, i) => (
              <th key={i} className="min-w-28 px-4 py-3 text-center">
                <Skeleton className="mx-auto h-2.5 w-16" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 4 }).map((_, gi) => (
            <Fragment key={gi}>
              <tr className="border-borderSubtle border-b bg-gray-50/50">
                <td colSpan={6} className="px-4 py-2">
                  <Skeleton className="h-3 w-28" />
                </td>
              </tr>
              {Array.from({ length: 3 }).map((_, pi) => (
                <tr key={pi} className="border-borderSubtle border-b">
                  <td className="px-4 py-3">
                    <Skeleton className="h-2.5 w-40" />
                  </td>
                  {Array.from({ length: 5 }).map((_, ci) => (
                    <td key={ci} className="px-4 py-3 text-center">
                      <Skeleton className="mx-auto h-4 w-4 rounded" />
                    </td>
                  ))}
                </tr>
              ))}
            </Fragment>
          ))}
        </tbody>
      </table>
    </div>
  </>
)
