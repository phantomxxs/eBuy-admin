import { X, Search, Tag, Loader2 } from "lucide-react"
import { cn, validateField } from "@/lib/utils"
import { formatCurrency } from "@/lib/utils"
import Modal from "@/components/ui/modal"
import Dropdown from "@/components/ui/dropdown"
import FormInput from "@/components/ui/form-input"
import FormTextarea from "@/components/ui/form-textarea"
import { Button } from "@/components/ui/button"
import Pagination from "@/components/ui/pagination"
import LocationSearchInput from "@/components/ui/location-search-input"
import StaffSearchInput from "@/components/ui/staff-search-input"
import CustomerSearchInput from "@/components/ui/customer-search-input"
import { PAYMENT_STATUS, FULFILLMENT_STATUS } from "@/utils/orders"
import { GuestCustomerModal } from "./guest-customer-modal"
import ProductCard from "./product-card"
import CartQtyControl from "./cart-qty-control"
import { useWalkInOrder, PRODUCT_PAGE_SIZE } from "./use-walk-in-order"

// ── Types ──────────────────────────────────────────────────────────────────────

interface WalkInOrderModalProps {
  isOpen: boolean
  onClose: () => void
}

// ── Constants ──────────────────────────────────────────────────────────────────

const PAYMENT_METHODS = [
  { label: "Cash", value: "cash" },
  { label: "POS", value: "pos" },
  { label: "Card", value: "card" },
  { label: "Bank Transfer", value: "bank_transfer" },
]

// ── Main export ────────────────────────────────────────────────────────────────

