import type {
  Product,
  ProductLocation,
  ProductMetrics,
  GalleryImage,
  RawProduct,
  RawProductMetrics,
} from "@/types/products"

export function normalizeProduct(raw: unknown): Product {
  const p = raw as RawProduct
  const category = p.categories?.[0]?.name ?? p.category ?? p.category_name ?? ""
  const categoryIds: string[] = p.categories?.length
    ? p.categories.map((c) => String(c.category_id ?? "")).filter(Boolean)
    : []
  const categoryNames: string[] = p.categories?.length
    ? p.categories.map((c) => c.name ?? "").filter(Boolean)
    : category
      ? [category]
      : []
  const locations: ProductLocation[] = (p.locations ?? []).map((l) => ({
    id: l.location_id ?? 0,
    name: l.name ?? "",
    qty: l.qty ?? 0,
  }))
  return {
    id: String(p.id ?? p.product_id ?? ""),
    name: p.name ?? "",
    sku: p.sku ?? "",
    category,
    categoryIds,
    categoryNames,
    price: p.price ?? 0,
    stock: p.stock ?? p.stock_qty ?? 0,
    status: (p.status ?? "active") as Product["status"],
    createdAt: p.createdAt ?? p.created_at ?? "",
    brandName: p.brandName ?? p.brand_name ?? p.brand,
    locations: locations.length ? locations : undefined,
    lowStockAlert: p.lowStockAlert ?? p.low_stock_alert,
    discount: p.discount != null ? parseFloat(String(p.discount)) || undefined : undefined,
    description: p.description,
    ingredients: p.ingredients,
    howToUse: p.howToUse ?? p.how_to_use,
    imageUrl: p.image_url,
    galleryImages: p.gallery_images?.map(
      (g): GalleryImage => ({
        image_id: g.image_id,
        url: g.url,
        is_primary: g.is_primary,
      }),
    ),
  }
}

export function normalizeProductMetrics(raw: unknown): ProductMetrics {
  const m = raw as RawProductMetrics
  return {
    total: m.total ?? m.total_products ?? 0,
    active: m.active ?? m.active_products ?? 0,
    inactive: m.inactive ?? m.inactive_products ?? 0,
    draft: m.draft ?? m.draft_products ?? 0,
    archived: m.archived ?? m.archived_products ?? 0,
  }
}
