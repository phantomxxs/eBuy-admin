import { useEffect, useState } from "react"
import { useForm } from "@tanstack/react-form"
import Modal from "@/components/ui/modal"
import { Button } from "@/components/ui/button"
import Dropdown from "@/components/ui/dropdown"
import { Switch } from "@/components/ui/switch"
import FormInput from "../ui/form-input"
import { createLocationSchema, type CreateLocationFormValues } from "@/validations/location"
import { validateField } from "@/lib/utils"
import { useGetGeoOptions } from "@/hooks/useGetGeoOptions"
import { useCreateLocation } from "@/store/mutations/locations"
import { showAlert } from "@/store/alerts"

interface Props {
  isOpen: boolean
  onClose: () => void
}

export default function CreateLocationModal({ isOpen, onClose }: Props) {
  const [selectedCountry, setSelectedCountry] = useState<string>("")
  const [selectedState, setSelectedState] = useState<number | null>(null)
  const [stateName, setStateName] = useState<string>("")
  const [lgaName, setLgaName] = useState<string>("")

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
  } = useGetGeoOptions({
    selectedCountryCode: selectedCountry,
    selectedStateId: selectedState,
  })

  const create = useCreateLocation()

  const form = useForm({
    defaultValues: {
      storeName: "",
      country: "",
      state: "",
      lga: "",
      streetAddress: "",
      contactEmail: "",
      contactPhone: "",
      status: "",
      pickupEnabled: false as boolean,
      walkInEnabled: false as boolean,
      consultationEnabled: false as boolean,
      alwaysFufill: false as boolean,
    } satisfies CreateLocationFormValues,
    onSubmit: ({ value }) => {
      create.mutate(
        {
          name: value.storeName,
          address: value.streetAddress,
          city: lgaName,
          state: stateName,
          stateId: selectedState ?? undefined,
          phone: value.contactPhone,
          contactEmail: value.contactEmail,
          isActive: value.status === "active",
          supportsPickup: value.pickupEnabled,
          supportsWalkin: value.walkInEnabled,
          supportsDelivery: false,
          always_fulfill: value.alwaysFufill,
        },
        {
          onSuccess: () => {
            showAlert({ variant: "success", message: "Location created successfully" })
            onClose()
          },
          onError: (e) => showAlert({ variant: "error", message: e.message }),
        },
      )
    },
  })

  useEffect(() => {
    if (!isOpen) {
      form.reset()
      setSelectedCountry("")
      setSelectedState(null)
      setStateName("")
      setLgaName("")
    }
  }, [isOpen])

  const customFooter = (
    <div className="border-borderSubtle border-t px-4 py-4 sm:px-6">
      <div className="flex gap-2">
        <Button variant="subtle" onClick={onClose} disabled={create.isPending} className="flex-1">
          Cancel
        </Button>
        <Button
          variant="secondary"
          loading={create.isPending}
          onClick={() => form.handleSubmit()}
          className="flex-1"
        >
          Create location
        </Button>
      </div>
    </div>
  )

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      variant="dialog"
      title="Add new location"
      customFooter={customFooter}
      width="652px"
      preventClose={create.isPending}
    >
      <div className="flex flex-col gap-4 px-6 py-5">
        <form.Field
          name="storeName"
          validators={{
            onBlur: ({ value }) => validateField(createLocationSchema, "storeName", value),
          }}
        >
          {(field) => (
            <FormInput
              label="Store name"
              placeholder="Enter store name"
              value={field.state.value}
              onChange={field.handleChange}
              onBlur={field.handleBlur}
              error={field.state.meta.errors[0]?.toString()}
            />
          )}
        </form.Field>

        <div className="grid grid-cols-2 gap-3">
          <form.Field
            name="country"
            validators={{
              onBlur: ({ value }) => validateField(createLocationSchema, "country", value),
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
              onBlur: ({ value }) => validateField(createLocationSchema, "state", value),
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
          name="streetAddress"
          validators={{
            onBlur: ({ value }) => validateField(createLocationSchema, "streetAddress", value),
          }}
        >
          {(field) => (
            <FormInput
              label="Street address"
              placeholder="Enter street address"
              value={field.state.value}
              onChange={field.handleChange}
              onBlur={field.handleBlur}
              error={field.state.meta.errors[0]?.toString()}
            />
          )}
        </form.Field>

        <div className="grid grid-cols-2 gap-3">
          <form.Field
            name="contactEmail"
            validators={{
              onBlur: ({ value }) => validateField(createLocationSchema, "contactEmail", value),
            }}
          >
            {(field) => (
              <FormInput
                label="Contact email"
                placeholder="store@example.com"
                type="email"
                value={field.state.value}
                onChange={field.handleChange}
                onBlur={field.handleBlur}
                error={field.state.meta.errors[0]?.toString()}
              />
            )}
          </form.Field>
          <form.Field name="contactPhone">
            {(field) => (
              <FormInput
                label="Contact phone"
                placeholder="+234"
                type="tel"
                value={field.state.value ?? ""}
                onChange={field.handleChange}
              />
            )}
          </form.Field>
        </div>

        <form.Field
          name="status"
          validators={{
            onBlur: ({ value }) => validateField(createLocationSchema, "status", value),
          }}
        >
          {(field) => (
            <Dropdown
              label="Status"
              value={field.state.value}
              onChange={field.handleChange}
              onBlur={field.handleBlur}
              placeholder="Select status"
              options={[
                { label: "Active", value: "active" },
                { label: "Inactive", value: "inactive" },
                { label: "Draft", value: "draft" },
              ]}
              error={field.state.meta.errors[0]?.toString()}
            />
          )}
        </form.Field>

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
