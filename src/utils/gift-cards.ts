export const GIFT_CARD_TAB = {
  GIFT_CARDS: "Gift cards",
  LEDGER: "Ledger",
} as const

export type GiftCardTab = (typeof GIFT_CARD_TAB)[keyof typeof GIFT_CARD_TAB]
