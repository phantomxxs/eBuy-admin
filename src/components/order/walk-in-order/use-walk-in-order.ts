import { useState } from "react"
import { useStore } from "@tanstack/react-store"
import { useForm } from "@tanstack/react-form"
import { formatCurrency, validateField } from "@/lib/utils"
import { useDebounce } from "@/hooks/useDebounce"
import { useCreateWalkInOrder } from "@/store/mutations/orders"
import { useValidateDiscountCode } from "@/store/mutations/discounts"
import { useGetProducts } from "@/store/queries/products"
import { useUserStore } from "@/store/user"
import { showAlert } from "@/store/alerts"
import { walkInOrderSchema, type WalkInOrderFormValues } from "@/validations/orders"
import type { GuestCustomerFormValues } from "@/validations/orders"
import type { Product } from "@/types/products"
import type { WalkInCartItem } from "@/types/orders"
import type { DiscountDetail } from "@/types/discounts"

export const PRODUCT_PAGE_SIZE = 9

function computeDiscount(discount: DiscountDetail, subtotal: number): number {
  if (discount.discountType === "percentage_off")
    return Math.round(subtotal * (discount.discountValue / 100))
  if (discount.discountType === "fixed_amount") return Math.min(discount.discountValue, subtotal)
  return 0
}

