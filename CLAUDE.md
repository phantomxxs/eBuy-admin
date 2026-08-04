# eBuy Admin UI – Claude Code Guide

## Data Fetching Pattern

Every feature that fetches or mutates data follows this 4-step chain, in order:

```
/types/<feature>.ts
  → /mock-data/<feature>.ts
    → /store/requests/<feature>.ts
      → /store/queries/<feature>.ts   (useQuery hooks)
        /store/mutations/<feature>.ts (useMutation hooks)
        → consumed in component via custom hook
```

---

### 1. Type (`/src/types/<feature>.ts`)

Define the shape of the resource as a TypeScript interface.

```ts
// src/types/promotions.ts
export interface Promotion {
  id: string
  label: string
  cta?: string
  ctaArrow?: boolean
  ctaUrl?: string
}
```

---

### 2. Mock data (`/src/mock-data/<feature>.ts`)

Import the type and export a typed array of mock records.

```ts
// src/mock-data/promotions.ts
import type { Promotion } from "@/types/promotions"

export const mockPromotions: Promotion[] = [
  { id: "1", label: "FREE DELIVERY ON ORDERS OVER ₦25,000", cta: "SHOP NOW", ctaArrow: true },
]
```

---

### 3. Network request (`/src/store/requests/<feature>.ts`)

- Import `instance` from `@/services/axios-instance`
- Import the API path constant from `@/services/apis`
- Return `response.data` directly — do not wrap it in a `{ data, message, status, type, url }` envelope
- If the response needs normalization, pass it through a normalizer from `src/utils/normalizers.ts` and return the result

```ts
// src/store/requests/promotions.ts
import instance from "@/services/axios-instance"
import { PROMOTIONS } from "@/services/apis"
import type { Promotion } from "@/types/promotions"

export const getPromotions = async (): Promise<Promotion[]> => {
  const response = await instance.get(PROMOTIONS)
  return response.data
}
```

---

### 4a. Query hook (`/src/store/queries/<feature>.ts`)

- Query keys are **constants** defined in `/src/store/query-keys.ts` — never inline them
- The hook wraps `useQuery` and is the only thing components import

```ts
// src/store/query-keys.ts
export const GET_PROMOTIONS_KEY = "promotions"
```

```ts
// src/store/queries/promotions.ts
import { useQuery } from "@tanstack/react-query"
import { getPromotions } from "../requests/promotions"
import { GET_PROMOTIONS_KEY } from "../query-keys"

export const useGetPromotions = () => {
  return useQuery({
    queryKey: [GET_PROMOTIONS_KEY],
    queryFn: getPromotions,
  })
}
```

### 4b. Mutation hook (`/src/store/mutations/<feature>.ts`)

Mutations live in a **separate** `/src/store/mutations/` file — never in the queries file.

```ts
// src/store/mutations/promotions.ts
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { createPromotion } from "../requests/promotions"
import { GET_PROMOTIONS_KEY } from "../query-keys"

export const useCreatePromotion = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: createPromotion,
    onSuccess: () => qc.invalidateQueries({ queryKey: [GET_PROMOTIONS_KEY] }),
  })
}
```

---

### 5. Component usage

Components **never** call request functions or define query keys directly.
They import and call the custom hook only.

```tsx
import { useGetPromotions } from "@/store/queries/promotions"

const Promotions = () => {
  const { data } = useGetPromotions()
  const promotions = data ?? []
  // ...
}
```

---

## File naming

| Layer              | Path                                           |
| ------------------ | ---------------------------------------------- |
| Types              | `src/types/<feature>.ts`                       |
| Mock data          | `src/mock-data/<feature>.ts`                   |
| API path constants | `src/services/apis.ts`                         |
| Request functions  | `src/store/requests/<feature>.ts`              |
| Normalizers        | `src/store/normalizers/<feature>.ts`           |
| Status constants   | `src/utils/<feature>.ts`                       |
| Query keys         | `src/store/query-keys.ts`                      |
| Query hooks        | `src/store/queries/<feature>.ts`               |
| Mutation hooks     | `src/store/mutations/<feature>.ts`             |
| Table columns      | `src/components/table-columns/<feature>.tsx`   |
| Detail modal tabs  | `src/components/<feature>/tabs/<tab-name>.tsx` |

