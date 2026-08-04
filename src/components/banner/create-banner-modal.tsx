import { useRef } from "react"
import { useForm } from "@tanstack/react-form"
import { ImagePlus, X } from "lucide-react"
import Modal from "@/components/ui/modal"
import { Button } from "@/components/ui/button"
import FormInput from "@/components/ui/form-input"
import { DatePicker } from "@/components/ui/date-picker"
import { Switch } from "@/components/ui/switch"
import Dropdown from "@/components/ui/dropdown"
import { bannerSchema, type BannerFormValues } from "@/validations/banner"
import { validateField } from "@/lib/utils"
import { useCreateBanner } from "@/store/mutations/banners"
import type { CreateBannerPayload } from "@/types/banners"
import { validateFileSize } from "@/validations/products"
import { showAlert } from "@/store/alerts"

const BANNER_TYPE_OPTIONS = [
  { label: "Promotional", value: "promotional" },
  { label: "Announcement", value: "announcement" },
]

interface Props {
  isOpen: boolean
  onClose: () => void
}

export default function CreateBannerModal({ isOpen, onClose }: Props) {
  const createBanner = useCreateBanner()
  const saveModeRef = useRef<"activate" | "draft">("activate")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const form = useForm({
    defaultValues: {
      isHeroBanner: false as boolean,
      image: undefined as File | undefined,
      bannerName: "",
      bannerType: "promotional",
      cta: "" as string,
      ctaLink: "" as string,
      startDate: "",
      endDate: "",
    } satisfies BannerFormValues,
    onSubmit: ({ value }) => {
      const payload: CreateBannerPayload = {
        name: value.bannerName,
        placement: "homepage",
        targetAudience: "all_customers",
        bannerType: value.bannerType,
        isHeroBanner: value.isHeroBanner,
        image: value.image,
        ctaLabel: value.cta || undefined,
        ctaLink: value.ctaLink || undefined,
        startDate: value.startDate,
        endDate: value.endDate === value.startDate ? `${value.endDate}T23:59:00` : value.endDate,
        saveMode: saveModeRef.current,
      }
      createBanner.mutate(payload, {
        onSuccess: () => {
          form.reset()
          onClose()
        },
      })
    },
  })

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      variant="dialog"
      title="Create banner"
      hideFooter
      preventClose={createBanner.isPending}
      customFooter={
        <div className="border-borderSubtle border-t px-4 py-4 sm:px-6">
          <div className="flex gap-2">
            <Button
              variant="subtle"
              onClick={() => {
                saveModeRef.current = "draft"
                form.handleSubmit()
              }}
              disabled={createBanner.isPending}
              loading={createBanner.isPending}
              className="flex-1"
            >
              Save as draft
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                saveModeRef.current = "activate"
                form.handleSubmit()
              }}
              loading={createBanner.isPending}
              className="flex-1"
            >
              Create &amp; activate
            </Button>
          </div>
        </div>
      }
    >
      <div className="flex flex-col gap-4 px-6 py-5">
        {/* Hero toggle — first */}
        <form.Field name="isHeroBanner">
          {(field) => (
            <div className="bg-statusSuccessBg/40 flex items-center justify-between rounded-lg px-4 py-3">
              <div>
                <p className="font-jakarta text-brand text-sm font-semibold">Hero banner</p>
                <p className="font-jakarta text-hint text-xs">
                  Displays prominently in the homepage hero section
                </p>
              </div>
              <Switch size="lg" checked={field.state.value} onCheckedChange={field.handleChange} />
            </div>
          )}
        </form.Field>

        {/* Image upload — only when hero */}
        <form.Subscribe selector={(s) => s.values.isHeroBanner}>
          {(isHero) =>
            isHero ? (
              <form.Field
                name="image"
                validators={{
                  onSubmit: ({ value }) => {
                    if (!value) return "Banner image is required for hero banners"
                  },
                }}
              >
                {(field) => (
                  <div className="flex flex-col gap-1.5">
                    <label className="font-jakarta text-brand text-xs font-semibold">
                      Banner image
                    </label>
                    {field.state.value ? (
                      <div className="border-borderSubtle relative overflow-hidden rounded-lg border">
                        <img
                          src={URL.createObjectURL(field.state.value)}
                          alt="Banner preview"
                          className="h-36 w-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => field.handleChange(undefined)}
                          className="bg-brand/60 absolute top-2 right-2 rounded-full p-1 text-white backdrop-blur-sm"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="border-borderSubtle text-brand/40 hover:border-primary/40 hover:text-primary/60 flex h-36 w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed transition-colors"
                      >
                        <ImagePlus size={20} />
                        <span className="font-jakarta text-xs">Click to upload image</span>
                      </button>
                    )}
                    <p className="font-jakarta text-hint text-xs">
                      Accepted formats: JPEG, PNG, GIF, WebP
                    </p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/gif,image/webp"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) {
                          const err = validateFileSize(file)
                          if (err) {
                            showAlert({ variant: "error", message: err })
                            e.target.value = ""
                            return
                          }
                          field.handleChange(file)
                        }
                        e.target.value = ""
                      }}
                    />
                    {field.state.meta.errors[0] && (
                      <p className="font-jakarta text-destructive text-xs">
                        {field.state.meta.errors[0].toString()}
                      </p>
                    )}
                  </div>
                )}
              </form.Field>
            ) : null
          }
        </form.Subscribe>

        {/* Banner name */}
        <form.Field
          name="bannerName"
          validators={{ onBlur: ({ value }) => validateField(bannerSchema, "bannerName", value) }}
        >
          {(field) => (
            <FormInput
              label="Banner name"
              value={field.state.value}
              onChange={field.handleChange}
              onBlur={field.handleBlur}
              placeholder="e.g. Summer Sale Banner"
              error={field.state.meta.errors[0]?.toString()}
            />
          )}
        </form.Field>

        {/* Banner type */}
        <form.Field
          name="bannerType"
          validators={{ onBlur: ({ value }) => validateField(bannerSchema, "bannerType", value) }}
        >
          {(field) => (
            <Dropdown
              label="Banner type"
              value={field.state.value}
              onChange={field.handleChange}
              onBlur={field.handleBlur}
              placeholder="Select type"
              options={BANNER_TYPE_OPTIONS}
              error={field.state.meta.errors[0]?.toString()}
            />
          )}
        </form.Field>

        {/* CTA */}
        <div className="grid grid-cols-2 gap-3">
          <form.Field
            name="cta"
            validators={{ onBlur: ({ value }) => validateField(bannerSchema, "cta", value) }}
          >
            {(field) => (
              <FormInput
                label="CTA label"
                value={field.state.value ?? ""}
                onChange={field.handleChange}
                onBlur={field.handleBlur}
                placeholder="e.g. Shop now"
                error={field.state.meta.errors[0]?.toString()}
              />
            )}
          </form.Field>
          <form.Field
            name="ctaLink"
            validators={{ onBlur: ({ value }) => validateField(bannerSchema, "ctaLink", value) }}
          >
            {(field) => (
              <FormInput
                label="CTA link"
                value={field.state.value ?? ""}
                onChange={field.handleChange}
                onBlur={field.handleBlur}
                placeholder="https://"
                error={field.state.meta.errors[0]?.toString()}
              />
            )}
          </form.Field>
        </div>

        {/* Time period */}
        <div className="grid grid-cols-2 gap-3">
          <form.Field
            name="startDate"
            validators={{
              onBlur: ({ value }) => {
                if (!value) return "Start date is required"
              },
            }}
          >
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
                  minDate={new Date()}
                />
                {field.state.meta.errors[0] && (
                  <p className="font-jakarta text-destructive text-xs">
                    {field.state.meta.errors[0].toString()}
                  </p>
                )}
              </div>
            )}
          </form.Field>
          <form.Field
            name="endDate"
            validators={{
              onBlur: ({ value, fieldApi }) => {
                const start = fieldApi.form.getFieldValue("startDate")
                if (!value) return "End date is required"
                if (start && value < start) return "End date must be on or after start date"
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
                      : new Date()
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
