import { useState } from "react"
import { cn } from "@/lib/utils"
import Dropdown from "@/components/ui/dropdown"
import FormInput from "@/components/ui/form-input"
import { Switch } from "@/components/ui/switch"
import Modal from "@/components/ui/modal"
import { Button } from "@/components/ui/button"
import { SectionCard, ToggleRow } from "./shared"

const DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

const TIME_OPTIONS = [
  "6:00 AM",
  "7:00 AM",
  "8:00 AM",
  "9:00 AM",
  "10:00 AM",
  "11:00 AM",
  "12:00 PM",
  "1:00 PM",
  "2:00 PM",
  "3:00 PM",
  "4:00 PM",
  "5:00 PM",
  "6:00 PM",
  "7:00 PM",
  "8:00 PM",
  "9:00 PM",
  "10:00 PM",
].map((t) => ({ label: t, value: t }))

const COURIER_OPTIONS = [
  { label: "DHL", value: "dhl" },
  { label: "GIG Logistics", value: "gig" },
  { label: "Sendbox", value: "sendbox" },
  { label: "Self-managed", value: "self" },
]

const STATES = ["Lagos", "Abuja", "Rivers", "Kano", "Oyo"].map((s) => ({ label: s, value: s }))
const LGAS = ["Ikeja", "Surulere", "Lekki", "Victoria Island", "Yaba"].map((l) => ({
  label: l,
  value: l,
}))

type DayHours = { open: boolean; from: string; to: string }

type StoreEntry = { name: string; code: string }

const DEFAULT_STORES: StoreEntry[] = [
  { name: "eBuy Lagos", code: "STR001" },
  { name: "eBuy Abuja Central", code: "STR002" },
  { name: "eBuy PH", code: "STR003" },
  { name: "eBuy Ikeja", code: "STR004" },
]

