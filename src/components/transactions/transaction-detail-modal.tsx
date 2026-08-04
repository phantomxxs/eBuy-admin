import type { ReactNode } from "react"
import { Download, X } from "lucide-react"
import { cn, formatCurrency } from "@/lib/utils"
import Modal from "@/components/ui/modal"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/ui/data-table"
import type { TransactionDetail } from "@/types/transactions"
import {
  METHOD_COLORS,
  TYPE_COLORS,
  transactionStatusConfig,
} from "@/components/table-columns/transactions"
import { useGetTransactionByRef } from "@/store/queries/transactions"
import { useDownloadTransactionReceipt } from "@/store/mutations/transactions"

interface TransactionDetailModalProps {
  open: boolean
  onClose: () => void
  trxRef: string | null
}

export default function TransactionDetailModal({
  open,
  onClose,
  trxRef,
}: TransactionDetailModalProps) {
  const { data: tx, isLoading } = useGetTransactionByRef(trxRef)
  const downloadReceipt = useDownloadTransactionReceipt()

  const statusCfg = tx ? transactionStatusConfig[tx.status] : null
  const methodClass = tx ? (METHOD_COLORS[tx.method] ?? "bg-gray-50 text-gray-600") : ""
  const typeClass = tx ? (TYPE_COLORS[tx.type] ?? "bg-gray-50 text-gray-600") : ""

  const customHeader = (
    <div className="border-borderSubtle flex items-center justify-between border-b px-6 py-5">
      <div className="flex flex-1 items-center gap-3 pl-4">
        <span className="font-jakarta text-brand text-base font-semibold tracking-[-0.04em]">
          {tx ? `Transaction #${tx.transactionRef}` : "Transaction Detail"}
        </span>
        {statusCfg && (
          <StatusBadge
            label={statusCfg.label}
            variant={statusCfg.variant as "success" | "warning" | "neutral" | "default"}
            dot
          />
        )}
      </div>
    </div>
  )

  const customFooter = (
    <div className="border-borderSubtle border-t px-6 py-5">
      <Button
        variant="outline"
        className="w-full"
        beforeIcon={<Download size={14} />}
        loading={downloadReceipt.isPending}
        disabled={!tx}
        onClick={() => trxRef && downloadReceipt.mutate(trxRef)}
      >
        Download receipt
      </Button>
    </div>
  )

  return (
    <Modal
      isOpen={open}
      onClose={onClose}
      variant="drawer"
      position="right"
      customHeader={customHeader}
      customFooter={customFooter}
      width="652px"
    >
      {isLoading ? (
        <div className="space-y-3 px-6 py-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-brand/5 h-10 animate-pulse rounded-lg" />
          ))}
        </div>
      ) : tx ? (
        <TransactionBody
          tx={tx}
          methodClass={methodClass}
          typeClass={typeClass}
          statusCfg={statusCfg}
        />
      ) : (
        <div className="flex items-center justify-center py-16">
          <p className="font-jakarta text-brand/40 text-sm">Transaction not found.</p>
        </div>
      )}
    </Modal>
  )
}

// ── Sub-components ──────────────────────────────────────────────────────────

interface TransactionBodyProps {
  tx: TransactionDetail
  methodClass: string
  typeClass: string
  statusCfg: { label: string; variant: string } | null
}

const TransactionBody = ({ tx, methodClass, typeClass, statusCfg }: TransactionBodyProps) => (
  <div className="space-y-6 px-6 py-6">
    <section>
      <SectionTitle>Transaction Information</SectionTitle>
      <div className="border-borderSubtle mt-3 overflow-hidden rounded-xl border">
        <InfoRow label="Transaction ref">
          <span className="text-brand/70 font-mono text-xs">{tx.transactionRef}</span>
        </InfoRow>
        <InfoRow label="Order ID">
          <span className="font-jakarta text-primary cursor-pointer text-sm font-semibold hover:underline">
            #{tx.orderNumber}
          </span>
        </InfoRow>
        <InfoRow label="Customer">
          <div className="flex items-center gap-2">
            <div className="bg-primary/15 font-jakarta text-primary flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold">
              {tx.customerName
                .split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)}
            </div>
            <span className="font-jakarta text-brand text-sm font-medium">{tx.customerName}</span>
          </div>
        </InfoRow>
        <InfoRow label="Type">
          <span
            className={cn(
              "font-jakarta rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap",
              typeClass,
            )}
          >
            {tx.type}
          </span>
        </InfoRow>
        <InfoRow label="Method">
          <span
            className={cn(
              "font-jakarta rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap",
              methodClass,
            )}
          >
            {tx.method}
          </span>
        </InfoRow>
        <InfoRow label="Amount">
          <span className="font-jakarta text-brand text-sm font-bold">
            {formatCurrency(tx.amount)}
          </span>
        </InfoRow>
        <InfoRow label="Currency">
          <span className="font-jakarta text-brand/70 text-sm">{tx.currency}</span>
        </InfoRow>
        <InfoRow label="Date">
          <span className="font-jakarta text-brand/70 text-sm">{tx.createdAt}</span>
        </InfoRow>
        <InfoRow label="Status" isLast>
          {statusCfg && (
            <StatusBadge
              label={statusCfg.label}
              variant={statusCfg.variant as "success" | "warning" | "neutral" | "default"}
              dot
            />
          )}
        </InfoRow>
      </div>
    </section>

    {tx.paymentReference && (
      <section>
        <SectionTitle>Payment Details</SectionTitle>
        <div className="border-borderSubtle mt-3 overflow-hidden rounded-xl border">
          <InfoRow label="Payment reference" isLast>
            <span className="text-brand/70 font-mono text-xs">{tx.paymentReference}</span>
          </InfoRow>
        </div>
      </section>
    )}
  </div>
)

const SectionTitle = ({ children }: { children: ReactNode }) => (
  <p className="font-jakarta text-brand/40 text-xs font-bold tracking-widest uppercase">
    {children}
  </p>
)

interface InfoRowProps {
  label: string
  children: ReactNode
  isLast?: boolean
}

const InfoRow = ({ label, children, isLast }: InfoRowProps) => (
  <div
    className={cn(
      "flex items-center justify-between px-4 py-3.5",
      !isLast && "border-borderSubtle border-b",
    )}
  >
    <span className="font-jakarta text-brand/50 text-xs font-semibold">{label}</span>
    <div className="flex items-center">{children}</div>
  </div>
)
