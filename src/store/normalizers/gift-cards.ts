import type {
  GiftCard,
  GiftCardLedgerEntry,
  GiftCardMetrics,
  GiftCardStatus,
  RawGiftCard,
  RawGiftCardLedgerEntry,
  RawGiftCardMetrics,
} from "@/types/gift-cards"

function normalizeStatus(raw: string): GiftCardStatus {
  const s = raw.toLowerCase()
  if (s === "active" || s === "redeemed" || s === "expired" || s === "canceled") return s
  return "expired"
}

export function normalizeGiftCard(raw: RawGiftCard): GiftCard {
  return {
    id: String(raw.gift_card_id),
    code: raw.code,
    amount: raw.initial_amount,
    balance: raw.current_balance,
    senderName: raw.sender_name,
    senderEmail: raw.sender_email,
    recipientType: raw.recipient_type,
    recipientName: raw.recipient_name,
    recipientEmail: raw.recipient_email,
    message: raw.message,
    status: normalizeStatus(raw.status),
    usageMode: raw.usage_mode,
    activatedAt: raw.activated_at,
    createdAt: raw.created_at,
    expiresAt: raw.expires_at,
    updatedAt: raw.updated_at,
  }
}

export function normalizeGiftCardMetrics(raw: RawGiftCardMetrics): GiftCardMetrics {
  return {
    total: raw.total_gift_cards ?? 0,
    active: raw.active_gift_cards ?? 0,
    exhausted: raw.exhausted_gift_cards ?? 0,
    expired: raw.expired_gift_cards ?? 0,
    pendingPayment: raw.pending_payment_gift_cards ?? 0,
    totalIssuedValue: raw.total_issued_value ?? 0,
    outstandingBalance: raw.outstanding_balance ?? 0,
  }
}

export function normalizeGiftCardLedgerEntry(raw: RawGiftCardLedgerEntry): GiftCardLedgerEntry {
  return {
    id: String(raw.entry_id),
    type: raw.entry_type ?? "",
    amount: raw.amount ?? 0,
    balanceBefore: raw.balance_before ?? 0,
    balanceAfter: raw.balance_after ?? 0,
    comment: raw.comment,
    createdAt: raw.created_at,
  }
}
