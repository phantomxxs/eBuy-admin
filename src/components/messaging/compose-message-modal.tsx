import { useState } from "react"
import { useForm, useStore } from "@tanstack/react-form"
import {
  X,
  Users,
  Briefcase,
  ArrowRight,
  ArrowLeft,
  Upload,
  ChevronLeft,
  Send,
  Trash2,
} from "lucide-react"
import { cn } from "@/lib/utils"
import Modal from "@/components/ui/modal"
import { Button } from "@/components/ui/button"
import Dropdown from "@/components/ui/dropdown"
import { StatusBadge } from "@/components/ui/data-table"
import DeleteConfirmModal from "@/components/ui/delete-confirm-modal"
import { CHANNEL_COLORS } from "@/components/table-columns/messages"
import type { Message } from "@/types/messages"
import FormInput from "../ui/form-input"

// ── Types ─────────────────────────────────────────────────────────────────────

type AudienceType = "customers" | "staff"
type ChannelType = "Email" | "Push" | "SMS" | "In-App"
type ScheduleType = "now" | "later"

interface ComposeState {
  audience: AudienceType
  customerSegment: string
  channels: ChannelType[]
  messageTitle: string
  messageBody: string
  ctaText: string
  ctaLink: string
  schedule: ScheduleType
  scheduleDate: string
  scheduleTime: string
}

const INITIAL_STATE: ComposeState = {
  audience: "customers",
  customerSegment: "",
  channels: [],
  messageTitle: "",
  messageBody: "",
  ctaText: "",
  ctaLink: "",
  schedule: "now",
  scheduleDate: "",
  scheduleTime: "",
}

const CHANNEL_OPTIONS: ChannelType[] = ["Email", "Push", "SMS", "In-App"]

const CUSTOMER_SEGMENT_OPTIONS = [
  { label: "All Customers", value: "all" },
  { label: "VIP", value: "vip" },
  { label: "New Customers", value: "new" },
  { label: "Inactive", value: "inactive" },
]

const STEP_LABELS = ["Audience", "Content", "Review"]

// ── Main Export ───────────────────────────────────────────────────────────────

export function ComposeMessageModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [step, setStep] = useState<1 | 2 | 3>(1)

  const form = useForm({ defaultValues: INITIAL_STATE })
  const values = useStore(form.store, (s) => s.values)

  function update<K extends keyof ComposeState>(key: K, value: ComposeState[K]) {
    form.setFieldValue(key, value as never)
  }

  function toggleChannel(ch: ChannelType) {
    const current = form.getFieldValue("channels")
    form.setFieldValue(
      "channels",
      current.includes(ch) ? current.filter((c) => c !== ch) : [...current, ch],
    )
  }

  function handleClose() {
    setStep(1)
    form.reset()
    onClose()
  }

  const resolvedSegmentLabel =
    CUSTOMER_SEGMENT_OPTIONS.find((o) => o.value === values.customerSegment)?.label ??
    "All Customers"

  const header = <ComposeHeader step={step} onClose={handleClose} />

  const footer =
    step === 1 ? (
      <ComposeFooter onBack={handleClose} backLabel="Cancel" onNext={() => setStep(2)} />
    ) : step === 2 ? (
      <ComposeFooter onBack={() => setStep(1)} onNext={() => setStep(3)} />
    ) : (
      <ReviewFooter onBack={() => setStep(2)} onSend={handleClose} />
    )

  return (
    <Modal
      isOpen={open}
      onClose={handleClose}
      variant="dialog"
      className="max-w-2xl gap-0 p-0"
      customHeader={header}
      customFooter={footer}
    >
      <div className="overflow-y-auto px-6 py-5">
        {step === 1 && <StepAudience form={values} update={update} toggleChannel={toggleChannel} />}
        {step === 2 && <StepContent form={values} update={update} />}
        {step === 3 && <StepReview form={values} segmentLabel={resolvedSegmentLabel} />}
      </div>
    </Modal>
  )
}

// ── MessageDetailModal ─────────────────────────────────────────────────────────

