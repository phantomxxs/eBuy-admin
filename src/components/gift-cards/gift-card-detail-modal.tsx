import { useState } from "react"
import { Copy, Download, X } from "lucide-react"
import Modal from "@/components/ui/modal"
import { Button } from "@/components/ui/button"
import DeleteConfirmModal from "@/components/ui/delete-confirm-modal"
import { StatusBadge } from "@/components/ui/data-table"
import type { GiftCard, GiftCardLedgerEntry } from "@/types/gift-cards"
import { GIFT_CARD_STATUS_CONFIG } from "@/components/table-columns/gift-cards"
import {
  useChangeGiftCardStatus,
  useDeleteGiftCard,
  useResendGiftCardEmail,
  useExportGiftCardLedger,
} from "@/store/mutations/gift-cards"
import { useGetGiftCardLedger } from "@/store/queries/gift-cards"

interface Props {
  isOpen: boolean
  onClose: () => void
  card: GiftCard | null
  isLoading?: boolean
}

export default function GiftCardDetailModal({ isOpen, onClose, card, isLoading }: Props) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showDeactivateConfirm, setShowDeactivateConfirm] = useState(false)

  const changeStatus = useChangeGiftCardStatus()
  const deleteCard = useDeleteGiftCard()
  const resendEmail = useResendGiftCardEmail()
  const exportLedger = useExportGiftCardLedger()

  const { data: ledgerData, isLoading: isLoadingLedger } = useGetGiftCardLedger(
    isOpen ? (card?.id ?? null) : null,
  )

  if (!card && !isLoading) return null

  const statusCfg = card ? GIFT_CARD_STATUS_CONFIG[card.status] : null
  const balancePct = card && card.amount > 0 ? Math.round((card.balance / card.amount) * 100) : 0
  const isMutating =
    changeStatus.isPending ||
    deleteCard.isPending ||
    resendEmail.isPending ||
    exportLedger.isPending

  function handleCopyCode() {
    void navigator.clipboard.writeText(card!.code)
  }

  const customHeader = (
    <div className="border-line shrink-0 border-b px-6 py-4">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="font-jakarta text-brand text-base font-semibold tracking-[-0.04em]">
            Gift Card
          </h2>
          {card && (
            <p className="font-jakarta text-brand/60 mt-0.5 text-sm font-medium tracking-[-0.04em]">
              Issued{" "}
              {new Date(card.createdAt).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </p>
          )}
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

  const customFooter = (
    <div className="border-borderSubtle shrink-0 border-t p-4 sm:p-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
        {card?.status === "active" && (
          <Button
            variant="ghost"
            className="border-statusWarning/20 bg-statusWarning/8 text-statusWarning hover:bg-statusWarning/15 flex-1 border"
            disabled={isMutating}
            onClick={() => setShowDeactivateConfirm(true)}
          >
            Deactivate
          </Button>
        )}
        {card?.recipientEmail && card?.status === "active" && (
          <Button
            variant="outline"
            className="flex-1"
            disabled={isMutating}
            loading={resendEmail.isPending}
            onClick={() => resendEmail.mutate(card.id)}
          >
            Resend email
          </Button>
        )}
        <Button
          variant="ghost"
          className="border-danger/8 bg-danger/4 text-danger hover:bg-danger/8 flex-1 border"
          disabled={isMutating}
          onClick={() => setShowDeleteConfirm(true)}
        >
          Delete gift card
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
        width="560px"
        preventClose={isMutating}
      >
        <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
          {isLoading && !card && (
            <div className="flex flex-col gap-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-brand/5 h-10 animate-pulse rounded-xl" />
              ))}
            </div>
          )}
          {card && (
            <>
              {/* Code box */}
              <div className="border-borderSubtle flex items-center justify-between rounded-xl border bg-white p-4">
                <div>
                  <p className="font-jakarta text-brand/50 mb-1 text-xs font-semibold tracking-wider uppercase">
                    Gift Card Code
                  </p>
                  <span className="text-brand font-mono text-lg font-bold tracking-wider">
                    {card.code}
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  beforeIcon={<Copy size={13} />}
                  onClick={handleCopyCode}
                >
                  Copy
                </Button>
              </div>

              {/* Balance progress */}
              <div className="border-borderSubtle rounded-xl border bg-white p-4">
                <div className="mb-2 flex items-center justify-between">
                  <p className="font-jakarta text-brand/50 text-xs font-semibold tracking-wider uppercase">
                    Balance
                  </p>
                  <p className="font-jakarta text-brand text-sm font-bold">
                    ₦{card.balance.toLocaleString()}
                    <span className="font-jakarta text-brand/40 ml-1 text-xs font-medium">
                      / ₦{card.amount.toLocaleString()}
                    </span>
                  </p>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                  <div
                    className="bg-secondary h-full rounded-full transition-all"
                    style={{ width: `${balancePct}%` }}
                  />
                </div>
                <p className="font-jakarta text-brand/40 mt-1 text-xs">{balancePct}% remaining</p>
              </div>

              {card.senderName && (
                <>
                  <SectionLabel title="SENDER" />
                  <DetailRow label="Name">{card.senderName}</DetailRow>
                  {card.senderEmail && <DetailRow label="Email">{card.senderEmail}</DetailRow>}
                </>
              )}

              <SectionLabel title="RECIPIENT" />
              <DetailRow label="Name">{card.recipientName}</DetailRow>
              <DetailRow label="Email">{card.recipientEmail}</DetailRow>
              {card.recipientType && (
                <DetailRow label="Type">
                  {card.recipientType === "self" ? "Sent to self" : "Sent to someone else"}
                </DetailRow>
              )}

              {card.message && (
                <>
                  <SectionLabel title="MESSAGE" />
                  <div className="border-borderSubtle rounded-xl border bg-white p-4">
                    <p className="font-jakarta text-brand/70 text-sm italic">"{card.message}"</p>
                  </div>
                </>
              )}

              <SectionLabel title="DETAILS" />
              <DetailRow label="Status">
                <StatusBadge label={statusCfg!.label} variant={statusCfg!.variant} dot />
              </DetailRow>
              <DetailRow label="Amount">₦{card.amount.toLocaleString()}</DetailRow>
              <DetailRow label="Created">
                {new Date(card.createdAt).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </DetailRow>
              <DetailRow label="Expires">
                {new Date(card.expiresAt).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </DetailRow>

              {/* Ledger */}
              <div className="flex items-center justify-between">
                <SectionLabel title="TRANSACTION HISTORY" />
                {ledgerData && ledgerData.items.length > 0 && (
                  <Button
                    variant="ghost"
                    size="xs"
                    beforeIcon={<Download size={13} />}
                    loading={exportLedger.isPending}
                    onClick={() => exportLedger.mutate(card.id)}
                    className="w-fit!"
                  >
                    Export
                  </Button>
                )}
              </div>
              {isLoadingLedger && (
                <div className="flex flex-col gap-2">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="bg-brand/5 h-10 animate-pulse rounded-xl" />
                  ))}
                </div>
              )}
              {!isLoadingLedger && ledgerData && ledgerData.items.length === 0 && (
                <p className="font-jakarta text-brand/40 py-4 text-center text-sm">
                  No transactions yet
                </p>
              )}
              {!isLoadingLedger && ledgerData && ledgerData.items.length > 0 && (
                <div className="border-borderSubtle overflow-hidden rounded-xl border bg-white">
                  {ledgerData.items.map((entry, idx) => (
                    <LedgerRow
                      key={entry.id}
                      entry={entry}
                      last={idx === ledgerData.items.length - 1}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </Modal>

      <DeleteConfirmModal
        isOpen={showDeactivateConfirm}
        onClose={() => setShowDeactivateConfirm(false)}
        onConfirm={() => {
          changeStatus.mutate(
            { id: card!.id, payload: { status: "canceled" } },
            {
              onSuccess: () => {
                setShowDeactivateConfirm(false)
                onClose()
              },
            },
          )
        }}
        entityType="gift card"
        entityName={card?.code}
        variant="deactivate"
        isLoading={changeStatus.isPending}
      />

      <DeleteConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={() => {
          deleteCard.mutate(card!.id, {
            onSuccess: () => {
              setShowDeleteConfirm(false)
              onClose()
            },
          })
        }}
        entityType="gift card"
        entityName={card?.code}
        isLoading={deleteCard.isPending}
      />
    </>
  )
}

// ── Sub-components ─────────────────────────────────────────────────────────────

const SectionLabel = ({ title }: { title: string }) => (
  <p className="font-jakarta text-brand/60 mt-1 mb-1 text-sm font-bold tracking-[-0.04em] uppercase">
    {title}
  </p>
)

const DetailRow = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="border-borderSubtle flex items-center justify-between gap-4 border-b py-3">
    <span className="font-jakarta text-brand/50 shrink-0 text-sm">{label}</span>
    <span className="font-jakarta text-brand text-right text-sm font-medium">{children}</span>
  </div>
)

const LedgerRow = ({ entry, last }: { entry: GiftCardLedgerEntry; last: boolean }) => {
  const isCredit = entry.amount > 0
  return (
    <div
      className={`flex items-center justify-between gap-4 px-4 py-3 ${last ? "" : "border-borderSubtle border-b"}`}
    >
      <div className="min-w-0 flex-1">
        <p className="font-jakarta text-brand truncate text-sm font-medium capitalize">
          {(entry.type ?? "").replace(/_/g, " ")}
        </p>
        {entry.comment && (
          <p className="font-jakarta text-brand/50 mt-0.5 truncate text-xs">{entry.comment}</p>
        )}
        <p className="font-jakarta text-brand/40 mt-0.5 text-xs">
          {new Date(entry.createdAt).toLocaleDateString("en-GB", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </p>
      </div>
      <div className="shrink-0 text-right">
        <p
          className={`font-jakarta text-sm font-semibold ${isCredit ? "text-statusSuccess" : "text-danger"}`}
        >
          {isCredit ? "+" : ""}₦{Math.abs(entry.amount).toLocaleString()}
        </p>
        <p className="font-jakarta text-brand/40 mt-0.5 text-xs">
          Bal: ₦{entry.balanceAfter.toLocaleString()}
        </p>
      </div>
    </div>
  )
}
