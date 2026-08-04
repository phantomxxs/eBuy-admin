import type { InventoryItem, InventoryMetrics } from "@/types/inventory"
import raw from "./inventory.json"

export const mockInventory: InventoryItem[] = raw.data as InventoryItem[]
export const mockInventoryMetrics: InventoryMetrics = raw.metrics