export default function LocationSettingsSection() {
  const [activeStore, setActiveStore] = useState(0)
  const [stores, setStores] = useState<StoreEntry[]>(DEFAULT_STORES)
  const [showAddStore, setShowAddStore] = useState(false)
  const [newStoreName, setNewStoreName] = useState("")

  const handleAddStore = () => {
    const name = newStoreName.trim()
    if (!name) return
    const code = `STR${String(stores.length + 1).padStart(3, "0")}`
    setStores((prev) => [...prev, { name, code }])
    setActiveStore(stores.length)
    setNewStoreName("")
    setShowAddStore(false)
  }

  const [storeInfo, setStoreInfo] = useState({
    name: "",
    address: "",
    state: "",
    lga: "",
    phone: "",
    email: "",
  })

  const [hours, setHours] = useState<Record<string, DayHours>>(
    Object.fromEntries(
      DAYS_OF_WEEK.map((d) => [d, { open: true, from: "9:00 AM", to: "6:00 PM" }]),
    ),
  )

  const [services, setServices] = useState({
    inStorePickup: true,
    walkIn: true,
    skincareConsultation: false,
  })

  const [orderSettings, setOrderSettings] = useState({
    minOrderValue: "",
    maxItemsPerOrder: "",
  })

  const [delivery, setDelivery] = useState({
    enabled: false,
    courier: "",
  })

  const toggleDay = (day: string) =>
    setHours((prev) => ({
      ...prev,
      [day]: { ...prev[day], open: !prev[day].open },
    }))

  const setDayTime = (day: string, field: "from" | "to", val: string) =>
    setHours((prev) => ({ ...prev, [day]: { ...prev[day], [field]: val } }))

  return (
    <div className="flex flex-col gap-4">
      {/* Store selector */}
      <div className="border-borderSubtle overflow-hidden rounded-xl border bg-white px-6 py-4">
        <p className="font-jakarta text-brand/50 mb-3 text-xs font-semibold tracking-widest uppercase">
          Select store to configure
        </p>
        <div className="no-scrollbar flex flex-wrap gap-2 overflow-x-auto">
          {stores.map((s, i) => (
            <button
              key={s.code}
              onClick={() => setActiveStore(i)}
              className={cn(
                "font-jakarta flex items-center gap-1.5 rounded-lg border px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors",
                activeStore === i
                  ? "border-primary text-primary"
                  : "border-brand/10 text-brand/60 hover:bg-brand/5",
              )}
            >
              {s.name}
              <span
                className={cn("text-xs", activeStore === i ? "text-primary/60" : "text-brand/30")}
              >
                · {s.code}
              </span>
            </button>
          ))}
          <button
            onClick={() => setShowAddStore(true)}
            className="font-jakarta text-primary/70 border-primary/20 hover:bg-primary/5 flex items-center gap-1 rounded-lg border border-dashed px-4 py-2 text-sm font-medium transition-colors"
          >
            + Add new location
          </button>
        </div>
      </div>

      <SectionCard title="Store Information" subtitle="Basic details for this location">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <FormInput
            label="Store Name"
            placeholder="Enter store name"
            value={storeInfo.name}
            onChange={(v) => setStoreInfo((p) => ({ ...p, name: v }))}
          />
          <FormInput
            label="Store Address"
            placeholder="Enter store address"
            value={storeInfo.address}
            onChange={(v) => setStoreInfo((p) => ({ ...p, address: v }))}
            className="lg:col-span-2"
          />
          <Dropdown
            label="State"
            options={STATES}
            value={storeInfo.state}
            onChange={(v) => setStoreInfo((p) => ({ ...p, state: v }))}
            placeholder="Select state"
          />
          <Dropdown
            label="LGA"
            options={LGAS}
            value={storeInfo.lga}
            onChange={(v) => setStoreInfo((p) => ({ ...p, lga: v }))}
            placeholder="Select LGA"
          />
          <FormInput
            label="Phone"
            placeholder="Enter phone number"
            value={storeInfo.phone}
            onChange={(v) => setStoreInfo((p) => ({ ...p, phone: v }))}
          />
          <FormInput
            label="Email"
            placeholder="Enter email"
            type="email"
            value={storeInfo.email}
            onChange={(v) => setStoreInfo((p) => ({ ...p, email: v }))}
          />
        </div>
      </SectionCard>

      <SectionCard title="Operating Hours" subtitle="Set opening and closing times for each day">
        <div className="divide-borderSubtle flex flex-col divide-y">
          {DAYS_OF_WEEK.map((day) => {
            const dayHours = hours[day]
            return (
              <div
                key={day}
                className={cn(
                  "flex flex-wrap items-center gap-3 py-3",
                  !dayHours.open && "opacity-50",
                )}
              >
                <Switch size="lg" checked={dayHours.open} onCheckedChange={() => toggleDay(day)} />
                <span className="font-jakarta text-brand w-24 text-sm font-medium">{day}</span>
                {dayHours.open ? (
                  <div className="flex flex-1 items-center gap-2">
                    <Dropdown
                      options={TIME_OPTIONS}
                      value={dayHours.from}
                      onChange={(v) => setDayTime(day, "from", v)}
                      className="w-36"
                    />
                    <span className="font-jakarta text-brand/50 text-sm">to</span>
                    <Dropdown
                      options={TIME_OPTIONS}
                      value={dayHours.to}
                      onChange={(v) => setDayTime(day, "to", v)}
                      className="w-36"
                    />
                  </div>
                ) : (
                  <span className="font-jakarta text-brand/40 text-sm">Closed</span>
                )}
              </div>
            )
          })}
        </div>
      </SectionCard>

      <SectionCard
        title="Services Offered"
        subtitle="Toggle the services available at this location"
      >
        <div className="divide-borderSubtle flex flex-col divide-y">
          <ToggleRow
            label="In-store pickup"
            checked={services.inStorePickup}
            onChange={() => setServices((p) => ({ ...p, inStorePickup: !p.inStorePickup }))}
          />
          <ToggleRow
            label="Walk-in shopping"
            checked={services.walkIn}
            onChange={() => setServices((p) => ({ ...p, walkIn: !p.walkIn }))}
          />
          <ToggleRow
            label="Skincare Consultation"
            checked={services.skincareConsultation}
            onChange={() =>
              setServices((p) => ({ ...p, skincareConsultation: !p.skincareConsultation }))
            }
          />
        </div>
      </SectionCard>

      <SectionCard title="Order Settings" subtitle="Configure order rules for this location">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <FormInput
            label="Minimum order value (₦)"
            placeholder="e.g. 5000"
            value={orderSettings.minOrderValue}
            onChange={(v) => setOrderSettings((p) => ({ ...p, minOrderValue: v }))}
          />
          <FormInput
            label="Max items per order"
            placeholder="e.g. 50"
            value={orderSettings.maxItemsPerOrder}
            onChange={(v) => setOrderSettings((p) => ({ ...p, maxItemsPerOrder: v }))}
          />
        </div>
      </SectionCard>

      <SectionCard
        title="Delivery & Courier"
        subtitle="Configure delivery options for this location"
      >
        <ToggleRow
          label="Enable delivery"
          checked={delivery.enabled}
          onChange={() => setDelivery((p) => ({ ...p, enabled: !p.enabled }))}
        />
        <div className="mt-4">
          <Dropdown
            label="Default courier"
            options={COURIER_OPTIONS}
            value={delivery.courier}
            onChange={(v) => setDelivery((p) => ({ ...p, courier: v }))}
            placeholder="Select courier"
            disabled={!delivery.enabled}
          />
        </div>
      </SectionCard>

      <Modal
        isOpen={showAddStore}
        onClose={() => {
          setShowAddStore(false)
          setNewStoreName("")
        }}
        variant="dialog"
        title="Add store"
        className="max-w-sm p-0"
        customFooter={
          <div className="border-borderSubtle flex justify-end gap-3 border-t px-6 py-4">
            <Button
              variant="outline"
              onClick={() => {
                setShowAddStore(false)
                setNewStoreName("")
              }}
            >
              Cancel
            </Button>
            <Button variant="secondary" onClick={handleAddStore} disabled={!newStoreName.trim()}>
              Add store
            </Button>
          </div>
        }
      >
        <div className="px-6 py-5">
          <div className="flex flex-col gap-1.5">
            <label className="font-jakarta text-brand text-sm font-semibold">Store name</label>
            <input
              autoFocus
              value={newStoreName}
              onChange={(e) => setNewStoreName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddStore()}
              placeholder="e.g. Abuja Branch"
              className="font-jakarta border-brand/8 text-brand placeholder:text-brand/40 focus:border-primary/30 h-10 w-full rounded-lg border bg-white px-4 text-sm outline-none"
            />
          </div>
        </div>
      </Modal>
    </div>
  )
}