export function MessageDetailModal({
  open,
  onClose,
  messageId: _messageId,
  message,
}: {
  open: boolean
  onClose: () => void
  messageId: string | null
  message?: Message | null
}) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const header = message ? <DetailHeader message={message} onClose={onClose} /> : null

  const footer = <DetailFooter onClose={onClose} onDelete={() => setShowDeleteConfirm(true)} />

  return (
    <>
      <Modal
        isOpen={open}
        onClose={onClose}
        variant="drawer"
        position="right"
        customHeader={header ?? undefined}
        customFooter={footer}
        width="652px"
      >
        {message ? (
          <div className="space-y-6 overflow-y-auto px-6 py-5">
            {/* Delivery Stats */}
            <section>
              <p className="font-jakarta text-brand/50 mb-3 text-xs font-semibold tracking-wider uppercase">
                Delivery Stats
              </p>
              <div className="grid grid-cols-2 gap-3">
                <MiniMetricCard label="Delivered" value={message.delivered.toLocaleString()} />
                <MiniMetricCard label="Opens" value={message.opens.toLocaleString()} />
                <MiniMetricCard label="Clicks" value="—" />
                <MiniMetricCard label="Open Rate" value={message.rate} />
              </div>
            </section>

            {/* Message Details */}
            <section>
              <p className="font-jakarta text-brand/50 mb-3 text-xs font-semibold tracking-wider uppercase">
                Message Details
              </p>
              <div className="border-borderStrong space-y-3 rounded-xl border bg-white p-4">
                <DetailRow label="Type">
                  <span
                    className={cn(
                      "font-jakarta rounded-full px-2.5 py-0.5 text-xs font-semibold",
                      message.type === "SMS"
                        ? "bg-green-50 text-green-700"
                        : "bg-blue-50 text-blue-700",
                    )}
                  >
                    {message.type}
                  </span>
                </DetailRow>
                <DetailRow label="Sent to">
                  <span className="font-jakarta text-brand text-sm">{message.sentTo}</span>
                </DetailRow>
                <DetailRow label="Channels">
                  <div className="flex flex-wrap gap-1">
                    {message.channels.map((ch) => (
                      <span
                        key={ch}
                        className={cn(
                          "font-jakarta rounded-full px-2 py-0.5 text-xs font-semibold",
                          CHANNEL_COLORS[ch] ?? "bg-gray-50 text-gray-600",
                        )}
                      >
                        {ch}
                      </span>
                    ))}
                  </div>
                </DetailRow>
                <DetailRow label="Sent at">
                  <span className="font-jakarta text-brand text-sm">{message.sentAt}</span>
                </DetailRow>
                <DetailRow label="By">
                  <span className="font-jakarta text-brand text-sm">Admin</span>
                </DetailRow>
              </div>
            </section>

            {/* Message Content */}
            <section>
              <p className="font-jakarta text-brand/50 mb-3 text-xs font-semibold tracking-wider uppercase">
                Message Content
              </p>
              <div className="border-borderStrong space-y-2 rounded-xl border bg-white p-4">
                <p className="font-jakarta text-brand text-sm font-semibold">{message.title}</p>
                <p className="font-jakarta text-brand/60 line-clamp-3 text-sm">
                  This message was sent to {message.sentTo} via {message.channels.join(", ")}.
                </p>
              </div>
            </section>
          </div>
        ) : (
          <div className="flex h-full items-center justify-center">
            <p className="font-jakarta text-brand/40 text-sm">No message selected</p>
          </div>
        )}
      </Modal>
      <DeleteConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={() => {
          setShowDeleteConfirm(false)
          onClose()
        }}
        entityName={message?.title ?? "this message"}
        entityType="message"
      />
    </>
  )
}

// ── Step 1 — Audience & Channel ───────────────────────────────────────────────

const StepAudience = ({
  form,
  update,
  toggleChannel,
}: {
  form: ComposeState
  update: <K extends keyof ComposeState>(key: K, value: ComposeState[K]) => void
  toggleChannel: (ch: ChannelType) => void
}) => (
  <div className="space-y-6">
    {/* Audience */}
    <section>
      <p className="font-jakarta text-brand/50 mb-3 text-xs font-semibold tracking-wider uppercase">
        Audience
      </p>
      <div className="grid grid-cols-2 gap-3">
        <AudienceCard
          icon={<Users size={18} />}
          label="Customers"
          selected={form.audience === "customers"}
          onClick={() => update("audience", "customers")}
        />
        <AudienceCard
          icon={<Briefcase size={18} />}
          label="Staff"
          selected={form.audience === "staff"}
          onClick={() => update("audience", "staff")}
        />
      </div>

      {form.audience === "customers" && (
        <div className="mt-4">
          <Dropdown
            label="Customer Segment"
            options={CUSTOMER_SEGMENT_OPTIONS}
            value={form.customerSegment}
            onChange={(v) => update("customerSegment", v)}
            placeholder="All Customers"
          />
        </div>
      )}
    </section>

    {/* Channels */}
    <section>
      <p className="font-jakarta text-brand mb-3 text-xs font-semibold">Select channels</p>
      <div className="flex flex-wrap gap-2">
        {CHANNEL_OPTIONS.map((ch) => {
          const active = form.channels.includes(ch)
          return (
            <button
              key={ch}
              type="button"
              onClick={() => toggleChannel(ch)}
              className={cn(
                "font-jakarta rounded-full border px-4 py-1.5 text-sm font-semibold transition-colors",
                active
                  ? "border-primary bg-primary text-white"
                  : "border-borderStrong text-brand/60 hover:border-primary/30 hover:text-brand bg-white",
              )}
            >
              {ch}
            </button>
          )
        })}
      </div>
    </section>
  </div>
)

