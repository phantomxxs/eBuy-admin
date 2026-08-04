import { useState, useEffect, useRef } from "react"
import { Upload, X } from "lucide-react"
import Modal from "@/components/ui/modal"
import Dropdown from "@/components/ui/dropdown"
import { Button } from "@/components/ui/button"
import { showAlert } from "@/store/alerts"
import { useUpdateCategory, useUpdateCategoryStatus } from "@/store/mutations/categories"
import { validateFileSize } from "@/validations/products"
import type { Category } from "@/types/categories"

interface EditCategoryModalProps {
  isOpen: boolean
  onClose: () => void
  category: Category | null
}

export default function EditCategoryModal({ isOpen, onClose, category }: EditCategoryModalProps) {
  const [name, setName] = useState("")
  const [status, setStatus] = useState<Category["status"]>("active")
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const updateCategory = useUpdateCategory()
  const updateCategoryStatus = useUpdateCategoryStatus()

  useEffect(() => {
    if (!isOpen || !category) return
    setName(category.name)
    setStatus(category.status)
    setImageFile(null)
    setImagePreview(null)
  }, [category, isOpen])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const err = validateFileSize(file)
    if (err) {
      showAlert({ variant: "error", message: err })
      e.target.value = ""
      return
    }
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const removeImage = () => {
    setImageFile(null)
    setImagePreview(null)
    if (fileRef.current) fileRef.current.value = ""
  }

  const handleSave = () => {
    if (!name.trim() || !category) return
    const id = String(category.category_id)

    updateCategory.mutate(
      { id, name: name.trim(), image: imageFile ?? undefined },
      {
        onSuccess: () => {
          if (status !== category.status) {
            updateCategoryStatus.mutate(
              { id, status },
              {
                onSuccess: () => {
                  showAlert({ variant: "success", message: "Category updated successfully" })
                  onClose()
                },
                onError: (error) => showAlert({ variant: "error", message: error.message }),
              },
            )
          } else {
            showAlert({ variant: "success", message: "Category updated successfully" })
            onClose()
          }
        },
        onError: (error) => showAlert({ variant: "error", message: error.message }),
      },
    )
  }

  const isPending = updateCategory.isPending || updateCategoryStatus.isPending

  // Current image: newly picked file preview, or existing image_url
  const displayPreview = imagePreview ?? category?.image_url ?? null

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      preventClose={isPending}
      variant="dialog"
      width="450px"
      hideHeader
      hideFooter
    >
      <div className="flex flex-col overflow-hidden rounded-xl bg-white">
        {/* Header */}
        <div className="border-brand/3 flex items-center justify-between border-b px-6 py-4">
          <h2 className="font-jakarta text-brand text-base font-semibold tracking-[-0.04em]">
            Edit category
          </h2>
          <button
            onClick={onClose}
            disabled={isPending}
            className="text-brand/40 hover:bg-brand/5 hover:text-brand flex h-7 w-7 items-center justify-center rounded-full transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Fields */}
        <div className="flex flex-col gap-4 px-6 pt-5 pb-2">
          <div className="flex flex-col gap-2">
            <label className="font-jakarta text-brand text-sm font-semibold tracking-[-0.04em]">
              Category name
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSave()}
              placeholder="Enter category name"
              autoFocus
              className="font-jakarta text-brand placeholder:text-brand/40 border-brand/8 focus:border-primary/30 focus:ring-primary/20 h-10 w-full rounded-lg border bg-white/20 px-4 text-sm tracking-[-0.02em] outline-none focus:ring-1"
            />
          </div>

          {/* Image upload */}
          <div className="flex flex-col gap-2">
            <label className="font-jakarta text-brand text-sm font-semibold tracking-[-0.04em]">
              Category image
              <span className="text-brand/40 ml-1 font-normal">(optional)</span>
            </label>
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              className="hidden"
              onChange={handleImageChange}
            />
            {displayPreview ? (
              <div className="group relative h-32 w-full overflow-hidden rounded-lg">
                <img
                  src={displayPreview}
                  alt="Category image"
                  className="border-brand/8 h-full w-full rounded-lg border object-cover"
                />
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 transition-all group-hover:opacity-100">
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="bg-brand/60 hover:bg-primary flex h-6 w-6 items-center justify-center rounded-full"
                  >
                    <Upload size={10} className="text-white" />
                  </button>
                  {imageFile && (
                    <button
                      type="button"
                      onClick={removeImage}
                      className="bg-brand/60 hover:bg-danger flex h-6 w-6 items-center justify-center rounded-full"
                    >
                      <X size={10} className="text-white" />
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="border-brand/8 hover:bg-brand/5 flex h-24 w-full items-center justify-center gap-2 rounded-lg border border-dashed bg-white/20 transition-colors"
              >
                <Upload size={14} className="text-brand/40" />
                <span className="font-jakarta text-brand/50 text-sm">Upload image</span>
              </button>
            )}
          </div>

          <Dropdown
            label="Status"
            value={status}
            onChange={(v) => setStatus(v as Category["status"])}
            options={[
              { label: "Active", value: "active" },
              { label: "Inactive", value: "inactive" },
            ]}
          />
        </div>

        {/* Actions */}
        <div className="flex gap-4 px-6 py-6">
          <Button variant="subtle" onClick={onClose} disabled={isPending} className="flex-1">
            Cancel
          </Button>
          <Button
            variant="secondary"
            onClick={handleSave}
            loading={isPending}
            disabled={!name.trim()}
            className="flex-1"
          >
            Save changes
          </Button>
        </div>
      </div>
    </Modal>
  )
}
