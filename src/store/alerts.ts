import { create } from "zustand"

export type AlertVariant = "success" | "error" | "warning" | "info"

export interface AlertItem {
  id: string
  variant: AlertVariant
  message: string
  title?: string
  /** Auto-dismiss duration in ms. Defaults to 4000. Pass 0 to persist until dismissed. */
  duration?: number
}

interface AlertStore {
  alerts: AlertItem[]
  add: (item: Omit<AlertItem, "id">) => void
  dismiss: (id: string) => void
}

export const useAlertStore = create<AlertStore>((set) => ({
  alerts: [],
  add: (item) =>
    set((s) => ({
      alerts: [...s.alerts, { ...item, id: Math.random().toString(36).slice(2, 10) }],
    })),
  dismiss: (id) => set((s) => ({ alerts: s.alerts.filter((a) => a.id !== id) })),
}))

/**
 * Imperative helper — call this anywhere (inside or outside React components)
 * to show a global alert notification.
 *
 * @example
 * showAlert({ variant: "success", message: "Staff member created" })
 * showAlert({ variant: "error",   message: "Something went wrong", duration: 0 })
 */
export function showAlert(item: Omit<AlertItem, "id">) {
  useAlertStore.getState().add(item)
}
