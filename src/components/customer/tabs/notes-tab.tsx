import { useState } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { showAlert } from "@/store/alerts"
import { useGetCustomerNotes } from "@/store/queries/customers"
import { useAddCustomerNote } from "@/store/mutations/customers"
import { formatDateToCustomFormat } from "@/lib/utils"
import type { CustomerDetail } from "@/types/customers"

interface Props {
  customer: CustomerDetail
}

export default function NotesTab({ customer }: Props) {
  const [noteText, setNoteText] = useState("")
  const [showNoteForm, setShowNoteForm] = useState(false)

  const entityId = String(customer.entity_id)
  const { data: notes, isLoading } = useGetCustomerNotes(entityId)
  const addNote = useAddCustomerNote(entityId)

  const handleAddNote = () => {
    if (!noteText.trim()) return
    addNote.mutate(noteText, {
      onSuccess: () => {
        showAlert({ variant: "success", message: "Note added" })
        setNoteText("")
        setShowNoteForm(false)
      },
      onError: (e) => showAlert({ variant: "error", message: e.message }),
    })
  }

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-xl" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {notes && notes.length > 0 && (
        <div className="space-y-2">
          {notes.map((note) => (
            <div key={note.id} className="border-borderSubtle rounded-xl border p-4">
              <p className="font-jakarta text-brand text-sm">{note.note}</p>
              <p className="font-jakarta text-brand/40 mt-2 text-xs">
                {note.createdBy ? `${note.createdBy} · ` : ""}
                {note.createdAt ? formatDateToCustomFormat(note.createdAt, true) : ""}
              </p>
            </div>
          ))}
        </div>
      )}

      {showNoteForm && (
        <div className="border-borderSubtle rounded-xl border p-4">
          <label className="font-jakarta text-brand mb-2 block text-sm font-semibold">
            New note
          </label>
          <textarea
            rows={4}
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            placeholder="e.g. recommendations for this customer"
            className="font-jakarta text-brand placeholder:text-brand/40 focus:border-primary/40 border-borderSubtle w-full resize-none rounded-lg border bg-white px-3 py-2.5 text-sm outline-none"
          />
          <div className="mt-3 flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              disabled={addNote.isPending}
              onClick={() => {
                setNoteText("")
                setShowNoteForm(false)
              }}
            >
              Cancel
            </Button>
            <Button
              variant="secondary"
              className="flex-1"
              loading={addNote.isPending}
              onClick={handleAddNote}
            >
              Save note
            </Button>
          </div>
        </div>
      )}

      {!showNoteForm && (
        <button
          onClick={() => setShowNoteForm(true)}
          className="font-jakarta text-brand/40 hover:border-primary/30 hover:text-primary border-borderSubtle w-full rounded-xl border border-dashed py-3 text-sm transition-colors"
        >
          Add note
        </button>
      )}
    </div>
  )
}