## Table columns pattern

Table column definitions live in `src/components/table-columns/<feature>.tsx`. Each file exports:

1. **`<feature>Columns`** — a base `ColumnDef<T>[]` with a placeholder actions cell (used for read-only/static views).
2. **`make<Feature>Columns(...callbacks)`** — a function that takes action callbacks and returns the full column set with a wired `RowActionsMenu` in the actions cell. Pages use this variant.

```tsx
// ✅ correct — src/components/table-columns/products.tsx
export const productColumns: ColumnDef<Product>[] = [
  // ... data columns + placeholder actions cell
]

export function makeProductColumns(
  onEdit: (p: Product) => void,
  onArchive: (p: Product) => void,
  onActivate: (p: Product) => void,
): ColumnDef<Product>[] {
  return [
    ...productColumns.slice(0, -1), // drop placeholder actions
    {
      id: "actions",
      cell: ({ row }) => (
        <div onClick={(e) => e.stopPropagation()}>
          <RowActionsMenu trigger={...} items={[...]} />
        </div>
      ),
    },
  ]
}

// ✅ correct — page usage (memoised)
const columns = useMemo(
  () => makeProductColumns(onEdit, onArchive, onActivate),
  [],
)

// ❌ wrong — building actionsColumn inline in the page component
const actionsColumn: ColumnDef<Product> = { id: "actions", cell: ({ row }) => ... }
const columns = [...productColumns.filter(...), actionsColumn]
```

## Status constants

Status values for a feature are defined as a `const` object in `src/utils/<feature>.ts`. **Never** use raw status strings inline — always reference the constant.

```ts
// ✅ correct — src/utils/orders.ts
export const PAYMENT_STATUS = {
  PAID: "paid",
  PENDING: "pending",
  FAILED: "failed",
  REFUNDED: "refunded",
} as const

export const FULFILLMENT_STATUS = {
  UNFULFILLED: "unfulfilled",
  FULFILLED: "fulfilled",
  // ...
} as const

// ✅ correct — usage in component
import { PAYMENT_STATUS, FULFILLMENT_STATUS } from "@/utils/orders"

const isFulfilled = status === FULFILLMENT_STATUS.FULFILLED

const config = {
  [PAYMENT_STATUS.PAID]: { label: "Paid", variant: "success" },
  // ...
}[status]

// ❌ wrong — raw string literals
const isFulfilled = status === "fulfilled"
const config = { paid: { ... } }[status]
```

## Normalizers

Any function that transforms a raw API response shape into a typed domain object lives in `src/utils/normalizers.ts`. **Never** define normalizer functions inline inside request files.

```ts
// ✅ correct — src/utils/normalizers.ts
export function normalizeOrderMetrics(raw: unknown): OrderMetrics {
  const m = raw as RawOrderMetrics
  return {
    total: m.total ?? m.total_orders ?? 0,
    // ...
  }
}

// src/store/requests/orders.ts
import { normalizeOrderMetrics } from "@/utils/normalizers"

export const getOrderMetrics = async () => {
  const response = await instance.get(ORDER_METRICS)
  return { data: normalizeOrderMetrics(response.data), ... }
}

// ❌ wrong — normalizer defined inside the request file
function normalizeOrderMetrics(raw) { ... }
```

## Default page background

All pages use the `page-bg` utility class as their default background unless explicitly told otherwise:

```tsx
// ✅ Every new page
<Layout>
  <div className="page-bg min-h-full">{/* page content */}</div>
</Layout>
```

`page-bg` is defined in `src/index.css` as:

```css
background: linear-gradient(168deg, #eef8f5 8.64%, #fff 62.04%, #f1f8f6 83.34%);
```

---

## Tailwind conventions

| Value | Use this  | Never write   |
| ----- | --------- | ------------- |
| 12px  | `text-xs` | `text-[12px]` |
| 14px  | `text-sm` | `text-[14px]` |

Always prefer named Tailwind scale utilities over arbitrary pixel values when an equivalent exists.

## No arbitrary color values

