# eBuy Admin UI — Refactor Checklist

> Tracks all 9 refactoring items. Updated as each task is completed.

---

## 1. Route File Cleanup ✦ routes → pages → components ✅

**Rule:** Route file is a thin wrapper only. Page logic lives in `/pages/<feature>/`. Sub-components/modals live in `/components/<feature>/`.

- [x] products → `pages/products/index.tsx`
- [x] orders → `pages/orders/index.tsx`
- [x] customers → `pages/customers/index.tsx`
- [x] promotions → `pages/promotions/index.tsx`
- [x] locations → `pages/locations/index.tsx`
- [x] banners → `pages/banners/index.tsx`
- [x] users → `pages/users/index.tsx`
- [x] inventory → `pages/inventory/index.tsx`
- [x] transactions → `pages/transactions/index.tsx`
- [x] analytics → `pages/analytics/index.tsx`
- [x] messaging → `pages/messaging/index.tsx`
- [x] settings → `pages/settings/index.tsx`
- [x] categories → `pages/categories/index.tsx`
- [x] Old conflicting route files deleted

---

## 2. Type Conventions ✅

**Rule:** All data types (non-component) live in `/types/<feature>.ts`.

- [x] All types already in `/src/types/*.ts` — no changes needed

---

## 3. Shared MetricCard ✅

**Rule:** Single definition in `components/shared/metric-card.tsx`. Dashboard variant accepts `change` + `changeType`, others only need `label` + `value`.

- [x] `src/components/shared/metric-card.tsx` created
- [x] Inline MetricCard removed from every route/page file

---

## 4. DataTable Refactor ✅

**Rule:** `components/ui/data-table.tsx` is the single table abstraction using `@tanstack/react-table`. Every feature table uses it. Column definitions live in `components/table-columns/<feature>.tsx`.

- [x] Upgraded `data-table.tsx` to use `@tanstack/react-table` `useReactTable`
- [x] Row selection support (checkbox column, internal state)
- [x] Floating selection bubble ("X rows selected")
- [x] `rowSelectionActions` prop (ReactNode shown on bubble click; omit to hide checkboxes)
- [x] `components/table-columns/products.tsx`
- [x] `components/table-columns/orders.tsx`
- [x] `components/table-columns/customers.tsx`
- [x] `components/table-columns/promotions.tsx`
- [x] `components/table-columns/locations.tsx`
- [x] `components/table-columns/banners.tsx`
- [x] `components/table-columns/users.tsx`
- [x] `components/table-columns/inventory.tsx`
- [x] `components/table-columns/transactions.tsx`
- [x] `components/table-columns/activity-logs.tsx`
- [x] `components/table-columns/messages.tsx`
- [x] `components/table-columns/categories.tsx`
- [x] Every feature page uses DataTable on desktop

---

## 5. Global Export Button ✅

**Rule:** `components/shared/export-button.tsx` — dropdown with "Export current page" + "Export all". CSV logic in `utils/csv.ts`.

- [x] `src/utils/csv.ts` (exportToCsv utility)
- [x] `src/components/shared/export-button.tsx`
- [x] Used on orders, transactions, categories pages

---

## 6. nuqs URL State for Tabs ✅

**Rule:** Every page with tabs tracks active tab in URL query params via nuqs.

- [x] nuqs installed (`pnpm add nuqs`)
- [x] `NuqsAdapter` (tanstack-router) added to `__root.tsx`
- [x] messaging tabs → `?tab=All`
- [x] users tabs → `?tab=All+users`
- [x] inventory tabs → `?tab=All`

---

## 7. Collapsible Sidebar ✅

**Rule:** Toggle button in AppTopBar. Sidebar collapses to icon-only (64px). Tooltips shown on icons when collapsed. State persisted in Zustand store.

- [x] `src/store/sidebar.ts` (Zustand store, persisted to localStorage)
- [x] `components/ui/sidebar.tsx` — collapsed context, smooth width transition, hidden labels
- [x] `components/shared/AppSidebar.tsx` — reads collapsed state, hides logo text + user info
- [x] `components/shared/AppTopBar.tsx` — PanelLeft toggle button before search
- [x] Tooltip on each nav icon when collapsed (side="right")

---

## 8. DRY AppLayout via Layout Route ✅

**Rule:** `routes/_app.tsx` provides AppLayout for all app routes. No page component imports AppLayout directly.

- [x] `routes/_app.tsx` (TanStack Router pathless layout route)
- [x] All app routes in `routes/_app/<feature>.tsx`
- [x] `createFileRoute` IDs use `'/_app/<feature>'`
- [x] AppLayout removed from all page components
- [x] Auth routes stay at `routes/*.tsx` (unaffected)

---

## 9. Row Selection Action Bubble ✅

**Rule:** DataTable shows floating bubble on row selection. If `rowSelectionActions` prop is provided, bubble is clickable and shows the action panel. If not provided, row selection is hidden entirely.

- [x] Built into DataTable
- [x] `rowSelectionActions` prop API: omit → no checkboxes; provide → bubble + action panel on click

---

## Architecture Decisions

| Layer         | Pattern                                                              |
| ------------- | -------------------------------------------------------------------- |
| Route file    | `createFileRoute` + single component import only                     |
| Page file     | Main component first, no AppLayout (provided by layout route)        |
| Component     | Sub-components, modals, cards per feature                            |
| Table columns | `ColumnDef<T>[]` from `@tanstack/react-table`                        |
| MetricCard    | Shared, optional `change`/`changeType` props                         |
| DataTable     | `@tanstack/react-table` internally, row selection built-in           |
| Export        | Dropdown with current-page CSV + all-records CSV                     |
| Tab state     | nuqs `useQueryState` — URL-persisted                                 |
| Sidebar       | Zustand collapsed state, tooltip on icons, persisted to localStorage |
| AppLayout     | Single source via `_app.tsx` layout route                            |
