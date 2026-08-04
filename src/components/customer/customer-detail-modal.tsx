import { useState } from "react"
import { X, Pencil, Mail, Send, Ban, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import Modal from "@/components/ui/modal"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import DeleteConfirmModal from "@/components/ui/delete-confirm-modal"
import EditCustomerModal from "@/components/customer/edit-customer-modal"
import AboutTab from "@/components/customer/tabs/about-tab"
import PurchaseSummaryTab from "@/components/customer/tabs/purchase-summary-tab"
import NotesTab from "@/components/customer/tabs/notes-tab"
import { useGetCustomerById } from "@/store/queries/customers"
import {
  useSendCustomerPasswordResetEmail,
  useSendCustomerDirectEmail,
  useDeleteCustomer,
  useUpdateCustomerStatus,
} from "@/store/mutations/customers"
import { showAlert } from "@/store/alerts"
import { formatDateToCustomFormat } from "@/lib/utils"
import type { CustomerDetail } from "@/types/customers"
import { CustomerStatus } from "@/lib/constants"

interface Props {
  isOpen: boolean
  onClose: () => void
  customer: CustomerDetail | null
}

const TABS = ["About customer", "Purchase summary", "Notes"]

export default function CustomerDetailModal({ isOpen, onClose, customer: customerProp }: Props) {
  const [activeTab, setActiveTab] = useState("About customer")
  const [showMore, setShowMore] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDirectEmailForm, setShowDirectEmailForm] = useState(false)
  const [emailSubject, setEmailSubject] = useState("")
  const [emailMessage, setEmailMessage] = useState("")

  const { data: fetchedDetail, isLoading } = useGetCustomerById(
    customerProp?.entity_id != null ? String(customerProp.entity_id) : null,
  )
  const detail = fetchedDetail ?? null

  const sendPasswordReset = useSendCustomerPasswordResetEmail()
  const sendDirectEmail = useSendCustomerDirectEmail()
  const deleteCustomer = useDeleteCustomer()
  const updateStatus = useUpdateCustomerStatus()

  const anyPending =
    sendPasswordReset.isPending ||
    sendDirectEmail.isPending ||
    deleteCustomer.isPending ||
    updateStatus.isPending

  if (!customerProp) return null

  const isSuspended = (fetchedDetail ?? customerProp).status === CustomerStatus.INACTIVE

  const handlePasswordReset = () => {
    setShowMore(false)
    sendPasswordReset.mutate(customerProp.entity_id)
  }

  const handleDirectEmail = () => {
    if (!emailSubject.trim() || !emailMessage.trim()) {
      showAlert({ variant: "error", message: "Subject and message are required" })
      return
    }
    sendDirectEmail.mutate(
      { entityId: customerProp.entity_id, subject: emailSubject, message: emailMessage },
      {
        onSuccess: () => {
          showAlert({ variant: "success", message: "Email sent successfully" })
          setShowDirectEmailForm(false)
          setEmailSubject("")
          setEmailMessage("")
        },
        onError: (e) => showAlert({ variant: "error", message: e.message }),
      },
    )
  }

  const handleSuspend = () => {
    setShowMore(false)
    updateStatus.mutate(
      { id: String(customerProp.entity_id), status: CustomerStatus.INACTIVE },
      {
        onSuccess: () => showAlert({ variant: "success", message: "Customer account suspended" }),
        onError: (e) => showAlert({ variant: "error", message: e.message }),
      },
    )
  }

  const handleReactivate = () => {
    setShowMore(false)
    updateStatus.mutate(
      { id: String(customerProp.entity_id), status: CustomerStatus.ACTIVE },
      {
        onSuccess: () => showAlert({ variant: "success", message: "Customer account reactivated" }),
        onError: (e) => showAlert({ variant: "error", message: e.message }),
      },
    )
  }

  const handleDelete = () => {
    deleteCustomer.mutate(customerProp.entity_id, {
      onSuccess: () => {
        showAlert({ variant: "success", message: "Customer profile deleted" })
        setShowDeleteConfirm(false)
        onClose()
      },
      onError: (e) => showAlert({ variant: "error", message: e.message }),
    })
  }

  const customHeader = (
    <div className="border-line shrink-0 border-b px-6 py-4">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="font-jakarta text-brand text-base font-semibold tracking-[-0.04em]">
            {customerProp.customer_id}
          </h2>
          <p className="font-jakarta text-brand/60 mt-0.5 text-sm font-medium tracking-[-0.04em]">
            {isSuspended ? "Inactive" : "Active"}
            {detail?.member_since
              ? ` · Member since ${formatDateToCustomFormat(detail.member_since, true)}`
              : ""}
          </p>
        </div>
        <button
          onClick={onClose}
          disabled={anyPending}
          className="text-brand/40 hover:text-brand ml-4 shrink-0 rounded p-0.5 transition-colors disabled:opacity-40"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  )

  const customFooter = showDirectEmailForm ? (
    <div className="border-borderSubtle shrink-0 space-y-3 border-t p-4 sm:p-6">
      <p className="font-jakarta text-brand text-sm font-semibold">Send direct email</p>
      <input
        value={emailSubject}
        onChange={(e) => setEmailSubject(e.target.value)}
        placeholder="Subject"
        className="font-jakarta text-brand placeholder:text-brand/40 border-brand/8 focus:border-primary/30 w-full rounded-lg border bg-white px-3 py-2.5 text-sm outline-none"
      />
      <textarea
        rows={3}
        value={emailMessage}
        onChange={(e) => setEmailMessage(e.target.value)}
        placeholder="Message"
        className="font-jakarta text-brand placeholder:text-brand/40 border-brand/8 focus:border-primary/30 w-full resize-none rounded-lg border bg-white px-3 py-2.5 text-sm outline-none"
      />
      <div className="flex gap-2">
        <Button
          variant="outline"
          className="flex-1"
          disabled={sendDirectEmail.isPending}
          onClick={() => {
            setShowDirectEmailForm(false)
            setEmailSubject("")
            setEmailMessage("")
          }}
        >
          Cancel
        </Button>
        <Button
          variant="secondary"
          className="flex-1"
          loading={sendDirectEmail.isPending}
          onClick={handleDirectEmail}
        >
          Send email
        </Button>
      </div>
    </div>
  ) : (
    <div className="border-borderSubtle shrink-0 border-t p-4 sm:p-6">
      <div className="flex gap-2">
        {/* More actions dropdown */}
        <div className="relative flex-1">
          <Button
            variant="outline"
            className="w-full!"
            onClick={() => setShowMore((v) => !v)}
            disabled={anyPending}
          >
            More actions
          </Button>

          {showMore && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowMore(false)} />
              <div className="border-borderSubtle absolute bottom-full left-0 z-50 mb-2 w-64 overflow-hidden rounded-xl border bg-white shadow-lg">
                <button
                  onClick={handlePasswordReset}
                  disabled={sendPasswordReset.isPending}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-gray-50 disabled:opacity-50"
                >
                  <div className="bg-primary/8 flex h-7 w-7 shrink-0 items-center justify-center rounded-full">
                    <Mail size={13} className="text-primary" />
                  </div>
                  <div>
                    <p className="font-jakarta text-brand text-sm font-medium">
                      Send password reset
                    </p>
                    <p className="font-jakarta text-brand/40 text-xs">
                      Email a reset link to the customer
                    </p>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setShowMore(false)
                    setShowDirectEmailForm(true)
                  }}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-gray-50"
                >
                  <div className="bg-primary/8 flex h-7 w-7 shrink-0 items-center justify-center rounded-full">
                    <Send size={13} className="text-primary" />
                  </div>
                  <div>
                    <p className="font-jakarta text-brand text-sm font-medium">Send direct email</p>
                    <p className="font-jakarta text-brand/40 text-xs">
                      Compose and send a custom message
                    </p>
                  </div>
                </button>

                <div className="border-borderSubtle mx-4 border-t" />

                {isSuspended ? (
                  <button
                    onClick={handleReactivate}
                    disabled={updateStatus.isPending}
                    className="hover:bg-statusSuccess/4 flex w-full items-center gap-3 px-4 py-3 text-left transition-colors disabled:opacity-50"
                  >
                    <div className="bg-statusSuccess/10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full">
                      <Ban size={13} className="text-statusSuccess" />
                    </div>
                    <div>
                      <p className="font-jakarta text-statusSuccess text-sm font-medium">
                        Reactivate account
                      </p>
                      <p className="font-jakarta text-statusSuccess/60 text-xs">
                        Restore customer access
                      </p>
                    </div>
                  </button>
                ) : (
                  <button
                    onClick={handleSuspend}
                    disabled={updateStatus.isPending}
                    className="hover:bg-statusWarning/4 flex w-full items-center gap-3 px-4 py-3 text-left transition-colors disabled:opacity-50"
                  >
                    <div className="bg-statusWarning/10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full">
                      <Ban size={13} className="text-statusWarning" />
                    </div>
                    <div>
                      <p className="font-jakarta text-statusWarning text-sm font-medium">
                        Suspend account
                      </p>
                      <p className="font-jakarta text-statusWarning/60 text-xs">
                        Prevent customer from logging in
                      </p>
                    </div>
                  </button>
                )}

                <button
                  onClick={() => {
                    setShowMore(false)
                    setShowDeleteConfirm(true)
                  }}
                  className="hover:bg-danger/4 flex w-full items-center gap-3 px-4 py-3 text-left transition-colors"
                >
                  <div className="bg-danger/8 flex h-7 w-7 shrink-0 items-center justify-center rounded-full">
                    <Trash2 size={13} className="text-danger" />
                  </div>
                  <div>
                    <p className="font-jakarta text-danger text-sm font-medium">Delete profile</p>
                    <p className="font-jakarta text-danger/60 text-xs">
                      Permanently remove this customer
                    </p>
                  </div>
                </button>
              </div>
            </>
          )}
        </div>

        <Button
          variant="secondary"
          className="flex-1"
          beforeIcon={<Pencil size={13} />}
          onClick={() => setShowEditModal(true)}
          disabled={anyPending}
        >
          Edit profile
        </Button>
      </div>
    </div>
  )

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        variant="drawer"
        customHeader={customHeader}
        customFooter={customFooter}
        width="652px"
        preventClose={anyPending}
      >
        {/* Tabs */}
        <div className="no-scrollbar border-blur flex shrink-0 overflow-x-auto border-b px-6">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "font-jakarta -mb-px shrink-0 border-b-2 px-4 py-2.75 text-sm tracking-[-0.04em] whitespace-nowrap transition-colors",
                activeTab === tab
                  ? "text-brand border-secondary font-semibold"
                  : "text-brand hover:text-brand/70 border-transparent font-medium",
              )}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab body */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="border-borderSubtle flex items-center justify-between border-b py-3"
                >
                  <Skeleton className="h-3 w-28" />
                  <Skeleton className="h-3 w-36" />
                </div>
              ))}
            </div>
          ) : (
            <>
              {activeTab === "About customer" && (
                <AboutTab customer={customerProp} detail={detail} />
              )}
              {activeTab === "Purchase summary" && <PurchaseSummaryTab customer={customerProp} />}
              {activeTab === "Notes" && <NotesTab customer={customerProp} />}
            </>
          )}
        </div>
      </Modal>

      <DeleteConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        isLoading={deleteCustomer.isPending}
        entityType="customer profile"
        entityName={customerProp.customer_name}
      />

      <EditCustomerModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        customer={
          fetchedDetail ? { ...fetchedDetail, entity_id: customerProp.entity_id } : customerProp
        }
      />
    </>
  )
}
