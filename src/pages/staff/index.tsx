import { useState } from "react"
import { useQueryState } from "nuqs"
import { Plus, UserPlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import MetricCard from "@/components/shared/metric-card"
import DeleteConfirmModal from "@/components/ui/delete-confirm-modal"
import PageSkeleton from "@/components/shared/page-skeleton"
import { showAlert } from "@/store/alerts"
import { useGetStaff, useGetStaffMetrics } from "@/store/queries/staff"
import {
  useDeactivateStaff,
  useReactivateStaff,
  useSendInvite,
  useResendInvite,
  useCancelInvite,
} from "@/store/mutations/staff"
import type { AppUser } from "@/types/staff"
import InviteStaffModal from "@/components/staff/invite-staff-modal"
import CreateStaffModal from "@/components/staff/create-staff-modal"
import CreateRoleModal from "@/components/staff/create-role-modal"
import ChangeRoleModal from "@/components/staff/change-role-modal"
import StaffDetailModal from "@/components/staff/staff-detail-modal"
import EditStaffModal from "@/components/staff/edit-staff-modal"
import UserTabs, { TABS } from "@/components/staff/tabs"

export default function StaffPage() {
  const { data: metrics, isLoading: isLoadingMetrics } = useGetStaffMetrics()
  const { data: usersData, isLoading: isLoadingUsers } = useGetStaff()
  const users = usersData?.items ?? []

  const deactivate = useDeactivateStaff()
  const reactivate = useReactivateStaff()
  const sendInvite = useSendInvite()
  const resendInvite = useResendInvite()
  const cancelInvite = useCancelInvite()

  const [activeTab, setActiveTab] = useQueryState("tab", { defaultValue: TABS.USER_DETAILS })
  const [showInviteStaff, setShowInviteStaff] = useState(false)
  const [showCreateStaff, setShowCreateStaff] = useState(false)
  const [showChangeRole, setShowChangeRole] = useState(false)
  const [showDetail, setShowDetail] = useState(false)
  const [showEditStaff, setShowEditStaff] = useState(false)
  const [selectedStaff, setSelectedStaff] = useState<AppUser | null>(null)
  const [showCreateRole, setShowCreateRole] = useState(false)

  // Confirmation targets
  const [deactivateTarget, setDeactivateTarget] = useState<AppUser | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<AppUser | null>(null)
  const [reactivateTarget, setReactivateTarget] = useState<AppUser | null>(null)
  const [cancelInviteTarget, setCancelInviteTarget] = useState<AppUser | null>(null)

  const handleDeactivateConfirm = () => {
    if (!deactivateTarget) return
    deactivate.mutate(deactivateTarget.id, {
      onSuccess: () => setDeactivateTarget(null),
      onError: (error) => showAlert({ variant: "error", message: error.message }),
    })
  }

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return
    deactivate.mutate(deleteTarget.id, {
      onSuccess: () => setDeleteTarget(null),
      onError: (error) => showAlert({ variant: "error", message: error.message }),
    })
  }

  const handleReactivateConfirm = () => {
    if (!reactivateTarget) return
    reactivate.mutate(reactivateTarget.id, {
      onSuccess: () => setReactivateTarget(null),
      onError: (error) => showAlert({ variant: "error", message: error.message }),
    })
  }

  const handleCancelInviteConfirm = () => {
    if (!cancelInviteTarget) return
    const id = cancelInviteTarget.inviteId ?? ""
    cancelInvite.mutate(id, {
      onSuccess: () => setCancelInviteTarget(null),
      onError: (error) => showAlert({ variant: "error", message: error.message }),
    })
  }

  const handleResendInvite = (user: AppUser) => {
    const id = user.inviteId ?? ""
    resendInvite.mutate(id, {
      onSuccess: () => {
        setShowDetail(false)
        setSelectedStaff(null)
        showAlert({ variant: "success", message: `Invite resent to ${user.email}` })
      },
      onError: () =>
        showAlert({ variant: "error", message: "Failed to resend invite. Please try again." }),
    })
  }

  const handleSendDraft = (user: AppUser) => {
    const id = user.inviteId ?? ""
    sendInvite.mutate(id, {
      onSuccess: () => {
        setShowDetail(false)
        setSelectedStaff(null)
        showAlert({ variant: "success", message: `Invite sent to ${user.email}` })
      },
      onError: () =>
        showAlert({ variant: "error", message: "Failed to send invite. Please try again." }),
    })
  }

  if (isLoadingMetrics || isLoadingUsers) return <PageSkeleton metricCount={4} />

  return (
    <div className="page-bg min-h-full">
      {/* ── Page header ── */}
      <div className="border-borderSubtle flex flex-col justify-between gap-3 border-b bg-white p-4 md:flex-row md:items-center md:p-6">
        <div>
          <h1 className="font-jakarta text-brand text-base font-semibold tracking-[-0.04em]">
            Staff &amp; Roles
          </h1>
          <p className="font-jakarta text-brand/60 mt-0.5 text-sm font-medium tracking-[-0.04em]">
            Manage team members and access permissions
          </p>
        </div>
        <div className="flex w-full flex-wrap gap-2 lg:w-[unset] lg:flex-nowrap">
          <Button
            variant="subtle"
            className="w-full lg:w-auto"
            onClick={() => setShowCreateRole(true)}
          >
            Add role
          </Button>
          <Button
            variant="outline"
            className="flex-1 lg:flex-none"
            beforeIcon={<UserPlus size={14} />}
            onClick={() => setShowCreateStaff(true)}
          >
            Create staff
          </Button>
          <Button
            variant="secondary"
            className="flex-1 lg:flex-none"
            beforeIcon={<Plus size={14} />}
            onClick={() => setShowInviteStaff(true)}
          >
            Invite staff
          </Button>
        </div>
      </div>

      {/* ── Metric cards ── */}
      <div className="no-scrollbar flex grid-cols-4 gap-3 overflow-x-auto p-4 lg:grid lg:grid-cols-4 lg:p-6">
        {(
          [
            { label: "Total staff", value: metrics?.total_users ?? 0 },
            { label: "Active staff", value: metrics?.active_users ?? 0 },
            { label: "Inactive staff", value: metrics?.inactive_users ?? 0 },
            { label: "Pending staff", value: metrics?.pending_users ?? 0 },
          ] as const
        ).map((m) => (
          <MetricCard key={m.label} label={m.label} value={m.value} />
        ))}
      </div>

      {/* ── Tabs ── */}
      <UserTabs
        activeTab={activeTab}
        onTabChange={(tab) => void setActiveTab(tab)}
        isLoadingUsers={isLoadingUsers}
        users={users}
        onView={(user) => {
          setSelectedStaff(user)
          setShowDetail(true)
        }}
        onChangeRole={(user) => {
          setSelectedStaff(user)
          setShowChangeRole(true)
        }}
        onSendDraft={handleSendDraft}
        onResendInvite={handleResendInvite}
        onCancelInvite={(user) => setCancelInviteTarget(user)}
        onEdit={(user) => {
          setSelectedStaff(user)
          setShowEditStaff(true)
        }}
        onDeactivate={(user) => setDeactivateTarget(user)}
        onReactivate={(user) => setReactivateTarget(user)}
        onDelete={(user) => setDeleteTarget(user)}
      />

      <CreateRoleModal isOpen={showCreateRole} onClose={() => setShowCreateRole(false)} />
      <InviteStaffModal isOpen={showInviteStaff} onClose={() => setShowInviteStaff(false)} />
      <CreateStaffModal isOpen={showCreateStaff} onClose={() => setShowCreateStaff(false)} />
      <ChangeRoleModal
        isOpen={showChangeRole}
        onClose={() => {
          setShowChangeRole(false)
          setSelectedStaff(null)
        }}
        user={selectedStaff}
      />
      <StaffDetailModal
        isOpen={showDetail}
        onClose={() => {
          setShowDetail(false)
          setSelectedStaff(null)
        }}
        user={selectedStaff}
        onEdit={(user) => {
          setShowDetail(false)
          setSelectedStaff(user)
          setShowEditStaff(true)
        }}
        onDeactivate={(user) => {
          setShowDetail(false)
          setDeactivateTarget(user)
        }}
        onReactivate={(user) => {
          setShowDetail(false)
          setReactivateTarget(user)
        }}
        onDelete={(user) => {
          setShowDetail(false)
          setDeleteTarget(user)
        }}
        onSendDraft={handleSendDraft}
        onResendInvite={handleResendInvite}
        onCancelInvite={(user) => {
          setShowDetail(false)
          setCancelInviteTarget(user)
        }}
        isSendingInvite={sendInvite.isPending}
        isResendingInvite={resendInvite.isPending}
      />
      <EditStaffModal
        isOpen={showEditStaff}
        onClose={() => {
          setShowEditStaff(false)
          setSelectedStaff(null)
        }}
        user={selectedStaff}
      />

      <DeleteConfirmModal
        isOpen={!!deactivateTarget}
        variant="deactivate"
        entityType="staff"
        entityName={deactivateTarget?.name ?? ""}
        onClose={() => setDeactivateTarget(null)}
        onConfirm={handleDeactivateConfirm}
        isLoading={deactivate.isPending}
      />
      <DeleteConfirmModal
        isOpen={!!reactivateTarget}
        entityType="staff"
        entityName={reactivateTarget?.name ?? ""}
        onClose={() => setReactivateTarget(null)}
        onConfirm={handleReactivateConfirm}
        isLoading={reactivate.isPending}
      />
      <DeleteConfirmModal
        isOpen={!!deleteTarget}
        entityType="staff"
        entityName={deleteTarget?.name ?? ""}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        isLoading={deactivate.isPending}
      />
      <DeleteConfirmModal
        isOpen={!!cancelInviteTarget}
        entityType="invite"
        entityName={cancelInviteTarget?.name ?? ""}
        onClose={() => setCancelInviteTarget(null)}
        onConfirm={handleCancelInviteConfirm}
        isLoading={cancelInvite.isPending}
      />
    </div>
  )
}
