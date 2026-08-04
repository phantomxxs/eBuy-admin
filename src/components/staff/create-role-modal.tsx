import { useState } from "react"
import Modal from "@/components/ui/modal"
import FormInput from "@/components/ui/form-input"
import FormTextarea from "@/components/ui/form-textarea"
import { cn } from "@/lib/utils"
import { useGetPermissions } from "@/store/queries/staff"
import { useCreateRole } from "@/store/mutations/staff"
import { showAlert } from "@/store/alerts"

interface CreateRoleModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function CreateRoleModal({ isOpen, onClose }: CreateRoleModalProps) {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [selected, setSelected] = useState<string[]>([])

  const { data: permissionGroups = [] } = useGetPermissions()
  const { mutate: createRole, isPending } = useCreateRole()

  const toggle = (key: string) =>
    setSelected((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]))

  const toggleGroup = (keys: string[]) => {
    const allOn = keys.every((k) => selected.includes(k))
    setSelected((prev) =>
      allOn ? prev.filter((k) => !keys.includes(k)) : [...new Set([...prev, ...keys])],
    )
  }

  const handleClose = () => {
    setName("")
    setDescription("")
    setSelected([])
    onClose()
  }

  const handleSubmit = () => {
    if (!name.trim()) return
    createRole(
      { name: name.trim(), description: description.trim(), permissions: selected },
      {
        onSuccess: () => {
          showAlert({ variant: "success", message: "Role created successfully" })
          handleClose()
        },
        onError: (error) => showAlert({ variant: "error", message: error.message }),
      },
    )
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      variant="drawer"
      position="right"
      title="Create role"
      primaryText="Create role"
      onClick={handleSubmit}
      loading={isPending}
      disabled={!name.trim()}
      width="652px"
      preventClose={isPending}
    >
      <div className="space-y-5 px-6 py-5">
        <FormInput
          label="Role name"
          value={name}
          onChange={setName}
          placeholder="e.g. Warehouse Staff"
        />
        <FormTextarea
          label="Description"
          value={description}
          onChange={setDescription}
          placeholder="Briefly describe what this role can do"
          rows={3}
        />

        <div>
          <p className="font-jakarta text-brand mb-3 text-sm font-semibold">Permissions</p>
          <div className="space-y-4">
            {permissionGroups.map((group) => {
              const groupKeys = group.permissions.map((p) => p.key)
              const allOn = groupKeys.every((k) => selected.includes(k))
              const someOn = groupKeys.some((k) => selected.includes(k))
              return (
                <div key={group.key} className="border-borderSubtle rounded-lg border">
                  {/* Group header */}
                  <button
                    type="button"
                    onClick={() => toggleGroup(groupKeys)}
                    className="border-borderSubtle flex w-full items-center justify-between border-b px-4 py-2.5"
                  >
                    <span className="font-jakarta text-brand text-sm font-semibold">
                      {group.label}
                    </span>
                    <input
                      type="checkbox"
                      readOnly
                      checked={allOn}
                      ref={(el) => {
                        if (el) el.indeterminate = someOn && !allOn
                      }}
                      className="accent-primary h-4 w-4 rounded border-gray-300"
                    />
                  </button>
                  {/* Permissions */}
                  <div className="divide-borderSubtle divide-y">
                    {group.permissions.map(({ key, label }) => (
                      <label
                        key={key}
                        className="flex cursor-pointer items-center justify-between px-4 py-2.5"
                      >
                        <span
                          className={cn(
                            "font-jakarta text-sm",
                            selected.includes(key) ? "text-brand" : "text-brand/60",
                          )}
                        >
                          {label}
                        </span>
                        <input
                          type="checkbox"
                          checked={selected.includes(key)}
                          onChange={() => toggle(key)}
                          className="accent-primary h-4 w-4 rounded border-gray-300"
                        />
                      </label>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </Modal>
  )
}