**Never** use arbitrary color values in `className`. Every color must come from a design token defined in `src/index.css` under `@theme inline`.

**Resolution order:**

1. **Token exists** → use it directly: `border-borderSubtle` not `border-[rgba(236,236,236,0.6)]`
2. **Token + opacity** → use Tailwind's opacity modifier: `bg-danger/8` not `bg-[rgba(255,56,60,0.08)]`
3. **Genuinely new color** → define a token in `src/index.css` first, then use it

```tsx
// ✅ correct
className = "border-borderSubtle bg-danger/4 text-statusSuccess"

// ❌ wrong
className = "border-[rgba(236,236,236,0.6)] bg-[rgba(255,56,60,0.04)] text-[#16a349]"
```

Key tokens in `src/index.css`:

- Borders: `line`, `borderSubtle`, `borderStrong`, `blur`
- Status: `statusSuccess`, `statusSuccessBg`, `statusError`, `statusWarning`, `statusInfo` (+ `Bg`/`Border` variants)
- UI: `hint`, `danger`, `secondary`, `brand`, `primary`

## Conditional class names

Always use `cn()` from `@/lib/utils` for conditional or merged class names. Never use template strings with ternaries.

```tsx
// ✅ correct
className={cn("base-class", isActive && "active-class", variant === "x" && "x-class")}

// ❌ wrong
className={`base-class ${isActive ? "active-class" : ""}`}
```

## Always use existing UI components

**Before writing any `<button>`, `<input>`, `<select>`, `<textarea>`, or layout primitive, check `src/components/ui/` first.** Never re-implement what already exists.

### Available components in `src/components/ui/`

| File                                | Component(s)                                       | Use for                                                                                                                                                                                                                        |
| ----------------------------------- | -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `button.tsx` + `button-variants.ts` | `Button`                                           | Every button. Variants: `default`, `secondary`, `outline`, `destructive`, `ghost`, `link`. Sizes: `default`, `sm`, `lg`, `xs`, `icon`, `icon-sm`, `icon-lg`, `icon-xs`. Props: `beforeIcon`, `afterIcon`, `label`.             |
| `form-inpu.tsx`                     | `FormInput`                                        | Text/number/email/password inputs with label + error.                                                                                                                                                                          |
| `form-textarea.tsx`                 | `FormTextarea`                                     | Textarea with label + error.                                                                                                                                                                                                   |
| `dropdown.tsx`                      | `Dropdown`                                         | Single-select and multi-select (`multiple` prop) dropdown. Props: `label`, `options`, `value`, `onChange`, `placeholder`, `error`, `onBlur`, `multiple`.                                                                       |
| `modal.tsx`                         | `Modal`                                            | Drawers (right/left/bottom) and dialogs. Props: `variant`, `position`, `width`, `customHeader`, `customFooter`.                                                                                                                |
| `data-table.tsx`                    | `DataTable`, `StatusBadge`                         | Generic table + status pill badges.                                                                                                                                                                                            |
| `dropdown-menu.tsx`                 | `RowActionsMenu`                                   | `⋮` action menus in table rows. Props: `trigger`, `items[]`.                                                                                                                                                                   |
| `badge.tsx`                         | `Badge`                                            | Inline badges/tags.                                                                                                                                                                                                            |
| `card.tsx`                          | `Card`, `CardHeader`, `CardContent`, etc.          | Card surfaces.                                                                                                                                                                                                                 |
| `tooltip.tsx`                       | `WithTooltip`, `TooltipProvider`                   | Hover tooltips. Requires `TooltipProvider` in tree (already at root).                                                                                                                                                          |
| `sidebar.tsx`                       | `Sidebar`, `SidebarHeader`, `SidebarContent`, etc. | App sidebar primitives.                                                                                                                                                                                                        |
| `dialog.tsx`                        | Dialog primitives                                  | Internal use inside `modal.tsx` only.                                                                                                                                                                                          |
| `sheet.tsx`                         | Sheet primitives                                   | Internal use inside `modal.tsx` only.                                                                                                                                                                                          |
| `select.tsx`                        | Select primitives                                  | Internal use inside `dropdown.tsx` only.                                                                                                                                                                                       |
| `input.tsx`                         | `Input`                                            | Internal use inside `FormInput.tsx` only.                                                                                                                                                                                      |
| `table.tsx`                         | `Table`, `TableHead`, etc.                         | Internal use inside `data-table.tsx` only.                                                                                                                                                                                     |
| `floating-pagination.tsx`           | `FloatingPagination`                               | Mobile fixed-bottom pagination.                                                                                                                                                                                                |
| `pagination.tsx`                    | `Pagination`                                       | In-content page number strip with jump-to-page ellipsis. Props: `page`, `totalPages`, `onPage`. Returns `null` when `totalPages <= 1`. Use this for all in-modal and in-page pagination — never roll custom Prev/Next buttons. |
| `search-input.tsx`                  | `SearchInput`                                      | Debounced search input with navigation.                                                                                                                                                                                        |
| `counter-tag.tsx`                   | `CounterTag`                                       | Numeric badge tag.                                                                                                                                                                                                             |
| `delete-button.tsx`                 | `DeleteButton`                                     | Trash-icon delete action.                                                                                                                                                                                                      |
| `quantity-control.tsx`              | `QuantityControl`                                  | `+`/`-` quantity stepper.                                                                                                                                                                                                      |
| `section-header.tsx`                | `SectionHeader`                                    | Section heading font.                                                                                                                                                                                                          |
| `otp-input.tsx`                     | `OtpInput`                                         | OTP/pin code input.                                                                                                                                                                                                            |
| `chart.tsx`                         | `ChartContainer`, `ChartTooltip`, etc.             | Recharts wrappers.                                                                                                                                                                                                             |
| `sonner.tsx`                        | `Toaster`                                          | Toast notifications.                                                                                                                                                                                                           |
| `collapsible.tsx`                   | Collapsible primitives                             | Expand/collapse sections.                                                                                                                                                                                                      |

