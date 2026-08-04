import { X } from "lucide-react"
import { cn, formatDateToCustomFormat } from "@/lib/utils"
import Modal from "@/components/ui/modal"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/ui/data-table"
import { Skeleton } from "@/components/ui/skeleton"
import { ROLE_COLORS, userStatusConfig } from "@/components/table-columns/staff"
import { useGetStaffById } from "@/store/queries/staff"
import type { AppUser } from "@/types/staff"

interface Props {
  isOpen: boolean
  onClose: () => void
  user: AppUser | null
  onEdit: (user: AppUser) => void
  onDeactivate: (user: AppUser) => void
  onReactivate: (user: AppUser) => void
  onDelete: (user: AppUser) => void
  onSendDraft: (user: AppUser) => void
  onResendInvite: (user: AppUser) => void
  onCancelInvite: (user: AppUser) => void
  isSendingInvite?: boolean
  isResendingInvite?: boolean
}

export default function UserDetailModal({
  isOpen,
  onClose,
  user,
  onEdit,
  onDeactivate,
  onReactivate,
  onDelete,
  onSendDraft,
  onResendInvite,
  onCancelInvite,
  isSendingInvite = false,
  isResendingInvite = false,
}: Props) {
  const { data: freshStaff, isLoading } = useGetStaffById(isOpen && user ? user.id : null)
  const staff = freshStaff ?? user

  if (!user) return null

  const cfg = userStatusConfig[staff?.status ?? user.status]

  const customHeader = (
    <div className="border-line shrink-0 border-b px-6 py-4">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="font-jakarta text-brand text-base font-semibold tracking-[-0.04em]">
            Staff details
          </h2>
          <p className="font-jakarta text-brand/60 mt-0.5 text-sm font-medium tracking-[-0.04em]">
            {(user.status === "draft" || user.status === "invited" || user.status === "pending") &&
            user.inviteId
              ? `Invite #${user.inviteId}`
              : user.id}
          </p>
        </div>
        <button
          onClick={onClose}
          className="text-brand/40 hover:text-brand ml-4 shrink-0 rounded p-0.5 transition-colors"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  )

  const status = staff?.status ?? user.status

  const customFooter = (
    <div className="border-borderSubtle shrink-0 border-t p-4 sm:p-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
        {status === "draft" ? (
          <>
            <Button
              variant="ghost"
              className="border-danger/8 bg-danger/4 text-danger hover:bg-danger/8 flex-1 border"
              disabled={isSendingInvite}
              onClick={() => onCancelInvite(user)}
            >
              Cancel invite
            </Button>
            <Button
              variant="secondary"
              className="flex-1"
              loading={isSendingInvite}
              onClick={() => onSendDraft(user)}
            >
              Send invite
            </Button>
          </>
        ) : status === "invited" || status === "pending" ? (
          <>
            <Button
              variant="ghost"
              className="border-danger/8 bg-danger/4 text-danger hover:bg-danger/8 flex-1 border"
              disabled={isResendingInvite}
              onClick={() => onCancelInvite(user)}
            >
              Cancel invite
            </Button>
            <Button
              variant="secondary"
              className="flex-1"
              loading={isResendingInvite}
              onClick={() => onResendInvite(user)}
            >
              Resend invite
            </Button>
          </>
        ) : status === "inactive" ? (
          <>
            <Button
              variant="ghost"
              className="border-danger/8 bg-danger/4 text-danger hover:bg-danger/8 flex-1 border"
              onClick={() => {
                onDelete(user)
              }}
            >
              Delete staff
            </Button>
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => {
                onReactivate(user)
              }}
            >
              Reactivate
            </Button>
          </>
        ) : (
          <>
            <Button
              variant="ghost"
              className="border-danger/8 bg-danger/4 text-danger hover:bg-danger/8 flex-1 border"
              onClick={() => {
                onDelete(user)
              }}
            >
              Delete staff
            </Button>
            <Button
              variant="subtle"
              className="flex-1"
              onClick={() => {
                onDeactivate(user)
              }}
            >
              Deactivate
            </Button>
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => {
                onEdit(user)
              }}
            >
              Edit staff
            </Button>
          </>
        )}
      </div>
    </div>
  )

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      variant="drawer"
      customHeader={customHeader}
      customFooter={customFooter}
      width="652px"
    >
      <div className="flex-1 overflow-y-auto px-6 py-5">
        {isLoading ? (
          <>
            <div className="mb-6 flex items-center gap-4">
              <Skeleton className="h-16 w-16 shrink-0 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-36" />
                <Skeleton className="h-3 w-48" />
                <div className="flex gap-2 pt-0.5">
                  <Skeleton className="h-5 w-20 rounded-full" />
                  <Skeleton className="h-5 w-14 rounded-full" />
                </div>
              </div>
            </div>
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="border-borderSubtle flex items-center justify-between border-b py-3"
              >
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-3 w-32" />
              </div>
            ))}
          </>
        ) : (
          <>
            {/* Avatar + name */}
            <div className="mb-6 flex items-center gap-4">
              <div className="bg-primary/15 flex h-16 w-16 shrink-0 items-center justify-center rounded-full">
                <span className="font-jakarta text-primary text-xl font-bold">
                  {staff!.initials}
                </span>
              </div>
              <div>
                <p className="font-jakarta text-brand text-base font-semibold tracking-[-0.04em]">
                  {staff!.name}
                </p>
                <p className="font-jakarta text-brand/50 text-sm">{staff!.email}</p>
                <div className="mt-1.5 flex items-center gap-2">
                  <span
                    className={cn(
                      "font-jakarta rounded-full px-2.5 py-0.5 text-xs font-semibold",
                      ROLE_COLORS[staff!.role] ?? "bg-gray-50 text-gray-600",
                    )}
                  >
                    {staff!.role}
                  </span>
                  <StatusBadge label={cfg.label} variant={cfg.variant} dot />
                </div>
              </div>
            </div>

            <SectionLabel title="ACCOUNT DETAILS" />
            <DetailRow label="Staff ID">{staff!.id}</DetailRow>
            {staff!.inviteId && <DetailRow label="Invite ID">{staff!.inviteId}</DetailRow>}
            <DetailRow label="Full name">{staff!.name}</DetailRow>
            <DetailRow label="Email address">{staff!.email}</DetailRow>
            <DetailRow label="Role">{staff!.role}</DetailRow>
            <DetailRow label="Store access">{staff!.storeAccess}</DetailRow>
            <DetailRow label="Date added">{formatDateToCustomFormat(staff!.dateAdded)}</DetailRow>
            <DetailRow label="Status">
              <StatusBadge label={cfg.label} variant={cfg.variant} dot />
            </DetailRow>

            <SectionLabel title="ACTIVITY" />
            <DetailRow label="Last login">2 days ago</DetailRow>
            <DetailRow label="Last action">Updated product stock</DetailRow>
          </>
        )}
      </div>
    </Modal>
  )
}

const SectionLabel = ({ title }: { title: string }) => (
  <p className="font-jakarta text-brand/60 mt-5 mb-1 text-xs font-semibold tracking-wide uppercase first:mt-0">
    {title}
  </p>
)

const DetailRow = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="border-borderSubtle flex items-center justify-between gap-4 border-b py-3">
    <span className="font-jakarta text-brand/60 shrink-0 text-sm">{label}</span>
    <span className="font-jakarta text-brand text-right text-sm font-medium">{children}</span>
  </div>
)
