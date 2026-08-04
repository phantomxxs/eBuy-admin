import { useRef, useEffect } from "react"
import { cn } from "@/lib/utils"

interface SimpleRichEditorProps {
  value: string
  onChange: (html: string) => void
  placeholder?: string
  className?: string
}

export default function SimpleRichEditor({
  value,
  onChange,
  placeholder = "Write your blog content here…",
  className,
}: SimpleRichEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const isFocusedRef = useRef(false)

  // Set initial content on mount
  useEffect(() => {
    if (editorRef.current && value && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Sync incoming value changes only when the editor is not focused
  useEffect(() => {
    if (!isFocusedRef.current && editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value
    }
  }, [value])

  function execCmd(command: string, arg?: string) {
    editorRef.current?.focus()
    document.execCommand(command, false, arg)
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML)
    }
  }

  function insertHeading(tag: "h2" | "h3") {
    editorRef.current?.focus()
    document.execCommand("formatBlock", false, tag)
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML)
    }
  }

  function handleInput() {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML)
    }
  }

  return (
    <div className={cn("border-borderSubtle flex flex-col rounded-xl border bg-white", className)}>
      {/* Toolbar */}
      <div className="border-borderSubtle flex flex-wrap items-center gap-1 border-b px-3 py-2">
        <ToolbarButton onClick={() => execCmd("bold")} title="Bold" className="font-bold">
          B
        </ToolbarButton>
        <ToolbarButton onClick={() => execCmd("italic")} title="Italic" className="italic">
          I
        </ToolbarButton>
        <div className="bg-borderSubtle mx-0.5 h-4 w-px" />
        <ToolbarButton onClick={() => insertHeading("h2")} title="Heading 2">
          H2
        </ToolbarButton>
        <ToolbarButton onClick={() => insertHeading("h3")} title="Heading 3">
          H3
        </ToolbarButton>
        <div className="bg-borderSubtle mx-0.5 h-4 w-px" />
        <ToolbarButton onClick={() => execCmd("insertUnorderedList")} title="Bullet list">
          •—
        </ToolbarButton>
        <ToolbarButton onClick={() => execCmd("insertOrderedList")} title="Ordered list">
          1.
        </ToolbarButton>
        <div className="bg-borderSubtle mx-0.5 h-4 w-px" />
        <ToolbarButton onClick={() => execCmd("formatBlock", "blockquote")} title="Blockquote">
          &ldquo;
        </ToolbarButton>
        <ToolbarButton onClick={() => execCmd("insertHorizontalRule")} title="Horizontal rule">
          —
        </ToolbarButton>
      </div>

      {/* Editor */}
      <div className="relative flex-1">
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={handleInput}
          onFocus={() => {
            isFocusedRef.current = true
          }}
          onBlur={() => {
            isFocusedRef.current = false
            if (editorRef.current) {
              onChange(editorRef.current.innerHTML)
            }
          }}
          className={cn(
            "font-jakarta text-brand min-h-[300px] w-full px-4 py-3 text-sm leading-relaxed outline-none",
            "[&_h2]:font-jakarta [&_h2]:text-brand [&_h2]:mb-2 [&_h2]:text-base [&_h2]:font-bold",
            "[&_h3]:font-jakarta [&_h3]:text-brand [&_h3]:mb-1.5 [&_h3]:text-sm [&_h3]:font-semibold",
            "[&_ul]:mb-2 [&_ul]:list-disc [&_ul]:pl-5",
            "[&_ol]:mb-2 [&_ol]:list-decimal [&_ol]:pl-5",
            "[&_li]:mb-0.5",
            "[&_blockquote]:border-borderSubtle [&_blockquote]:text-brand/60 [&_blockquote]:border-l-2 [&_blockquote]:pl-3 [&_blockquote]:italic",
            "[&_hr]:border-borderSubtle [&_hr]:my-3",
            "[&_p]:mb-2",
          )}
          data-placeholder={placeholder}
          style={
            {
              "--placeholder": `"${placeholder}"`,
            } as React.CSSProperties
          }
        />
        <style>{`
          [contenteditable]:empty:before {
            content: attr(data-placeholder);
            color: rgba(0,0,0,0.35);
            pointer-events: none;
          }
        `}</style>
      </div>
    </div>
  )
}

// ── Sub-components ─────────────────────────────────────────────────────────────

interface ToolbarButtonProps {
  onClick: () => void
  title: string
  children: React.ReactNode
  className?: string
}

const ToolbarButton = ({ onClick, title, children, className }: ToolbarButtonProps) => (
  <button
    type="button"
    onMouseDown={(e) => {
      e.preventDefault() // prevent losing focus from editor
      onClick()
    }}
    title={title}
    className={cn(
      "font-jakarta text-brand/70 hover:bg-blush hover:text-brand active:bg-blush flex h-7 min-w-[28px] items-center justify-center rounded px-1.5 text-xs transition-colors",
      className,
    )}
  >
    {children}
  </button>
)
