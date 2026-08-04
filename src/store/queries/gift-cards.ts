import { keepPreviousData, useQuery } from "@tanstack/react-query"
import {
  GET_GIFT_CARDS_KEY,
  GET_GIFT_CARD_BY_ID_KEY,
  GET_GIFT_CARD_METRICS_KEY,
  GET_GIFT_CARD_LEDGER_KEY,
} from "../query-keys"
import {
  getGiftCards,
  getGiftCardById,
  getGiftCardMetrics,
  getGiftCardLedger,
} from "../requests/gift-cards"
import type { GetGiftCardsParams, GetGiftCardLedgerParams } from "@/types/gift-cards"

export const useGetGiftCards = (params: GetGiftCardsParams = {}) =>
  useQuery({
    queryKey: [GET_GIFT_CARDS_KEY, params],
    queryFn: () => getGiftCards(params),
    placeholderData: keepPreviousData,
  })

export const useGetGiftCardMetrics = () =>
  useQuery({
    queryKey: [GET_GIFT_CARD_METRICS_KEY],
    queryFn: getGiftCardMetrics,
  })

export const useGetGiftCardById = (id: string | null) =>
  useQuery({
    queryKey: [GET_GIFT_CARD_BY_ID_KEY, id],
    queryFn: () => getGiftCardById(id!),
    enabled: !!id,
  })

export const useGetGiftCardLedger = (id: string | null, params: GetGiftCardLedgerParams = {}) =>
  useQuery({
    queryKey: [GET_GIFT_CARD_LEDGER_KEY, id, params],
    queryFn: () => getGiftCardLedger(id!, params),
    enabled: !!id,
    placeholderData: keepPreviousData,
  })
