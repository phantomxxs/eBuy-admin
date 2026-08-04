import { useEffect, useState } from "react"
import { useForm } from "@tanstack/react-form"
import { X } from "lucide-react"
import Modal from "@/components/ui/modal"
import { Button } from "@/components/ui/button"
import FormInput from "../ui/form-input"
import Dropdown from "../ui/dropdown"
import { Switch } from "@/components/ui/switch"
import { useUpdateLocation } from "@/store/mutations/locations"
import { useGetLocationById } from "@/store/queries/locations"
import { showAlert } from "@/store/alerts"
import { editLocationSchema, type EditLocationFormValues } from "@/validations/location"
import { validateField } from "@/lib/utils"
import { useGetGeoOptions } from "@/hooks/useGetGeoOptions"
import type { Location } from "@/types/locations"

interface Props {
  isOpen: boolean
  onClose: () => void
  location: Location | null
}

export default function EditLocationModal({ isOpen, onClose, location }: Props) {
  const [selectedCountry, setSelectedCountry] = useState("")
  const [selectedState, setSelectedState] = useState<number | null>(null)
  const [stateName, setStateName] = useState("")
  const [lgaName, setLgaName] = useState("")

  const { data: detail } = useGetLocationById(isOpen && location ? location.id : "")

  const {
    countryOptions,
    stateOptions,
    lgaOptions,
    isLoadingCountries,
    isLoadingStates,
    isLoadingLgas,
    isErrorCountries,
    isErrorStates,
    isErrorLgas,
  } = useGetGeoOptions({ selectedCountryCode: selectedCountry, selectedStateId: selectedState })

  const update = useUpdateLocation()

  const form = useForm({
    defaultValues: {
      name: "",
      country: "",
      state: "",
      lga: "",
      address: "",
      contact: "",
      phone: "",
      status: "",
      pickupEnabled: false as boolean,
      walkInEnabled: false as boolean,
      consultationEnabled: false as boolean,
      alwaysFufill: false as boolean,
    } satisfies EditLocationFormValues,
    onSubmit: ({ value }) => {
      if (!location) return
      update.mutate(
        {
          id: location.id,
          name: value.name,
          address: value.address,
          city: lgaName,
          state: stateName,
          stateId: selectedState ?? undefined,
          phone: value.phone ?? "",
          contactEmail: value.contact,
          isActive: value.status === "active",
          supportsPickup: value.pickupEnabled,
          supportsWalkin: value.walkInEnabled,
          always_fulfill: value.alwaysFufill,
        },
        {
          onSuccess: () => {
            showAlert({ variant: "success", message: "Location updated" })
            onClose()
          },
          onError: (e) => showAlert({ variant: "error", message: e.message }),
        },
      )
    },
  })

  useEffect(() => {
    if (location && isOpen) {
      form.setFieldValue("name", location.name)
      form.setFieldValue("country", "NG")
      form.setFieldValue("state", "")
      form.setFieldValue("lga", "")
      form.setFieldValue("address", location.address)
      form.setFieldValue("contact", location.contact)
      form.setFieldValue("phone", "")
      form.setFieldValue("status", location.status)
      form.setFieldValue("pickupEnabled", location.pickupEnabled)
      form.setFieldValue("walkInEnabled", location.walkInEnabled)
      form.setFieldValue("consultationEnabled", false)
      form.setFieldValue("alwaysFufill", location.alwaysFufill)
      setSelectedCountry("NG")
      setSelectedState(null)
      setStateName("")
      setLgaName("")
    }
  }, [location, isOpen])

  useEffect(() => {
    if (!detail || !isOpen) return
    setSelectedCountry("NG")
    form.setFieldValue("country", "NG")
    if (detail.stateId) {
      setSelectedState(detail.stateId)
      setStateName(detail.state ?? "")
      form.setFieldValue("state", String(detail.stateId))
    }
    if (detail.phone) {
      form.setFieldValue("phone", detail.phone)
    }
  }, [detail, isOpen])

  useEffect(() => {
    if (!detail || !isOpen || lgaOptions.length === 0) return
    const cityName = detail.lga
    if (!cityName) return
    const opt = lgaOptions.find((o) => o.label === cityName)
    if (opt) {
      form.setFieldValue("lga", opt.value)
      setLgaName(opt.label)
    }
  }, [lgaOptions, detail, isOpen])

  if (!location) return null

  const customHeader = (
    <div className="border-borderSubtle border-b px-6 py-5">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="font-jakarta text-brand text-base font-semibold">Edit location</h2>
          <p className="font-jakarta text-brand/50 mt-0.5 text-sm">{location.storeId}</p>
        </div>
        <button
          onClick={onClose}
          disabled={update.isPending}
          className="text-brand/40 hover:text-brand ml-4 shrink-0 rounded p-0.5 transition-colors disabled:opacity-40"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  )

  const customFooter = (
    <div className="border-borderSubtle shrink-0 border-t p-4 sm:p-6">
      <div className="flex gap-3">
        <Button variant="subtle" onClick={onClose} disabled={update.isPending} className="flex-1">
          Cancel
        </Button>
        <Button
          variant="secondary"
          loading={update.isPending}
          onClick={() => form.handleSubmit()}
          className="flex-1"
        >
          Save changes
        </Button>
      </div>
    </div>
  )

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      variant="drawer"
      customHeader={customHeader}
      customFooter={customFooter}
      width="652px"
      preventClose={update.isPending}
    >
      <div className="flex-1 space-y-4 overflow-y-auto px-6 py-5">
        <SectionLabel title="STORE DETAILS" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <form.Field
            name="name"
            validators={{ onBlur: ({ value }) => validateField(editLocationSchema, "name", value) }}
          >
            {(field) => (
              <FormInput
                label="Store name"
                value={field.state.value}
                onChange={field.handleChange}
                onBlur={field.handleBlur}
                placeholder="Enter store name"
                error={field.state.meta.errors[0]?.toString()}
              />
            )}
          </form.Field>
          <form.Field
            name="status"
            validators={{
              onBlur: ({ value }) => validateField(editLocationSchema, "status", value),
            }}
          >
            {(field) => (
              <Dropdown
                label="Status"
                options={[
                  { label: "Active", value: "active" },
                  { label: "Inactive", value: "inactive" },
                  { label: "Closed", value: "closed" },
                ]}
                value={field.state.value}
                onChange={field.handleChange}
                onBlur={field.handleBlur}
                placeholder="Select status"
                error={field.state.meta.errors[0]?.toString()}
              />
            )}
          </form.Field>
        </div>

        <SectionLabel title="ADDRESS" />
        <div className="grid grid-cols-2 gap-3">
          <form.Field
            name="country"
            validators={{
              onBlur: ({ value }) => validateField(editLocationSchema, "country", value),
            }}
          >
            {(field) => (
              <Dropdown
                label="Country"
                value={field.state.value}
                onChange={(v) => {
                  field.handleChange(v)
                  setSelectedCountry(v)
                  setSelectedState(null)
                  setStateName("")
                  setLgaName("")
                  form.setFieldValue("state", "")
                  form.setFieldValue("lga", "")
                }}
                onBlur={field.handleBlur}
                placeholder={
                  isLoadingCountries
                    ? "Loading…"
                    : isErrorCountries
                      ? "Failed to load"
                      : "Select country"
                }
                options={countryOptions}
                disabled={isLoadingCountries}
                error={field.state.meta.errors[0]?.toString()}
              />
            )}
          </form.Field>
          <form.Field
            name="state"
            validators={{
              onBlur: ({ value }) => validateField(editLocationSchema, "state", value),
            }}
          >
            {(field) => (
              <Dropdown
                label="State"
                value={field.state.value}
                onChange={(v) => {
                  field.handleChange(v)
                  const opt = stateOptions.find((o) => o.value === v)
                  setSelectedState(opt ? Number(opt.value) : null)
                  setStateName(opt?.label ?? "")
                  setLgaName("")
                  form.setFieldValue("lga", "")
                }}
                onBlur={field.handleBlur}
                placeholder={
                  !selectedCountry
                    ? "Select country first"
                    : isLoadingStates
                      ? "Loading…"
                      : isErrorStates
                        ? "Failed to load"
                        : "Select state"
                }
                options={stateOptions}
                disabled={!selectedCountry || isLoadingStates}
                error={field.state.meta.errors[0]?.toString()}
              />
            )}
          </form.Field>
          <form.Field name="lga">
            {(field) => (
              <Dropdown
                label="LGA"
                value={field.state.value ?? ""}
                onChange={(v) => {
                  field.handleChange(v)
                  const opt = lgaOptions.find((o) => o.value === v)
                  setLgaName(opt?.label ?? "")
                }}
                placeholder={
                  !selectedState
                    ? "Select state first"
                    : isLoadingLgas
                      ? "Loading…"
                      : isErrorLgas
                        ? "Failed to load"
                        : "Select LGA"
                }
                options={lgaOptions}
                disabled={!selectedState || isLoadingLgas}
                className="w-full!"
              />
            )}
          </form.Field>
        </div>

        <form.Field
          name="address"
          validators={{
            onBlur: ({ value }) => validateField(editLocationSchema, "address", value),
          }}
        >
          {(field) => (
            <FormInput
              label="Street address"
              value={field.state.value}
              onChange={field.handleChange}
              onBlur={field.handleBlur}
              placeholder="Enter street address"
              error={field.state.meta.errors[0]?.toString()}
            />
          )}
        </form.Field>

        <SectionLabel title="CONTACT" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <form.Field
            name="contact"
            validators={{
              onBlur: ({ value }) => validateField(editLocationSchema, "contact", value),
            }}
          >
            {(field) => (
              <FormInput
                label="Contact email"
                type="email"
                value={field.state.value}
                onChange={field.handleChange}
                onBlur={field.handleBlur}
                placeholder="store@example.com"
                error={field.state.meta.errors[0]?.toString()}
              />
            )}
          </form.Field>
          <form.Field name="phone">
            {(field) => (
              <FormInput
                label="Contact phone"
                value={field.state.value ?? ""}
                onChange={field.handleChange}
                placeholder="+234"
                type="tel"
              />
            )}
          </form.Field>
        </div>

        <div className="border-borderSubtle mt-4 overflow-hidden rounded-xl border">
          {TOGGLE_ITEMS.map((item, i) => {
            const fieldName = TOGGLE_FIELD_NAMES[i]
            return (
              <form.Field key={item.label} name={fieldName}>
                {(field) => (
                  <div className="border-borderSubtle flex items-center justify-between border-b px-4 py-3.5 last:border-0">
                    <div>
                      <p className="font-jakarta text-brand text-sm font-medium">{item.label}</p>
                      <p className="font-jakarta text-brand/50 text-xs">{item.desc}</p>
                    </div>
                    <Switch
                      size="lg"
                      checked={field.state.value}
                      onCheckedChange={field.handleChange}
                    />
                  </div>
                )}
              </form.Field>
            )
          })}
        </div>
      </div>
    </Modal>
  )
}

const SectionLabel = ({ title }: { title: string }) => (
  <p className="font-jakarta text-brand/60 text-xs font-semibold tracking-wide uppercase">
    {title}
  </p>
)

const TOGGLE_ITEMS = [
  { label: "In-store pickup", desc: "Customers can select this store for order pickup" },
  { label: "Walk-in shopping", desc: "Customers can browse and buy in-store" },
  { label: "Skincare Consultation", desc: "Customers can book 1-to-1 consultations" },
  { label: "Website store", desc: "This is the default store used for website orders" },
]

const TOGGLE_FIELD_NAMES = [
  "pickupEnabled",
  "walkInEnabled",
  "consultationEnabled",
  "alwaysFufill",
] as const
