export type ProductStatus = "active" | "inactive" | "draft" | "archived"

export interface GetProductsParams {
  pageSize?: number | "all"
  currentPage?: number
  search?: string
  category?: string
  status?: string
  locationId?: string
  stockStatus?: string
  priceMin?: number
  priceMax?: number
  dateFrom?: string
  dateTo?: string
  brand?: string
}

// ── Domain types ──────────────────────────────────────────────────────────────

export interface ProductLocation {
  id: number
  name: string
  qty: number
}

// ── Raw API shapes (as returned by the server before normalization) ────────────

export interface RawProductCategory {
  category_id?: number
  name?: string
  product_count?: number
}

export interface RawProductLocation {
  location_id?: number
  name?: string
  qty?: number
}

export interface RawProductActivity {
  date?: string
  activity?: string
  by?: string
}

export interface RawProduct {
  id?: string
  product_id?: number | string
  name?: string
  sku?: string
  category?: string
  category_name?: string
  categories?: RawProductCategory[]
  price?: number
  stock?: number
  stock_qty?: number
  status?: string
  created_at?: string
  createdAt?: string
  brand_name?: string
  brand?: string
  brandName?: string
  locations?: RawProductLocation[]
  low_stock_alert?: number
  lowStockAlert?: number
  discount?: number | string
  weight?: number
  description?: string
  ingredients?: string
  how_to_use?: string
  howToUse?: string
  recent_activity?: RawProductActivity[]
  updated_at?: string
  image_url?: string
  gallery_images?: GalleryImage[]
}

export interface RawProductMetrics {
  total?: number
  total_products?: number
  active?: number
  active_products?: number
  inactive?: number
  inactive_products?: number
  draft?: number
  draft_products?: number
  archived?: number
  archived_products?: number
}

export interface Product {
  id: string
  name: string
  sku: string
  category: string
  categoryIds: string[]
  categoryNames: string[]
  price: number
  stock: number
  status: ProductStatus
  createdAt: string
  brandName?: string
  locations?: ProductLocation[]
  lowStockAlert?: number
  discount?: number
  description?: string
  ingredients?: string
  howToUse?: string
  weight?: number
  imageUrl?: string
  galleryImages?: GalleryImage[]
}

export interface ProductMetrics {
  total: number
  active: number
  inactive: number
  draft: number
  archived: number
}

export interface CreateProductPayload {
  name: string
  price: number
  categoryIds: number[]
  brand: string
  stockQty: number
  lowStockAlert: number
  discount?: number
  description: string
  ingredients: string
  howToUse: string
  weight?: number
  status: string
  locationIds: number[]
}

export interface UpdateProductPayload {
  name?: string
  brandName?: string
  sku?: string
  price?: number
  categoryIds?: number[]
  stockQty?: number
  lowStockAlert?: number
  locationIds?: number[]
  discount?: number
  description?: string
  ingredients?: string
  howToUse?: string
  weight?: number
  status?: ProductStatus
}

export interface UpdateProductStatusPayload {
  status: ProductStatus
}

export interface UpdateProductInventoryItem {
  location_id: number
  qty: number
}

export interface UpdateProductInventoryPayload {
  items: UpdateProductInventoryItem[]
}

export interface ProductActivityLog {
  date?: Date
  activity?: string
  by?: string
}

export interface ProductExportResult {
  download_url: string
  filename: string
  total_rows: number
}

export interface BulkUploadError {
  row: number
  message: string
}

export interface BulkUploadResult {
  total_rows: number
  created: number
  skipped: number
  errors: BulkUploadError[]
}

export interface GalleryImage {
  image_id: string | number
  url?: string
  is_primary?: boolean
}

export interface ProductImagesResult {
  product_id?: string | number
  gallery_images: GalleryImage[]
}

export interface AddProductImagesPayload {
  productId: string
  images: File[]
  makePrimary?: boolean
}

export interface RemoveProductImagePayload {
  productId: string
  imageId: string
}

// ── Master Catalog ─────────────────────────────────────────────────────────────

export interface MasterCatalogProduct {
  id: number
  name: string
  sku?: string
  brand?: string
  brandName?: string
  category?: string
  categoryId?: number
  description?: string
  ingredients?: string[]
  howToUse?: string
  sizeVolume?: string
  weight?: number
  imageUrl?: string
  galleryImages?: string[]
  alreadyInInventory?: boolean
}

export interface MasterCatalogSearchParams {
  search?: string
  pageSize?: number
  currentPage?: number
  categoryId?: number
  brandId?: number
  sortBy?: string
  sortOrder?: string
}

export interface ImportFromMasterCatalogPayload {
  masterProductId: number
  price: number
  stockQty: number
  locationIds: number[]
  categoryIds: number[]
  sku?: string
  lowStockAlert?: number
  discount?: number
  status?: string
  allLocations?: boolean
  allCategories?: boolean
}

export interface MasterCatalogImportResult {
  product_id?: number | string
  job_id?: string
  message?: string
}
