import { useState, useRef } from "react"
import { Plus, Upload, X } from "lucide-react"
import Modal from "@/components/ui/modal"
import { Button } from "@/components/ui/button"
import { showAlert } from "@/store/alerts"
import { useCreateCategory } from "@/store/mutations/categories"
import { validateFileSize } from "@/validations/products"

interface AddCategoryModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function AddCategoryModal({ isOpen, onClose }: AddCategoryModalProps) {
  const [name, setName] = useState("")
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const createCategory = useCreateCategory()

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

  const handleAdd = () => {
    if (!name.trim()) return
    createCategory.mutate(
      { name: name.trim(), image: imageFile ?? undefined },
      {
        onSuccess: () => {
          showAlert({ variant: "success", message: "Category created successfully" })
          handleClose()
        },
        onError: (error) => showAlert({ variant: "error", message: error.message }),
      },
    )
  }

  const handleClose = () => {
    setName("")
    removeImage()
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      preventClose={createCategory.isPending}
      variant="dialog"
      width="450px"
      hideHeader
      hideFooter
    >
      <div className="flex flex-col overflow-hidden rounded-xl bg-white">
        {/* Header */}
        <div className="border-brand/3 flex items-center justify-between border-b px-6 py-4">
          <h2 className="font-jakarta text-brand text-base font-semibold tracking-[-0.04em]">
            Add new category
          </h2>
          <button
            onClick={handleClose}
            disabled={createCategory.isPending}
            className="text-brand/40 hover:bg-brand/5 hover:text-brand flex h-7 w-7 items-center justify-center rounded-full transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Fields */}
        <div className="flex flex-col gap-4 px-6 pt-4 pb-2">
          <div className="flex flex-col gap-2">
            <label className="font-jakarta text-brand text-sm font-semibold tracking-[-0.04em]">
              Category name
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              placeholder="Enter category name"
              autoFocus
              className="border-brand/8 font-jakarta text-brand placeholder:text-brand/40 focus:border-primary/30 focus:ring-primary/20 h-10 w-full rounded-lg border bg-white/20 px-4 text-sm tracking-[-0.02em] outline-none focus:ring-1"
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
            {imagePreview ? (
              <div className="group relative h-32 w-full overflow-hidden rounded-lg">
                <img
                  src={imagePreview}
                  alt="Category preview"
                  className="border-brand/8 h-full w-full rounded-lg border object-cover"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="bg-brand/60 hover:bg-danger absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full opacity-0 transition-all group-hover:opacity-100"
                >
                  <X size={12} className="text-white" />
                </button>
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
        </div>

        {/* Actions */}
        <div className="flex gap-4 px-6 py-6">
          <Button
            variant="subtle"
            onClick={handleClose}
            disabled={createCategory.isPending}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            variant="secondary"
            onClick={handleAdd}
            loading={createCategory.isPending}
            disabled={!name.trim()}
            className="flex-1"
            beforeIcon={<Plus size={14} />}
          >
            Add category
          </Button>
        </div>
      </div>
    </Modal>
  )
}
