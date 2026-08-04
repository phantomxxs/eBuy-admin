// ── Status types ───────────────────────────────────────────────────────────────

export type GiftCardStatus = "active" | "redeemed" | "expired" | "canceled"

// ── Raw API shapes ─────────────────────────────────────────────────────────────

export interface RawGiftCard {
  gift_card_id: number
  code: string
  status: string
  usage_mode?: string
  initial_amount: number
  current_balance: number
  currency_code?: string
  sender_name?: string
  sender_email?: string
  recipient_type?: string
  recipient_name: string
  recipient_email: string
  message?: string
  activated_at?: string
  expires_at: string
  created_at: string
  updated_at?: string
}

export interface RawGiftCardMetrics {
  total_gift_cards: number
  active_gift_cards: number
  exhausted_gift_cards: number
  expired_gift_cards: number
  pending_payment_gift_cards: number
  total_issued_value: number
  outstanding_balance: number
}

// ── Normalized domain types ────────────────────────────────────────────────────

export interface GiftCard {
  id: string
  code: string
  amount: number
  balance: number
  senderName?: string
  senderEmail?: string
  recipientType?: string
  recipientName: string
  recipientEmail: string
  message?: string
  status: GiftCardStatus
  usageMode?: string
  activatedAt?: string
  createdAt: string
  expiresAt: string
  updatedAt?: string
}

export interface GiftCardMetrics {
  total: number
  active: number
  exhausted: number
  expired: number
  pendingPayment: number
  totalIssuedValue: number
  outstandingBalance: number
}

// ── Query params ───────────────────────────────────────────────────────────────

export interface GetGiftCardsParams {
  search?: string
  status?: string
  currentPage?: number
  pageSize?: number
}

export type GiftCardStatusChange = "active" | "canceled"

export interface ChangeGiftCardStatusPayload {
  status: GiftCardStatusChange
}

export interface RawGiftCardLedgerEntry {
  entry_id: number
  gift_card_id: number
  entry_type: string
  amount: number
  balance_before: number
  balance_after: number
  comment?: string
  created_at: string
}

export interface GiftCardLedgerEntry {
  id: string
  type: string
  amount: number
  balanceBefore: number
  balanceAfter: number
  comment?: string
  createdAt: string
}

export interface GetGiftCardLedgerParams {
  currentPage?: number
  pageSize?: number
}