// ── Step 2 — Content ──────────────────────────────────────────────────────────

const StepContent = ({
  form,
  update,
}: {
  form: ComposeState
  update: <K extends keyof ComposeState>(key: K, value: ComposeState[K]) => void
}) => (
  <div className="space-y-5">
    {/* Title */}
    <FormInput
      label="Message Title"
      placeholder="Enter a message title"
      value={form.messageTitle}
      onChange={(v) => update("messageTitle", v)}
    />

    {/* Header Image */}
    <div className="flex flex-col gap-1.5">
      <label className="font-jakarta text-brand text-xs font-semibold">Header Image</label>
      <div className="border-borderStrong bg-brand/1 hover:border-primary/30 hover:bg-brand/2 flex cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed px-6 py-8 text-center transition-colors">
        <Upload size={20} className="text-brand/30" />
        <p className="font-jakarta text-brand text-sm font-medium">
          Click to upload or drag and drop
        </p>
        <p className="font-jakarta text-brand/40 text-xs">PNG, JPG up to 5MB</p>
      </div>
    </div>

    {/* Message Body */}
    <div className="flex flex-col gap-1.5">
      <label className="font-jakarta text-brand text-xs font-semibold">Message Body</label>
      <textarea
        value={form.messageBody}
        onChange={(e) => update("messageBody", e.target.value)}
        placeholder="Write your message here…"
        rows={4}
        className={cn(
          "font-jakarta placeholder:text-brand/30 text-brand border-border w-full resize-none rounded-lg border px-3 py-2.5 text-sm outline-none",
          "focus-visible:ring-ring/30 focus-visible:border-ring focus-visible:ring-2",
          "min-h-32",
        )}
      />
      <div className="flex gap-2">
        <TokenButton
          label="+Name"
          onClick={() => update("messageBody", form.messageBody + " {{name}}")}
        />
        <TokenButton
          label="+Store Name"
          onClick={() => update("messageBody", form.messageBody + " {{store_name}}")}
        />
      </div>
    </div>

    {/* CTA & Link */}
    <div className="grid grid-cols-2 gap-4">
      <FormInput
        label="CTA Text"
        placeholder="Shop now"
        value={form.ctaText}
        onChange={(v) => update("ctaText", v)}
      />
      <FormInput
        label="CTA Link"
        placeholder="https://..."
        value={form.ctaLink}
        onChange={(v) => update("ctaLink", v)}
      />
    </div>

    {/* Schedule */}
    <div className="flex flex-col gap-2">
      <label className="font-jakarta text-brand text-xs font-semibold">Schedule</label>
      <div className="flex flex-col gap-2">
        <RadioOption
          label="Send now"
          checked={form.schedule === "now"}
          onChange={() => update("schedule", "now")}
        />
        <RadioOption
          label="Schedule for later"
          checked={form.schedule === "later"}
          onChange={() => update("schedule", "later")}
        />
      </div>
      {form.schedule === "later" && (
        <div className="mt-2 grid grid-cols-2 gap-4">
          <FormInput
            label="Date"
            type="date"
            value={form.scheduleDate}
            onChange={(v) => update("scheduleDate", v)}
          />
          <FormInput
            label="Time"
            type="time"
            value={form.scheduleTime}
            onChange={(v) => update("scheduleTime", v)}
          />
        </div>
      )}
    </div>
  </div>
)

// ── Step 3 — Review ───────────────────────────────────────────────────────────