export function useWalkInOrder(onClose: () => void) {
  const currentUser = useUserStore((s) => s.user)
  const [productSearch, setProductSearch] = useState("")
  const [productPage, setProductPage] = useState(1)
  const [showGuestModal, setShowGuestModal] = useState(false)
  const [submitErrors, setSubmitErrors] = useState<Record<string, string>>({})
  const debouncedSearch = useDebounce(productSearch)

  const createWalkInOrder = useCreateWalkInOrder()
  const validateDiscount = useValidateDiscountCode()

  const { data: productsData } = useGetProducts({
    status: "active",
    search: debouncedSearch,
    pageSize: PRODUCT_PAGE_SIZE,
    currentPage: productPage,
  })
  const products = productsData?.items ?? []
  const productTotal = productsData?.total_count ?? 0

  const form = useForm({
    defaultValues: {
      storeLocation: "",
      customerId: "",
      servedBy: currentUser ? String(currentUser.user_id) : "",
      orderNotes: "",
      paymentMethod: "",
      paymentStatus: "",
      fulfillmentStatus: "",
      discountCode: "",
      isGuestCustomer: false as boolean,
      guestFirstName: "",
      guestLastName: "",
      guestPhone: "",
      guestEmail: "",
      appliedDiscountId: "",
      appliedDiscountCode: "",
      appliedDiscountName: "",
      appliedDiscountAmount: 0 as number,
      cart: [] as WalkInCartItem[],
    } satisfies WalkInOrderFormValues & { cart: WalkInCartItem[] },
    onSubmit: ({ value }) => {
      createWalkInOrder.mutate(
        {
          storeLocationId: parseInt(value.storeLocation),
          servedBy: value.servedBy,
          paymentMethod: value.paymentMethod,
          paymentStatus: value.paymentStatus,
          fulfillmentStatus: value.fulfillmentStatus || undefined,
          items: value.cart.map((c) => ({ productId: c.productId, qty: c.qty })),
          orderNotes: value.orderNotes || undefined,
          customerId: value.customerId || undefined,
          discountId: value.appliedDiscountId || undefined,
          guestFirstname: value.guestFirstName,
          guestLastname: value.guestLastName,
          guestEmail: value.guestEmail || undefined,
          guestPhoneNumber: value.guestPhone || undefined,
        },
        {
          onSuccess: () => {
            showAlert({ variant: "success", message: "Walk-in order placed successfully" })
            handleClose()
          },
          onError: (error) => showAlert({ variant: "error", message: error.message }),
        },
      )
    },
  })

  // ── Derived state ────────────────────────────────────────────────────────────

  const cart = useStore(form.store, (s) => s.values.cart)
  const isGuestCustomer = useStore(form.store, (s) => s.values.isGuestCustomer)
  const guestEmail = useStore(form.store, (s) => s.values.guestEmail)
  const appliedDiscountCode = useStore(form.store, (s) => s.values.appliedDiscountCode)
  const appliedDiscountName = useStore(form.store, (s) => s.values.appliedDiscountName)
  const appliedDiscountAmount = useStore(form.store, (s) => s.values.appliedDiscountAmount)

  const subtotal = cart.reduce((sum: number, c) => sum + c.price * c.qty, 0)
  const total = subtotal - appliedDiscountAmount

  // ── Handlers ─────────────────────────────────────────────────────────────────

  const clearError = (key: string) => setSubmitErrors((e) => ({ ...e, [key]: "" }))

  const handleClose = () => {
    form.reset()
    setProductSearch("")
    setProductPage(1)
    setShowGuestModal(false)
    setSubmitErrors({})
    onClose()
  }

  const clearGuest = () => {
    form.setFieldValue("isGuestCustomer", false)
    form.setFieldValue("guestFirstName", "")
    form.setFieldValue("guestLastName", "")
    form.setFieldValue("guestEmail", "")
    form.setFieldValue("guestPhone", "")
  }

  const handleGuestConfirm = (info: GuestCustomerFormValues) => {
    form.setFieldValue("isGuestCustomer", true)
    form.setFieldValue("guestFirstName", info.guestFirstName)
    form.setFieldValue("guestLastName", info.guestLastName)
    form.setFieldValue("guestEmail", info.guestEmail)
    form.setFieldValue("guestPhone", info.guestPhone)
    form.setFieldValue("customerId", "")
    if (submitErrors.customerId) clearError("customerId")
    setShowGuestModal(false)
  }

  const addToCart = (product: Product) => {
    if (submitErrors.cart) clearError("cart")
    const current = form.getFieldValue("cart")
    const productId = parseInt(product.id)
    const existing = current.find((c) => c.productId === productId)
    if (existing) {
      form.setFieldValue(
        "cart",
        current.map((c) => (c.productId === productId ? { ...c, qty: c.qty + 1 } : c)),
      )
    } else {
      const discountAmt = typeof product.discount === "number" ? product.discount : 0
      const effectivePrice = Math.max(0, product.price - discountAmt)
      const originalPrice = discountAmt > 0 ? product.price : undefined
      form.setFieldValue("cart", [
        ...current,
        {
          productId,
          name: product.name,
          price: effectivePrice,
          originalPrice,
          qty: 1,
          imageUrl: product.imageUrl,
        },
      ])
    }
  }

  const updateQty = (productId: number, delta: number) => {
    const current = form.getFieldValue("cart")
    form.setFieldValue(
      "cart",
      current
        .map((c) => (c.productId === productId ? { ...c, qty: c.qty + delta } : c))
        .filter((c) => c.qty > 0),
    )
  }

  const clearDiscount = () => {
    form.setFieldValue("appliedDiscountId", "")
    form.setFieldValue("appliedDiscountCode", "")
    form.setFieldValue("appliedDiscountName", "")
    form.setFieldValue("appliedDiscountAmount", 0)
  }

  const handleApplyDiscount = () => {
    const code = form.getFieldValue("discountCode").trim()
    if (!code) return
    validateDiscount.mutate(code, {
      onSuccess: (discount) => {
        if (discount.status !== "active") {
          showAlert({ variant: "error", message: "This discounttion is not currently active" })
          return
        }
        const amount = computeDiscount(discount, subtotal)
        if (amount === 0) {
          showAlert({
            variant: "error",
            message: "This discounttion does not apply to the current cart",
          })
          return
        }
        form.setFieldValue("appliedDiscountId", discount.id)
        form.setFieldValue("appliedDiscountCode", code)
        form.setFieldValue("appliedDiscountName", discount.name)
        form.setFieldValue("appliedDiscountAmount", amount)
        showAlert({
          variant: "success",
          message: `"${discount.name}" applied — ${formatCurrency(amount)} off`,
        })
      },
      onError: () => showAlert({ variant: "error", message: "Invalid or expired discount code" }),
    })
  }

  const handlePlaceOrder = () => {
    const v = form.state.values
    const errors: Record<string, string> = {}
    if (!v.storeLocation) errors.storeLocation = "Store location is required"
    if (!v.customerId && !v.guestEmail) errors.customerId = "Select a customer or add a guest"
    if (!v.servedBy) errors.servedBy = "Please select who is serving this order"
    if (!cart.length) errors.cart = "Add at least one product to the cart"
    if (!v.paymentMethod) errors.paymentMethod = "Please select a payment method"
    if (!v.paymentStatus) errors.paymentStatus = "Payment status is required"
    if (Object.keys(errors).length) {
      setSubmitErrors(errors)
      return
    }
    form.handleSubmit()
  }

  return {
    // form
    form,
    walkInOrderSchema,
    validateField,
    // product search
    productSearch,
    setProductSearch,
    productPage,
    setProductPage,
    products,
    productTotal,
    // cart
    cart,
    addToCart,
    updateQty,
    subtotal,
    total,
    // guest
    isGuestCustomer,
    guestEmail,
    showGuestModal,
    setShowGuestModal,
    clearGuest,
    handleGuestConfirm,
    // discount
    appliedDiscountCode,
    appliedDiscountName,
    appliedDiscountAmount,
    clearDiscount,
    handleApplyDiscount,
    isValidatingDiscount: validateDiscount.isPending,
    // submit
    submitErrors,
    clearError,
    handlePlaceOrder,
    handleClose,
    isPending: createWalkInOrder.isPending,
  }
}
