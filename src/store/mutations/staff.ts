import { useMutation, useQueryClient } from "@tanstack/react-query"
import {
  createStaff,
  updateStaff,
  changeStaffRole,
  deactivateStaff,
  reactivateStaff,
  createInvite,
  sendInvite,
  resendInvite,
  cancelInvite,
  validateInviteToken,
  acceptInvite,
  createRole,
  updateRole,
  deleteRole,
  bulkUpdateRolePermissions,
} from "@/store/requests/staff"
import {
  GET_STAFF_KEY,
  GET_STAFF_METRICS_KEY,
  GET_INVITES_KEY,
  GET_ROLES_KEY,
} from "@/store/query-keys"

export const useCreateStaff = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: createStaff,
    onSuccess: () => qc.invalidateQueries({ queryKey: [GET_STAFF_KEY] }),
  })
}

export const useUpdateStaff = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      ...payload
    }: {
      id: string
      firstname?: string
      lastname?: string
      email?: string
    }) => updateStaff(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: [GET_STAFF_KEY] }),
  })
}

export const useChangeStaffRole = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      ...payload
    }: {
      id: string
      roleId: number
      storeAccess: string | number[]
      reason?: string
    }) => changeStaffRole(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: [GET_STAFF_KEY] }),
  })
}

export const useDeactivateStaff = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deactivateStaff(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [GET_STAFF_KEY] }),
  })
}

export const useReactivateStaff = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => reactivateStaff(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [GET_STAFF_KEY] }),
  })
}

export const useCreateInvite = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: createInvite,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [GET_INVITES_KEY] })
      qc.invalidateQueries({ queryKey: [GET_STAFF_KEY] })
      qc.invalidateQueries({ queryKey: [GET_STAFF_METRICS_KEY] })
    },
  })
}

export const useSendInvite = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => sendInvite(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [GET_INVITES_KEY] }),
  })
}

export const useResendInvite = () => useMutation({ mutationFn: (id: string) => resendInvite(id) })

export const useCancelInvite = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => cancelInvite(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [GET_INVITES_KEY] })
      qc.invalidateQueries({ queryKey: [GET_STAFF_KEY] })
      qc.invalidateQueries({ queryKey: [GET_STAFF_METRICS_KEY] })
    },
  })
}

export const useValidateInviteToken = () =>
  useMutation({ mutationFn: (token: string) => validateInviteToken(token) })

export const useAcceptInvite = () => useMutation({ mutationFn: acceptInvite })

export const useCreateRole = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: createRole,
    onSuccess: () => qc.invalidateQueries({ queryKey: [GET_ROLES_KEY] }),
  })
}

export const useUpdateRole = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      ...payload
    }: {
      id: number
      name?: string
      description?: string
      permissions?: string[]
    }) => updateRole(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: [GET_ROLES_KEY] }),
  })
}

export const useDeleteRole = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => deleteRole(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [GET_ROLES_KEY] }),
  })
}

export const useBulkUpdateRolePermissions = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: bulkUpdateRolePermissions,
    onSuccess: () => qc.invalidateQueries({ queryKey: [GET_ROLES_KEY] }),
  })
}