const StepReview = ({ form, segmentLabel }: { form: ComposeState; segmentLabel: string }) => (
  <div className="space-y-5">
    <div className="border-borderStrong space-y-4 rounded-xl border bg-white p-5">
      {/* Audience */}
      <ReviewItem label="Audience">
        <span className="font-jakarta text-brand text-sm font-medium capitalize">
          {form.audience === "customers" ? segmentLabel : "Staff"}
        </span>
      </ReviewItem>

      {/* Channels */}
      <ReviewItem label="Channels">
        {form.channels.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {form.channels.map((ch) => (
              <span
                key={ch}
                className={cn(
                  "font-jakarta rounded-full px-2.5 py-0.5 text-xs font-semibold",
                  CHANNEL_COLORS[ch] ?? "bg-gray-50 text-gray-600",
                )}
              >
                {ch}
              </span>
            ))}
          </div>
        ) : (
          <span className="font-jakarta text-brand/40 text-sm">No channels selected</span>
        )}
      </ReviewItem>

      {/* Title */}
      <ReviewItem label="Title">
        <span className="font-jakarta text-brand text-sm">
          {form.messageTitle || <span className="text-brand/40">—</span>}
        </span>
      </ReviewItem>

      {/* CTA */}
      {(form.ctaText || form.ctaLink) && (
        <ReviewItem label="CTA">
          <span className="font-jakarta text-brand text-sm">
            {form.ctaText}
            {form.ctaLink && <span className="text-brand/40"> → {form.ctaLink}</span>}
          </span>
        </ReviewItem>
      )}

      {/* Schedule */}
      <ReviewItem label="Schedule">
        <span className="font-jakarta text-brand text-sm">
          {form.schedule === "now"
            ? "Send immediately"
            : `${form.scheduleDate} at ${form.scheduleTime}`}
        </span>
      </ReviewItem>
    </div>

    {/* Body preview */}
    {form.messageBody && (
      <div className="border-borderStrong rounded-xl border bg-white p-5">
        <p className="font-jakarta text-brand/50 mb-2 text-xs font-semibold tracking-wider uppercase">
          Message Preview
        </p>
        <p className="font-jakarta text-brand/80 text-sm leading-relaxed whitespace-pre-wrap">
          {form.messageBody}
        </p>
      </div>
    )}
  </div>
)

// ── Header sub-components ─────────────────────────────────────────────────────

const ComposeHeader = ({ step, onClose }: { step: 1 | 2 | 3; onClose: () => void }) => (
  <div className="border-b border-gray-100 px-6 py-5">
    <div className="flex items-center justify-between">
      <p className="font-jakarta text-brand text-base font-semibold">Compose Message</p>
      <button
        type="button"
        onClick={onClose}
        className="text-brand/40 hover:text-brand flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-gray-50"
      >
        <X size={16} />
      </button>
    </div>
    {/* Step indicator */}
    <div className="mt-4 flex items-center gap-0">
      {STEP_LABELS.map((label, i) => {
        const s = (i + 1) as 1 | 2 | 3
        const active = s === step
        const done = s < step
        return (
          <div key={label} className="flex items-center">
            <div
              className={cn(
                "font-jakarta flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition-colors",
                active && "bg-primary/10 text-primary",
                done && "text-primary/60",
                !active && !done && "text-brand/30",
              )}
            >
              <span
                className={cn(
                  "text-xxs flex h-4 w-4 items-center justify-center rounded-full font-bold",
                  active && "bg-primary text-white",
                  done && "bg-primary/20 text-primary",
                  !active && !done && "bg-brand/10 text-brand/40",
                )}
              >
                {s}
              </span>
              {label}
            </div>
            {i < STEP_LABELS.length - 1 && (
              <div className={cn("bg-brand/10 mx-1 h-px w-6", done && "bg-primary/30")} />
            )}
          </div>
        )
      })}
    </div>
  </div>
)

const DetailHeader = ({ message, onClose }: { message: Message; onClose: () => void }) => {
  const statusConfig: Record<
    string,
    {
      label: string
      variant: "success" | "warning" | "neutral" | "error" | "default"
    }
  > = {
    sent: { label: "Sent", variant: "success" },
    scheduled: { label: "Scheduled", variant: "warning" },
    draft: { label: "Draft", variant: "neutral" },
    failed: { label: "Failed", variant: "error" },
  }
  const cfg = statusConfig[message.status] ?? {
    label: message.status,
    variant: "default" as const,
  }

  return (
    <div className="flex items-center gap-3 border-b border-gray-100 px-6 py-5">
      <button
        type="button"
        onClick={onClose}
        className="text-brand/40 hover:text-brand flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors hover:bg-gray-50"
      >
        <ChevronLeft size={18} />
      </button>
      <p className="font-jakarta text-brand flex-1 truncate text-base font-semibold">
        {message.title}
      </p>
      <StatusBadge label={cfg.label} variant={cfg.variant} dot />
    </div>
  )
}

