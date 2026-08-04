import { useState, useRef } from "react"
import { X, Upload } from "lucide-react"
import Modal from "@/components/ui/modal"
import { Button } from "@/components/ui/button"
import FormInput from "@/components/ui/form-input"
import FormTextarea from "@/components/ui/form-textarea"
import Dropdown from "@/components/ui/dropdown"
import RichTextEditor from "@/components/ui/rich-text-editor"
import { useForm } from "@tanstack/react-form"
import { validateField } from "@/lib/utils"
import { createBlogSchema, type CreateBlogFormValues } from "@/validations/blogs"
import { useCreateBlog } from "@/store/mutations/blogs"
import type { CreateBlogPayload } from "@/types/blogs"
import { cn } from "@/lib/utils"
import { validateFileSize } from "@/validations/products"
import { showAlert } from "@/store/alerts"

interface Props {
  isOpen: boolean
  onClose: () => void
}

const STATUS_OPTIONS = [
  { label: "Draft", value: "draft" },
  { label: "Published", value: "published" },
]

export default function CreateBlogModal({ isOpen, onClose }: Props) {
  const createBlog = useCreateBlog()
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [coverPreview, setCoverPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const form = useForm({
    defaultValues: {
      title: "",
      description: "",
      body: "",
      tags: "",
      status: "draft",
    } satisfies CreateBlogFormValues,
    onSubmit: ({ value }) => {
      const payload: CreateBlogPayload = {
        title: value.title,
        description: value.description,
        body: value.body,
        status: value.status as "draft" | "published",
        ...(value.tags && {
          tags: value.tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean),
        }),
        ...(coverFile && { coverImage: coverFile }),
      }
      createBlog.mutate(payload, {
        onSuccess: () => {
          onClose()
          setCoverFile(null)
          setCoverPreview(null)
        },
      })
    },
  })

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const err = validateFileSize(file)
    if (err) {
      showAlert({ variant: "error", message: err })
      e.target.value = ""
      return
    }
    setCoverFile(file)
    const url = URL.createObjectURL(file)
    setCoverPreview(url)
  }

  const customHeader = (
    <div className="border-line shrink-0 border-b px-6 py-4">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="font-jakarta text-brand text-base font-semibold tracking-[-0.04em]">
            Create blog post
          </h2>
          <p className="font-jakarta text-brand/60 mt-0.5 text-sm font-medium tracking-[-0.04em]">
            Write and publish a new article
          </p>
        </div>
        <button
          onClick={onClose}
          className="text-brand/40 hover:text-brand ml-4 shrink-0 rounded p-0.5 transition-colors"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  )

  const customFooter = (
    <div className="border-borderSubtle shrink-0 border-t p-4 sm:p-6">
      <div className="flex gap-3">
        <Button
          variant="subtle"
          onClick={onClose}
          disabled={createBlog.isPending}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button
          variant="secondary"
          onClick={() => form.handleSubmit()}
          loading={createBlog.isPending}
          className="flex-1"
        >
          Save post
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
      preventClose={createBlog.isPending}
      width="60vw"
    >
      <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
        {/* Title */}
        <form.Field
          name="title"
          validators={{ onBlur: ({ value }) => validateField(createBlogSchema, "title", value) }}
        >
          {(field) => (
            <FormInput
              label="Title"
              value={field.state.value}
              onChange={field.handleChange}
              onBlur={field.handleBlur}
              placeholder="e.g. The Ultimate Guide to Skincare"
              error={field.state.meta.errors[0]?.toString()}
            />
          )}
        </form.Field>

        {/* Description */}
        <form.Field
          name="description"
          validators={{
            onBlur: ({ value }) => validateField(createBlogSchema, "description", value),
          }}
        >
          {(field) => (
            <FormTextarea
              label="Description (excerpt)"
              value={field.state.value}
              onChange={field.handleChange}
              onBlur={field.handleBlur}
              placeholder="A short summary shown in blog listings…"
              error={field.state.meta.errors[0]?.toString()}
              rows={3}
            />
          )}
        </form.Field>

        {/* Cover image upload */}
        <div className="flex flex-col gap-1.5">
          <label className="font-jakarta text-brand text-xs font-semibold">
            Cover image <span className="text-brand/40 font-normal">(optional)</span>
          </label>
          <div
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              "border-borderSubtle hover:border-brand/30 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-6 transition-colors",
              coverPreview && "p-2",
            )}
          >
            {coverPreview ? (
              <img
                src={coverPreview}
                alt="Cover preview"
                className="h-40 w-full rounded-lg object-cover"
              />
            ) : (
              <>
                <div className="bg-brand/5 flex h-10 w-10 items-center justify-center rounded-full">
                  <Upload size={18} className="text-brand/50" />
                </div>
                <p className="font-jakarta text-brand/60 text-sm">Click to upload cover image</p>
                <p className="font-jakarta text-brand/30 text-xs">PNG, JPG up to 5MB</p>
              </>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>

        {/* Tags */}
        <form.Field name="tags">
          {(field) => (
            <FormInput
              label="Tags"
              value={field.state.value}
              onChange={field.handleChange}
              onBlur={field.handleBlur}
              placeholder="Separate with commas, e.g. skincare, tips"
            />
          )}
        </form.Field>

        {/* Status */}
        <form.Field
          name="status"
          validators={{ onBlur: ({ value }) => validateField(createBlogSchema, "status", value) }}
        >
          {(field) => (
            <Dropdown
              label="Status"
              options={STATUS_OPTIONS}
              value={field.state.value}
              onChange={field.handleChange}
              onBlur={field.handleBlur}
              placeholder="Select status"
              error={field.state.meta.errors[0]?.toString()}
            />
          )}
        </form.Field>

        {/* Body */}
        <form.Field
          name="body"
          validators={{ onBlur: ({ value }) => validateField(createBlogSchema, "body", value) }}
        >
          {(field) => (
            <div className="flex flex-col gap-1.5">
              <label className="font-jakarta text-brand text-xs font-semibold">Content</label>
              <RichTextEditor
                value={field.state.value}
                onChange={field.handleChange}
                placeholder="Write your blog content here…"
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
    </Modal>
  )
}
