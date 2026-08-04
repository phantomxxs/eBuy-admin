import { useEffect } from "react"
import { useForm } from "@tanstack/react-form"
import Modal from "@/components/ui/modal"
import { Button } from "@/components/ui/button"
import Dropdown from "@/components/ui/dropdown"
import FormInput from "@/components/ui/form-input"
import { DatePicker } from "@/components/ui/date-picker"
import { Switch } from "@/components/ui/switch"
import type { Banner } from "@/types/banners"
import { useUpdateBanner } from "@/store/mutations/banners"
import { useGetBannerById } from "@/store/queries/banners"

interface Props {
  isOpen: boolean
  onClose: () => void
  banner: Banner | null
}

const BANNER_TYPE_OPTIONS = [
  { label: "Promotional", value: "promotional" },
  { label: "Announcement", value: "announcement" },
]

const PLACEMENT_OPTIONS = [
  { label: "Homepage hero", value: "homepage" },
  { label: "Product page", value: "product_page" },
  { label: "Checkout", value: "checkout_page" },
]

const AUDIENCE_OPTIONS = [
  { label: "All customers", value: "all_customers" },
  { label: "New customers", value: "new_customers" },
  { label: "VIP", value: "vip_customers" },
]

export default function EditBannerModal({ isOpen, onClose, banner }: Props) {
  const updateBanner = useUpdateBanner()
  const { data: detail } = useGetBannerById(isOpen ? (banner?.id ?? null) : null)

  const form = useForm({
    defaultValues: {
      bannerName: "",
      bannerType: "",
      placement: "",
      targetAudience: "",
      isHeroBanner: false as boolean,
      cta: "",
      ctaLink: "",
      startDate: "",
      endDate: "",
    },
    onSubmit: ({ value }) => {
      if (!banner) return
      updateBanner.mutate(
        {
          id: banner.id,
          payload: {
            name: value.bannerName,
            type: value.bannerType,
            placement: value.placement,
            targetAudience: value.targetAudience,
            ctaLabel: value.cta || undefined,
            ctaLink: value.ctaLink || undefined,
            startDate: value.startDate,
            endDate:
              value.endDate === value.startDate ? `${value.endDate}T23:59:00` : value.endDate,
          },
        },
        { onSuccess: onClose },
      )
    },
  })

  useEffect(() => {
    if (!banner || !isOpen) return
    form.setFieldValue("bannerName", banner.title)
    form.setFieldValue("bannerType", banner.typeValue)
    form.setFieldValue("placement", banner.placementValue)
    form.setFieldValue("targetAudience", banner.targetAudienceValue)
    form.setFieldValue("isHeroBanner", banner.isHeroBanner)
    form.setFieldValue("startDate", banner.startDate)
    form.setFieldValue("endDate", banner.endDate)
  }, [banner, isOpen])

  useEffect(() => {
    if (!detail || !isOpen) return
    form.setFieldValue("cta", detail.ctaLabel ?? "")
    form.setFieldValue("ctaLink", detail.ctaLink ?? "")
  }, [detail, isOpen])

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      variant="dialog"
      title="Edit banner"
      preventClose={updateBanner.isPending}
      customFooter={
        <div className="border-borderSubtle flex gap-2 border-t px-6 py-4">
          <Button
            variant="subtle"
            onClick={onClose}
            disabled={updateBanner.isPending}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            variant="secondary"
            onClick={() => form.handleSubmit()}
            loading={updateBanner.isPending}
            className="flex-1"
          >
            Save changes
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-4 px-6 py-5">
        {detail?.imageUrl && (
          <div className="border-borderSubtle overflow-hidden rounded-lg border">
            <img src={detail.imageUrl} alt={detail.title} className="h-32 w-full object-cover" />
          </div>
        )}

        <form.Field name="bannerName">
          {(field) => (
            <FormInput
              label="Banner name"
              value={field.state.value}
              onChange={field.handleChange}
              onBlur={field.handleBlur}
              placeholder="e.g. Summer Sale Banner"
            />
          )}
        </form.Field>

        <div className="grid grid-cols-2 gap-3">
          <form.Field name="bannerType">
            {(field) => (
              <Dropdown
                label="Banner type"
                value={field.state.value}
                onChange={field.handleChange}
                placeholder="Select type"
                options={BANNER_TYPE_OPTIONS}
                disabled
              />
            )}
          </form.Field>
          <form.Field name="placement">
            {(field) => (
              <Dropdown
                label="Placement"
                value={field.state.value}
                onChange={field.handleChange}
                placeholder="Select placement"
                options={PLACEMENT_OPTIONS}
              />
            )}
          </form.Field>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <form.Field name="targetAudience">
            {(field) => (
              <Dropdown
                label="Target audience"
                value={field.state.value}
                onChange={field.handleChange}
                placeholder="Select audience"
                options={AUDIENCE_OPTIONS}
              />
            )}
          </form.Field>
          <form.Field name="cta">
            {(field) => (
              <FormInput
                label="CTA"
                value={field.state.value}
                onChange={field.handleChange}
                placeholder="e.g. Shop now"
              />
            )}
          </form.Field>
        </div>

        <form.Field name="ctaLink">
          {(field) => (
            <FormInput
              label="CTA link / deep link"
              value={field.state.value}
              onChange={field.handleChange}
              placeholder="https://"
            />
          )}
        </form.Field>

        {/* Hero banner — read-only on edit */}
        <form.Field name="isHeroBanner">
          {(field) => (
            <div className="flex items-center justify-between">
              <div>
                <p className="font-jakarta text-brand text-sm font-medium">Hero banner</p>
                <p className="font-jakarta text-brand/50 text-xs">
                  Cannot be changed after creation
                </p>
              </div>
              <Switch size="lg" checked={field.state.value} disabled />
            </div>
          )}
        </form.Field>

        <div className="grid grid-cols-2 gap-3">
          <form.Field name="startDate">
            {(field) => (
              <div className="flex flex-col gap-1.5">
                <label className="font-jakarta text-brand text-xs font-semibold">Start date</label>
                <DatePicker
                  value={field.state.value ?? ""}
                  onChange={(v) => {
                    field.handleChange(v)
                    field.handleBlur()
                  }}
                  placeholder="Pick start date"
                />
              </div>
            )}
          </form.Field>
          <form.Field
            name="endDate"
            validators={{
              onBlur: ({ value, fieldApi }) => {
                const start = fieldApi.form.getFieldValue("startDate")
                if (start && value && value < start)
                  return "End date must be on or after start date"
              },
            }}
          >
            {(field) => (
              <div className="flex flex-col gap-1.5">
                <label className="font-jakarta text-brand text-xs font-semibold">End date</label>
                <DatePicker
                  value={field.state.value ?? ""}
                  onChange={(v) => {
                    field.handleChange(v)
                    field.handleBlur()
                  }}
                  placeholder="Pick end date"
                  minDate={
                    form.getFieldValue("startDate")
                      ? new Date(form.getFieldValue("startDate") + "T00:00:00")
                      : undefined
                  }
                />
                {field.state.meta.errors[0] && (
                  <p className="font-jakarta text-destructive text-xs">
                    {field.state.meta.errors[0].toString()}
                  </p>
                )}
              </div>
            )}
          </form.Field>
        </div>
      </div>
    </Modal>
  )
}