// ── Footer sub-components ─────────────────────────────────────────────────────

const ComposeFooter = ({
  onBack,
  backLabel = "← Back",
  onNext,
}: {
  onBack: () => void
  backLabel?: string
  onNext: () => void
}) => (
  <div className="border-t border-gray-100 px-6 py-5">
    <div className="flex items-center justify-between gap-3">
      <Button
        theme="outline"
        size="default"
        type="button"
        onClick={onBack}
        beforeIcon={backLabel === "Cancel" ? undefined : <ArrowLeft size={14} />}
        label={backLabel === "Cancel" ? "Cancel" : "Back"}
      />
      <Button
        theme="default"
        size="default"
        type="button"
        onClick={onNext}
        afterIcon={<ArrowRight size={14} />}
        label="Next"
      />
    </div>
  </div>
)

const ReviewFooter = ({ onBack, onSend }: { onBack: () => void; onSend: () => void }) => (
  <div className="border-t border-gray-100 px-6 py-5">
    <div className="flex items-center justify-between gap-3">
      <Button
        theme="outline"
        size="default"
        type="button"
        onClick={onBack}
        beforeIcon={<ArrowLeft size={14} />}
        label="Back"
      />
      <Button
        theme="secondary"
        size="default"
        type="button"
        onClick={onSend}
        beforeIcon={<Send size={14} />}
        label="Send message"
      />
    </div>
  </div>
)

const DetailFooter = ({ onClose, onDelete }: { onClose: () => void; onDelete: () => void }) => (
  <div className="border-t border-gray-100 px-6 py-5">
    <div className="flex w-full items-center justify-end gap-3">
      <Button
        theme="outline"
        onClick={onClose}
        beforeIcon={<Send size={14} />}
        label="Resend"
        className="flex-1"
      />
      <Button
        theme="destructive"
        onClick={onDelete}
        beforeIcon={<Trash2 size={14} />}
        label="Delete"
        className="flex-1"
      />
    </div>
  </div>
)

// ── Shared atomic sub-components ──────────────────────────────────────────────

const AudienceCard = ({
  icon,
  label,
  selected,
  onClick,
}: {
  icon: React.ReactNode
  label: string
  selected: boolean
  onClick: () => void
}) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(
      "flex flex-col items-center justify-center gap-2 rounded-xl border-2 px-6 py-5 transition-colors",
      selected
        ? "border-primary bg-primary/5 text-primary"
        : "border-borderStrong text-brand/50 hover:border-primary/20 hover:text-brand/70 bg-white",
    )}
  >
    {icon}
    <span className="font-jakarta text-sm font-semibold">{label}</span>
  </button>
)

const RadioOption = ({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: () => void
}) => (
  <label className="flex cursor-pointer items-center gap-2.5">
    <input type="radio" checked={checked} onChange={onChange} className="accent-primary h-4 w-4" />
    <span
      className={cn("font-jakarta text-sm", checked ? "text-brand font-medium" : "text-brand/60")}
    >
      {label}
    </span>
  </label>
)

const TokenButton = ({ label, onClick }: { label: string; onClick: () => void }) => (
  <button
    type="button"
    onClick={onClick}
    className="font-jakarta border-borderStrong text-brand/60 hover:border-primary/30 hover:text-primary rounded-full border bg-white px-3 py-1 text-xs font-semibold transition-colors"
  >
    {label}
  </button>
)

const MiniMetricCard = ({ label, value }: { label: string; value: string }) => (
  <div className="border-borderStrong rounded-xl border bg-white p-4">
    <p className="font-jakarta text-brand/50 text-xs font-medium">{label}</p>
    <p className="font-jakarta text-brand mt-1 text-lg font-bold">{value}</p>
  </div>
)

const DetailRow = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="flex items-start gap-4">
    <span className="font-jakarta text-brand/40 w-16 shrink-0 pt-0.5 text-xs font-semibold">
      {label}
    </span>
    <div className="flex-1">{children}</div>
  </div>
)

const ReviewItem = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="flex items-start gap-4">
    <span className="font-jakarta text-brand/40 w-20 shrink-0 pt-0.5 text-xs font-semibold">
      {label}
    </span>
    <div className="flex-1">{children}</div>
  </div>
)