```tsx
// ✅ correct
import { Button } from "@/components/ui/button"
<Button variant="secondary" onClick={handleSave}>Save</Button>
<Button variant="destructive">Delete</Button>
<Button variant="ghost" className="border border-borderSubtle text-hint">More actions</Button>

// ❌ wrong — never re-implement
<button className="bg-secondary text-white ...">Save</button>
<button className="text-red-500 border-red-500/10 ...">Delete</button>
```

## UI Component Abstraction Policy

Every shadcn/ui primitive used in this project **must** be wrapped in a project-level abstraction component before use. Never consume shadcn primitives directly in feature/page code. The abstraction lives in `src/components/ui/` and exposes a simplified, opinionated API that hides the multi-part shadcn composition internally.

**Rules:**

- The abstraction component must accept a clean, flat props API (e.g. `label`, `options`, `value`, `onChange`, `placeholder`) rather than requiring consumers to compose sub-components.
- All shadcn sub-parts (e.g. `SelectTrigger`, `SelectContent`, `SelectItem`) are internal implementation details — never exported or used outside the abstraction file.
- The abstraction file is the single place where shadcn imports for that component appear.
- Props that need escaping for advanced use cases can be exposed via a `slotProps` or `classNames` escape hatch.

**Example — `Select` → `Dropdown`:**

```tsx
// ❌ Never do this in feature code
<Select><SelectTrigger>...</SelectTrigger><SelectContent>...</SelectContent></Select>

// ✅ Always do this
<Dropdown label="Theme" options={[{ label: 'Light', value: 'light' }]} value={val} onChange={setVal} />
```

---

## Form validation pattern

All forms use **Zod schemas + TanStack Form**. Never use `useState` for form field tracking.

### File locations

| Layer                  | Path                                  |
| ---------------------- | ------------------------------------- |
| Zod schemas            | `src/validations/<feature>.ts`        |
| Shared field validator | `validateField` in `src/lib/utils.ts` |

### Schema

Define field-level schemas in `src/validations/<feature>.ts`:

```ts
// src/validations/auth.ts
import { z } from "zod"

export const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
})

export type LoginFormValues = z.infer<typeof loginSchema>
```

### Component

