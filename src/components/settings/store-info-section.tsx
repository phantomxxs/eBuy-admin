import { useEffect, useRef, useState } from "react"
import { useForm } from "@tanstack/react-form"
import { useStore } from "@tanstack/react-store"
import { validateField } from "@/lib/utils"
import { useGetBrandBusiness } from "@/store/queries/settings"
import { useUpdateBrandBusiness } from "@/store/mutations/settings"
import { showAlert } from "@/store/alerts"
import { useGetGeoOptions } from "@/hooks/useGetGeoOptions"
import FormInput from "@/components/ui/form-input"
import FormTextarea from "@/components/ui/form-textarea"
import Dropdown from "@/components/ui/dropdown"
import { storeInfoSchema, type StoreInfoFormValues } from "@/validations/settings"
import { SectionLoading } from "./shared"

const CURRENCY_OPTIONS = [
  { label: "NGN - Nigerian Naira (₦)", value: "NGN" },
  { label: "USD - US Dollar ($)", value: "USD" },
  { label: "GBP - British Pound (£)", value: "GBP" },
  { label: "EUR - Euro (€)", value: "EUR" },
]

type Props = {
  registerSave: (fn: () => void) => void
  registerDirty: (dirty: boolean) => void
}

export default function StoreInfoSection({ registerSave, registerDirty }: Props) {
  const { data: settings, isLoading } = useGetBrandBusiness()
  const updateBrandBusiness = useUpdateBrandBusiness()

  const [selectedStateId, setSelectedStateId] = useState<number | null>(null)
  const { stateOptions, lgaOptions } = useGetGeoOptions({
    selectedCountryCode: "NG",
    selectedStateId,
  })

  const form = useForm({
    defaultValues: {
      brandName: "",
      businessEmail: "",
      supportEmail: "",
      storePhone: "",
      websiteUrl: "",
      currency: "NGN",
      rcNumber: "",
      tin: "",
      stateId: "",
      lgaId: "",
      registeredHeadOffice: "",
      storeDescription: "",
    } satisfies StoreInfoFormValues,
    onSubmit: async ({ value }) => {
      updateBrandBusiness.mutate(
        {
          brand_name: value.brandName,
          business_email: value.businessEmail,
          support_email: value.supportEmail || undefined,
          store_phone: value.storePhone || undefined,
          website_url: value.websiteUrl || undefined,
          currency_code: value.currency,
          rc_number: value.rcNumber || undefined,
          tin: value.tin || undefined,
          registered_head_office: value.registeredHeadOffice || undefined,
          store_description: value.storeDescription || undefined,
        },
        {
          onSuccess: () =>
            showAlert({ variant: "success", message: "Brand & Business settings saved" }),
          onError: (e) => showAlert({ variant: "error", message: e.message }),
        },
      )
    },
  })

  useEffect(() => {
    if (!settings) return
    form.setFieldValue("brandName", settings.brand_name ?? "")
    form.setFieldValue("businessEmail", settings.business_email ?? "")
    form.setFieldValue("supportEmail", settings.support_email ?? "")
    form.setFieldValue("storePhone", settings.store_phone ?? "")
    form.setFieldValue("websiteUrl", settings.website_url ?? "")
    form.setFieldValue("currency", settings.currency_code ?? "NGN")
    form.setFieldValue("rcNumber", settings.rc_number ?? "")
    form.setFieldValue("tin", settings.tin ?? "")
    form.setFieldValue("stateId", settings.state_id ? String(settings.state_id) : "")
    form.setFieldValue("lgaId", settings.lga_id ? String(settings.lga_id) : "")
    form.setFieldValue("registeredHeadOffice", settings.registered_head_office ?? "")
    form.setFieldValue("storeDescription", settings.store_description ?? "")
    setSelectedStateId(settings.state_id ?? null)
  }, [settings])

  const isDirty = useStore(form.store, (s) => s.isDirty)
  useEffect(() => {
    registerDirty(isDirty)
  }, [isDirty, registerDirty])

  const saveFnRef = useRef(() => form.handleSubmit())
  saveFnRef.current = () => form.handleSubmit()

  useEffect(() => {
    registerSave(() => saveFnRef.current())
  }, [registerSave])

  if (isLoading) return <SectionLoading />

  return (
    <div className="border-borderSubtle overflow-hidden rounded-xl border bg-white">
      <div className="border-borderSubtle border-b px-6 py-4">
        <p className="font-jakarta text-brand/50 text-xs font-semibold tracking-widest uppercase">
          Store information
        </p>
      </div>
      <div className="grid grid-cols-1 gap-4 p-6 lg:grid-cols-2">
        <form.Field
          name="brandName"
          validators={{ onBlur: ({ value }) => validateField(storeInfoSchema, "brandName", value) }}
        >
          {(field) => (
            <FormInput
              label="Brand name"
              placeholder="e.g. eBuy"
              value={field.state.value}
              onChange={field.handleChange}
              onBlur={field.handleBlur}
              error={field.state.meta.errors[0]?.toString()}
            />
          )}
        </form.Field>
        <form.Field
          name="businessEmail"
          validators={{
            onBlur: ({ value }) => validateField(storeInfoSchema, "businessEmail", value),
          }}
        >
          {(field) => (
            <FormInput
              label="Business email"
              type="email"
              placeholder="hello@yourbrand.com"
              value={field.state.value}
              onChange={field.handleChange}
              onBlur={field.handleBlur}
              error={field.state.meta.errors[0]?.toString()}
            />
          )}
        </form.Field>
        <form.Field name="supportEmail">
          {(field) => (
            <FormInput
              label="Support email"
              type="email"
              placeholder="support@yourbrand.com"
              value={field.state.value ?? ""}
              onChange={field.handleChange}
            />
          )}
        </form.Field>
        <form.Field name="storePhone">
          {(field) => (
            <FormInput
              label="Store phone number"
              placeholder="+234 800 000 0000"
              value={field.state.value ?? ""}
              onChange={field.handleChange}
            />
          )}
        </form.Field>
        <form.Field name="websiteUrl">
          {(field) => (
            <FormInput
              label="Website link"
              placeholder="https://yourbrand.com"
              value={field.state.value ?? ""}
              onChange={field.handleChange}
            />
          )}
        </form.Field>
        <form.Field
          name="currency"
          validators={{ onBlur: ({ value }) => validateField(storeInfoSchema, "currency", value) }}
        >
          {(field) => (
            <Dropdown
              label="Currency"
              options={CURRENCY_OPTIONS}
              value={field.state.value}
              onChange={field.handleChange}
              error={field.state.meta.errors[0]?.toString()}
            />
          )}
        </form.Field>
        <form.Field name="rcNumber">
          {(field) => (
            <FormInput
              label="RC Number (CAC)"
              placeholder="RC-0000000"
              value={field.state.value ?? ""}
              onChange={field.handleChange}
            />
          )}
        </form.Field>
        <form.Field name="tin">
          {(field) => (
            <FormInput
              label="Tax ID (TIN)"
              placeholder="00-000000-0000"
              value={field.state.value ?? ""}
              onChange={field.handleChange}
            />
          )}
        </form.Field>
        <form.Field name="stateId">
          {(field) => (
            <Dropdown
              label="State"
              options={stateOptions}
              value={field.state.value ?? ""}
              onChange={(v) => {
                field.handleChange(v)
                form.setFieldValue("lgaId", "")
                setSelectedStateId(Number(v) || null)
              }}
              placeholder="Select state"
            />
          )}
        </form.Field>
        <form.Field name="lgaId">
          {(field) => (
            <Dropdown
              label="LGA"
              options={lgaOptions}
              value={field.state.value ?? ""}
              onChange={field.handleChange}
              placeholder="Select LGA"
              disabled={!selectedStateId || lgaOptions.length === 0}
            />
          )}
        </form.Field>
        <form.Field name="registeredHeadOffice">
          {(field) => (
            <FormInput
              label="Registered head office"
              placeholder="14 Kofo Abayomi Street, Victoria Island, Lagos"
              value={field.state.value ?? ""}
              onChange={field.handleChange}
              className="lg:col-span-2"
            />
          )}
        </form.Field>
        <form.Field name="storeDescription">
          {(field) => (
            <FormTextarea
              label="Store description"
              placeholder="A brief description of your brand…"
              value={field.state.value ?? ""}
              onChange={field.handleChange}
              rows={4}
              className="lg:col-span-2"
            />
          )}
        </form.Field>
      </div>
    </div>
  )
}