export default function WalkInOrderModal({ isOpen, onClose }: WalkInOrderModalProps) {
  const {
    form,
    walkInOrderSchema,
    productSearch,
    setProductSearch,
    productPage,
    setProductPage,
    products,
    productTotal,
    cart,
    addToCart,
    updateQty,
    subtotal,
    total,
    isGuestCustomer,
    guestEmail,
    showGuestModal,
    setShowGuestModal,
    clearGuest,
    handleGuestConfirm,
    appliedDiscountCode,
    appliedDiscountName,
    appliedDiscountAmount,
    clearDiscount,
    handleApplyDiscount,
    isValidatingPromo,
    submitErrors,
    clearError,
    handlePlaceOrder,
    handleClose,
    isPending,
  } = useWalkInOrder(onClose)

  const customHeader = (
    <div className="border-borderSubtle flex items-start justify-between border-b px-4 py-4 md:px-6">
      <div>
        <h2 className="font-jakarta text-brand text-base font-semibold">Add new walk-in order</h2>
        <p className="font-jakarta text-brand/50 mt-0.5 text-sm">POS / In-store</p>
      </div>
      <button
        onClick={handleClose}
        className="text-brand/40 hover:text-brand rounded p-1 transition-colors"
        disabled={isPending}
      >
        <X size={16} />
      </button>
    </div>
  )

  const customFooter = (
    <div className="border-borderSubtle flex justify-end border-t px-4 py-4 md:px-6">
      <Button variant="secondary" loading={isPending} onClick={handlePlaceOrder}>
        Place order
      </Button>
    </div>
  )

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={handleClose}
        preventClose={isPending}
        variant="dialog"
        width="810px"
        customHeader={customHeader}
        customFooter={customFooter}
      >
        {/* Two-panel layout: stacks on mobile, side-by-side on desktop */}
        <div
          className="flex flex-col overflow-y-auto lg:flex-row lg:overflow-hidden"
          style={{ maxHeight: "72vh" }}
        >
          {/* ── Left: form + products ─────────────────────────────────────── */}
          <div className="no-scrollbar flex flex-col gap-4 p-4 md:p-6 lg:flex-1 lg:overflow-y-auto">
            {/* Row 1: Order type + Store location */}
            <div className="grid grid-cols-2 gap-3">
              <FormInput label="Order type" value="Walk-in order" disabled />
              <form.Field
                name="storeLocation"
                validators={{
                  onBlur: ({ value }) => validateField(walkInOrderSchema, "storeLocation", value),
                }}
              >
                {(field) => (
                  <LocationSearchInput
                    label="Store location"
                    value={field.state.value}
                    onChange={(v) => {
                      field.handleChange(v)
                      if (submitErrors.storeLocation) clearError("storeLocation")
                    }}
                    onBlur={field.handleBlur}
                    placeholder="Search store…"
                    status="active"
                    walkInOnly
                    error={field.state.meta.errors[0]?.toString() || submitErrors.storeLocation}
                  />
                )}
              </form.Field>
            </div>

            {/* Row 2: Customer + Served by */}
            <div className="grid grid-cols-2 gap-3">
              <form.Field name="customerId">
                {(field) => (
                  <CustomerSearchInput
                    label="Customer"
                    customerType="registered"
                    value={field.state.value}
                    onChange={(v) => {
                      field.handleChange(v)
                      if (v) clearGuest()
                      if (submitErrors.customerId) clearError("customerId")
                    }}
                    onBlur={field.handleBlur}
                    placeholder="Search customer…"
                    guestLabel={isGuestCustomer ? guestEmail : undefined}
                    onGuestClick={() => setShowGuestModal(true)}
                    onClearGuest={() => {
                      clearGuest()
                      if (submitErrors.customerId) clearError("customerId")
                    }}
                    error={submitErrors.customerId}
                  />
                )}
              </form.Field>
              <form.Field
                name="servedBy"
                validators={{
                  onBlur: ({ value }) => validateField(walkInOrderSchema, "servedBy", value),
                }}
              >
                {(field) => (
                  <StaffSearchInput
                    label="Served by"
                    value={field.state.value}
                    onChange={(v) => {
                      field.handleChange(v)
                      if (submitErrors.servedBy) clearError("servedBy")
                    }}
                    onBlur={field.handleBlur}
                    placeholder="Search staff…"
                    status="active"
                    error={field.state.meta.errors[0]?.toString() || submitErrors.servedBy}
                  />
                )}
              </form.Field>
            </div>

            {/* Order notes */}
            <form.Field name="orderNotes">
              {(field) => (
                <FormTextarea
                  label="Order notes"
                  value={field.state.value}
                  onChange={field.handleChange}
                  placeholder="e.g. special packaging, gift wrapping"
                  rows={3}
                />
              )}
            </form.Field>

            {/* Products section */}
            <div className="border-borderSubtle border-t pt-4">
              <p className="font-jakarta text-brand/60 mb-3 text-xs font-bold tracking-widest uppercase">
                Products — Click to add
              </p>

              {/* Product search */}
              <div className="border-borderSubtle mb-4 flex h-9 items-center gap-2 rounded-full border bg-white px-3">
                <Search size={12} className="text-brand/40 shrink-0" />
                <input
                  type="text"
                  value={productSearch}
                  onChange={(e) => {
                    setProductSearch(e.target.value)
                    setProductPage(1)
                  }}
                  placeholder="Search by name or SKU"
                  className="font-jakarta text-brand placeholder:text-brand/40 w-full bg-transparent text-xs focus:outline-none"
                />
                {productSearch && (
                  <button
                    type="button"
                    onClick={() => {
                      setProductSearch("")
                      setProductPage(1)
                    }}
                    className="text-brand/40 hover:text-brand/70 shrink-0 transition-colors"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>

              {/* Product grid */}
              {products.length === 0 ? (
                <p className="font-jakarta text-brand/40 py-8 text-center text-sm">
                  {productSearch ? `No products match "${productSearch}"` : "No products available"}
                </p>
              ) : (
                <div
                  className="grid gap-3"
                  style={{ gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))" }}
                >
                  {products.map((product) => {
                    const cartItem = cart.find((c) => c.productId === parseInt(product.id))
                    return (
                      <ProductCard
                        key={product.id}
                        product={product}
                        cartItem={cartItem}
                        onAdd={() => addToCart(product)}
                        onDecrement={() => updateQty(parseInt(product.id), -1)}
                        onIncrement={() => updateQty(parseInt(product.id), 1)}
                      />
                    )
                  })}
                </div>
              )}

              <Pagination
                page={productPage}
                totalPages={Math.ceil(productTotal / PRODUCT_PAGE_SIZE)}
                onPage={setProductPage}
                className="mt-3"
              />
            </div>
          </div>

          {/* Mobile divider */}
          <div className="border-borderSubtle border-t lg:hidden" />

          {/* ── Right: Cart + Payment ──────────────────────────────────────── */}
          <div className="border-borderSubtle bg-brand/0.5 flex flex-col p-4 lg:w-[288px] lg:shrink-0 lg:overflow-y-auto lg:border-l lg:px-4 lg:pt-3 lg:pb-4">
            <p className="font-jakarta text-brand/60 mb-3 text-xs font-bold tracking-widest uppercase">
              Cart
            </p>

            {/* Cart items */}
            {cart.length === 0 ? (
              <p
                className={cn(
                  "font-jakarta py-6 text-center text-sm",
                  submitErrors.cart ? "text-danger" : "text-brand/40",
                )}
              >
                {submitErrors.cart ?? "Cart is empty"}
              </p>
            ) : (
              <div className="flex flex-col gap-2">
                {cart.map((item) => (
                  <div key={item.productId} className="flex items-center gap-2">
                    <div className="bg-blush/30 h-9 w-9 shrink-0 overflow-hidden rounded-sm">
                      {item.imageUrl && (
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="h-full w-full object-cover"
                        />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-jakarta text-brand truncate text-xs leading-tight font-semibold">
                        {item.name}
                      </p>
                      <p className="font-jakarta text-secondary text-xs font-bold tracking-tight">
                        {formatCurrency(item.price)}
                      </p>
                      {item.originalPrice && (
                        <p className="font-jakarta text-brand/40 text-xs line-through">
                          {formatCurrency(item.originalPrice)}
                        </p>
                      )}
                    </div>
                    <CartQtyControl
                      qty={item.qty}
                      onDecrement={() => updateQty(item.productId, -1)}
                      onIncrement={() => updateQty(item.productId, 1)}
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Discount code */}
            <form.Field name="discountCode">
              {(field) => (
                <div className="border-line mt-3 flex h-9 items-center gap-1.5 rounded border px-2">
                  <Tag size={10} className="text-brand/40 shrink-0" />
                  <input
                    type="text"
                    value={field.state.value}
                    onChange={(e) => {
                      field.handleChange(e.target.value)
                      if (appliedDiscountCode) clearDiscount()
                    }}
                    onKeyDown={(e) => e.key === "Enter" && handleApplyDiscount()}
                    placeholder="Enter discount code"
                    disabled={!!appliedDiscountCode}
                    className="font-jakarta text-brand placeholder:text-brand/40 w-full bg-transparent text-xs focus:outline-none disabled:opacity-60"
                  />
                  {appliedDiscountCode ? (
                    <button
                      type="button"
                      onClick={clearDiscount}
                      className="text-brand/40 hover:text-brand/70 shrink-0 transition-colors"
                    >
                      <X size={12} />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleApplyDiscount}
                      disabled={!field.state.value.trim() || isValidatingPromo}
                      className="bg-blush/60 font-jakarta text-brand/70 hover:bg-blush shrink-0 rounded-full px-3 py-1 text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {isValidatingPromo ? <Loader2 size={10} className="animate-spin" /> : "Apply"}
                    </button>
                  )}
                </div>
              )}
            </form.Field>

            {/* Applied discount badge */}
            {appliedDiscountCode && (
              <div className="bg-statusSuccessBg mt-1.5 flex items-center justify-between rounded px-2 py-1">
                <span className="font-jakarta text-statusSuccess text-xs font-medium">
                  {appliedDiscountName}
                </span>
                <span className="font-jakarta text-statusSuccess text-xs font-bold tracking-tight">
                  -{formatCurrency(appliedDiscountAmount)}
                </span>
              </div>
            )}

            {/* Order summary */}
            {cart.length > 0 && (
              <div className="border-borderSubtle mt-3 border-t">
                <div className="border-line flex justify-between border-b py-2">
                  <span className="font-jakarta text-brand/60 text-xs">Subtotal</span>
                  <span className="font-jakarta text-brand/60 text-xs tracking-tight">
                    {formatCurrency(subtotal)}
                  </span>
                </div>
                {appliedDiscountAmount > 0 && (
                  <div className="border-line flex justify-between border-b py-2">
                    <span className="font-jakarta text-statusSuccess text-xs">Discount</span>
                    <span className="font-jakarta text-statusSuccess text-xs font-bold tracking-tight">
                      -{formatCurrency(appliedDiscountAmount)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between py-2">
                  <span className="font-jakarta text-brand/60 text-xs font-semibold">Total</span>
                  <span className="font-jakarta text-brand/60 text-xs font-semibold tracking-tight">
                    {formatCurrency(total)}
                  </span>
                </div>
              </div>
            )}

            {/* Payment method */}
            <div className="mt-4">
              <p
                className={cn(
                  "font-jakarta mb-2 text-xs font-bold tracking-widest uppercase",
                  submitErrors.paymentMethod ? "text-danger" : "text-brand/60",
                )}
              >
                Payment method
              </p>
              <form.Field name="paymentMethod">
                {(field) => (
                  <>
                    <div className="grid grid-cols-2 gap-1.5">
                      {PAYMENT_METHODS.map((method) => (
                        <button
                          key={method.value}
                          type="button"
                          onClick={() => {
                            field.handleChange(method.value)
                            if (submitErrors.paymentMethod) clearError("paymentMethod")
                          }}
                          className={cn(
                            "font-jakarta h-9 rounded border text-xs font-semibold transition-colors",
                            field.state.value === method.value
                              ? "border-secondary text-secondary"
                              : submitErrors.paymentMethod
                                ? "border-danger/40 text-brand/60 hover:bg-brand/2"
                                : "border-line text-brand/60 hover:bg-brand/2",
                          )}
                        >
                          {method.label}
                        </button>
                      ))}
                    </div>
                    {submitErrors.paymentMethod && (
                      <p className="font-jakarta text-danger mt-1 text-xs">
                        {submitErrors.paymentMethod}
                      </p>
                    )}
                  </>
                )}
              </form.Field>
            </div>

            {/* Status dropdowns */}
            <div className="mt-3 flex flex-col gap-3">
              <form.Field
                name="paymentStatus"
                validators={{
                  onBlur: ({ value }) => validateField(walkInOrderSchema, "paymentStatus", value),
                }}
              >
                {(field) => (
                  <Dropdown
                    label="Payment status"
                    value={field.state.value}
                    onChange={(v) => {
                      field.handleChange(v)
                      if (submitErrors.paymentStatus) clearError("paymentStatus")
                    }}
                    placeholder="Select status"
                    options={[
                      { label: "Paid", value: PAYMENT_STATUS.PAID },
                      { label: "Pending", value: PAYMENT_STATUS.PENDING },
                      { label: "Unpaid", value: PAYMENT_STATUS.UNPAID },
                    ]}
                    error={field.state.meta.errors[0]?.toString() || submitErrors.paymentStatus}
                  />
                )}
              </form.Field>
              <form.Field name="fulfillmentStatus">
                {(field) => (
                  <Dropdown
                    label="Fulfillment status"
                    value={field.state.value}
                    onChange={field.handleChange}
                    placeholder="Select status"
                    options={[
                      { label: "Processing", value: FULFILLMENT_STATUS.PROCESSING },
                      { label: "Unfulfilled", value: FULFILLMENT_STATUS.UNFULFILLED },
                      { label: "Fulfilled", value: FULFILLMENT_STATUS.FULFILLED },
                    ]}
                  />
                )}
              </form.Field>
            </div>
          </div>
        </div>
      </Modal>

      <GuestCustomerModal
        isOpen={showGuestModal}
        onClose={() => setShowGuestModal(false)}
        onConfirm={handleGuestConfirm}
      />
    </>
  )
}