```tsx
import { useForm } from "@tanstack/react-form"
import { loginSchema, type LoginFormValues } from "@/validations/auth"
import { validateField } from "@/lib/utils"

const form = useForm({
  defaultValues: { email: "", password: "" } satisfies LoginFormValues,
  onSubmit: ({ value }) => { /* call mutation */ },
})

// In JSX:
<form.Field
  name="email"
  validators={{ onBlur: ({ value }) => validateField(loginSchema, "email", value) }}
>
  {(field) => (
    <FormInput
      value={field.state.value}
      onChange={field.handleChange}
      onBlur={field.handleBlur}
      error={field.state.meta.errors[0]?.toString()}
    />
  )}
</form.Field>
```

### Cross-field validation (e.g. confirm password)

Use the field's own validator — do NOT use Zod `.refine()` on the schema:

```tsx
<form.Field
  name="confirmPassword"
  validators={{
    onBlur: ({ value, fieldApi }) => {
      const pw = fieldApi.form.getFieldValue("password")
      if (!value) return "Please confirm your password"
      if (value !== pw) return "Passwords do not match"
    },
  }}
>
```

### Edit modals (pre-populated forms)

Seed `defaultValues` directly from the entity prop in `useForm` (the parent uses key-based remounting so the instance is always fresh). Use `form.setFieldValue` in a `useEffect` to upgrade fields when richer async data loads. **Never use `form.reset(values)` for pre-population** — it does not reliably trigger field re-renders.

```ts
// Immediate seed from prop
const form = useForm({
  defaultValues: {
    name: entity?.name ?? "",
    // ...
  },
})

// Upgrade when full async data arrives (e.g. after useGetById resolves)
useEffect(() => {
  if (!isOpen || !entity) return
  form.setFieldValue("name", entity.name)
  form.setFieldValue("category", entity.categoryIds)
  // ...
}, [entity, isOpen])
```

### `validateField` utility

Lives in `src/lib/utils.ts`. Validates a single field against its schema and returns the first error message or `undefined`:

```ts
validateField(loginSchema, "email", value) // → string | undefined
```

---

## Route constants

All route paths are defined as constants in `src/lib/routes.ts`. **Never hardcode route strings** anywhere in the codebase.

```ts
// src/lib/routes.ts
export const ROUTES = {
  home: "/",
  login: "/login",
  signup: "/signup",
  // ...
} as const
```

Always import and use `ROUTES` for any navigation:

```tsx
// ✅ correct
import { ROUTES } from "@/lib/routes"
<Link to={ROUTES.login}>Login</Link>
navigate({ to: ROUTES.dashboard })
throw redirect({ to: ROUTES.login })

// ❌ wrong
<Link to="/login">Login</Link>
navigate({ to: "/dashboard" })
```

When adding a new route, add it to `ROUTES` first, then reference it everywhere.

---

## Route / page separation

Route files in `src/routes/` are **thin shells** — they only define the route and import the page component. All UI logic lives in `src/pages/`.

```
src/routes/login.tsx          ← shell only
src/pages/auth/login.tsx      ← actual LoginPage component
```

Auth pages live under `src/pages/auth/`. App pages live under `src/pages/<feature>/` (one file or an `index.tsx` inside a folder).

```tsx
// ✅ src/routes/login.tsx — correct
import { createFileRoute } from "@tanstack/react-router"
import LoginPage from "@/pages/auth/login"

export const Route = createFileRoute("/login")({ component: LoginPage })

// ❌ wrong — page component defined inline inside the route file
export const Route = createFileRoute("/login")({ component: LoginPage })
export default function LoginPage() { ... }
```

Never put substantive component code (state, JSX, hooks) in a route file.

---

## No inline types

**Never** define types inline in function signatures, return types, or variable declarations. Every shape must be a named `interface` or `type` alias in the appropriate `src/types/<feature>.ts` file.

```ts
// ❌ wrong — inline object type
export const getUserLogs = async (): Promise<{ items: UserActivityLog[]; total_count: number }> => { ... }

// ✅ correct — named interface in src/types/users.ts
export interface UserActivityLogPage {
  items: UserActivityLog[]
  total_count: number
  page_size: number
  current_page: number
}

export const getUserLogs = async (): Promise<UserActivityLogPage> => { ... }
```

