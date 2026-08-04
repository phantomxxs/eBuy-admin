import instance from "@/services/axios-instance"
import {
  GIFT_CARDS,
  GIFT_CARD_METRICS,
  GIFT_CARD_BY_ID,
  GIFT_CARD_EXPORT,
  GIFT_CARD_CHANGE_STATUS,
  GIFT_CARD_RESEND_EMAIL,
  GIFT_CARD_LEDGER,
  GIFT_CARD_LEDGER_EXPORT,
} from "@/services/apis"
import {
  normalizeGiftCard,
  normalizeGiftCardMetrics,
  normalizeGiftCardLedgerEntry,
} from "@/store/normalizers/gift-cards"
import type {
  GiftCard,
  GiftCardMetrics,
  GiftCardLedgerEntry,
  GetGiftCardsParams,
  GetGiftCardLedgerParams,
  ChangeGiftCardStatusPayload,
  RawGiftCard,
  RawGiftCardMetrics,
  RawGiftCardLedgerEntry,
} from "@/types/gift-cards"
import type { PaginatedApiResponse } from "@/types/utils"

export const getGiftCards = async (
  params: GetGiftCardsParams = {},
): PaginatedApiResponse<GiftCard> => {
  const response = await instance.get(GIFT_CARDS, {
    params: {
      sortBy: "created_at",
      sortDir: "DESC",
      ...(params.currentPage && { currentPage: params.currentPage }),
      ...(params.pageSize && { pageSize: params.pageSize }),
      ...(params.search && { search: params.search }),
      ...(params.status && { status: params.status }),
    },
  })
  const body = response.data
  return { ...body, items: (body.items ?? []).map(normalizeGiftCard) }
}

export const getGiftCardMetrics = async (): Promise<GiftCardMetrics> => {
  const response = await instance.get(GIFT_CARD_METRICS)
  return normalizeGiftCardMetrics(response.data as RawGiftCardMetrics)
}

export const getGiftCardById = async (id: string): Promise<GiftCard> => {
  const response = await instance.get(GIFT_CARD_BY_ID(id))
  return normalizeGiftCard(response.data as RawGiftCard)
}

export const exportGiftCardsCSV = async (
  params: GetGiftCardsParams = {},
): Promise<{ download_url: string; filename: string }> => {
  const response = await instance.get(GIFT_CARD_EXPORT, {
    params: {
      ...(params.search && { search: params.search }),
      ...(params.status && { status: params.status }),
    },
  })
  return response.data
}

export const changeGiftCardStatus = async (
  id: string,
  payload: ChangeGiftCardStatusPayload,
): Promise<GiftCard> => {
  const response = await instance.put(GIFT_CARD_CHANGE_STATUS(id), payload)
  return normalizeGiftCard(response.data as RawGiftCard)
}

export const resendGiftCardEmail = async (id: string): Promise<null> => {
  await instance.post(GIFT_CARD_RESEND_EMAIL(id))
  return null
}

export const getGiftCardLedger = async (
  id: string,
  params: GetGiftCardLedgerParams = {},
): PaginatedApiResponse<GiftCardLedgerEntry> => {
  const response = await instance.get(GIFT_CARD_LEDGER(id), {
    params: {
      ...(params.currentPage && { currentPage: params.currentPage }),
      ...(params.pageSize && { pageSize: params.pageSize }),
    },
  })
  const body = response.data
  return {
    ...body,
    items: (body.items ?? []).map((e: RawGiftCardLedgerEntry) => normalizeGiftCardLedgerEntry(e)),
  }
}

export const exportGiftCardLedger = async (
  id: string,
): Promise<{ download_url: string; filename: string }> => {
  const response = await instance.get(GIFT_CARD_LEDGER_EXPORT(id))
  return response.data
}

export const deleteGiftCard = async (id: string): Promise<null> => {
  await instance.delete(GIFT_CARD_BY_ID(id))
  return null
}