This applies everywhere: request functions, query hooks, component props, utility functions. If a shape is used even once, give it a name.

---

## Modal patterns

### Mutations inside modals

Mutations that belong exclusively to a modal live **inside** the modal component — not in the parent page. The page only wires `isOpen` / `onClose`.

```tsx
// ✅ correct — mutation owned by the modal
export default function AddProductModal({ isOpen, onClose }) {
  const createProduct = useCreateProduct()
  // ...
}

// ❌ wrong — mutation defined in parent and passed as prop
;<AddProductModal onSubmit={(data) => createProduct.mutate(data)} />
```

### Feedback via global alert

Use `showAlert` from `@/store/alerts` for all success/error feedback — both inside modals and in page-level handlers. Never use local `errorMessage` state or `EBuyAlert` inside modals.

```tsx
import { showAlert } from "@/store/alerts"

// In mutation callbacks:
onSuccess: () => showAlert({ variant: "success", message: "Product created successfully" })
onError: (error) => showAlert({ variant: "error", message: error.message })
```

Alerts are rendered globally by `<EBuyAlertContainer />` (mounted in `__root.tsx`) and auto-dismiss after 4 seconds.

### Prevent close during mutation

Always set `preventClose={mutation.isPending}` on `Modal` when a mutation is in-flight.

```tsx
<Modal preventClose={createProduct.isPending} ...>
```

### Detail modals with tabs

When a detail modal has multiple content tabs, each tab's content lives in its own file under `src/components/<feature>/tabs/`. The modal component imports these and switches between them — it does not define tab content inline.

```
src/components/customer/
  customer-detail-modal.tsx   ← modal shell, tab switcher, footer actions
  tabs/
    about-tab.tsx             ← About tab content (accepts customer + detail props)
    purchase-summary-tab.tsx  ← calls useGetCustomerPurchaseSummary internally
    notes-tab.tsx             ← calls useGetCustomerNotes + useAddCustomerNote internally
```

Tab components own their own data fetching (queries and mutations) — the parent modal only passes the minimal entity prop needed to derive the ID.

### Button loading states

Every button that triggers a mutation must show a `loading` prop tied to `mutation.isPending`. Other buttons in the same footer should be `disabled` while the mutation runs.

```tsx
<Button variant="outline" disabled={mutation.isPending} onClick={onClose}>Cancel</Button>
<Button variant="secondary" loading={mutation.isPending} onClick={handleSubmit}>Save</Button>
```

For modals where a parent page owns the mutation (e.g. fire-and-forget actions passed via callback props), pass `isPending` down as a dedicated boolean prop:

```tsx
// In modal props interface
isSendingInvite?: boolean

// In page
<StaffDetailModal isSendingInvite={sendInvite.isPending} ... />
```

---

## PageSkeleton guard

Every page that fetches data must show `<PageSkeleton>` while loading. The guard must come **after** all hook calls — never before them (hooks cannot be called after an early return).

```tsx
export default function MyPage() {
  const { data, isLoading } = useGetSomething()
  // ← ALL other hooks here

  if (isLoading) return <PageSkeleton metricCount={4} />

  return (...)
}
```

---

## API-driven export

When the API provides a CSV export endpoint, use `onExportAll` on `TableToolbar` / `ExportButton` instead of client-side CSV generation. This bypasses the fetch+transform flow entirely.

```tsx
const exportCSV = useExportProductsCSV()

<TableToolbar
  exportProps={{ currentData: filtered, filename: "products", onExportAll: () => exportCSV.mutate() }}
/>
```

---

## File structure — main export first

The main exported component always goes at the **top** of the file. Sub-components, helpers, icons, and data constants go **below**.

Use a `function` declaration for the main export (it is hoisted, so it can reference `const` sub-components defined later in the file):

```tsx
// ✅ correct
export default function MyComponent() {
  return <SubComponent />
}

const SubComponent = () => (...)

// ❌ wrong — main export buried at the bottom
const SubComponent = () => (...)
const MyComponent = () => (...)
export default MyComponent
```

## Git Commits

- Do NOT include "Co-Authored-By: Claude" or any mention of Claude in git commits
- Do NOT include AI attribution in commit messages
