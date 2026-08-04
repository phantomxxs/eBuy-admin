import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"
import { cn } from "@/lib/utils"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

export function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        // ── structure ───────────────────────────────────────────────────
        months: "flex flex-col",
        month: "flex flex-col gap-3",
        month_caption: "relative flex h-9 items-center justify-center",
        caption_label: "font-jakarta text-brand text-sm font-semibold",
        nav: "flex items-center",
        button_previous: cn(
          "absolute left-0 flex h-9 w-9 items-center justify-center rounded-lg",
          "border border-borderSubtle bg-white text-brand/50 transition-colors hover:bg-gray-50 hover:text-brand",
        ),
        button_next: cn(
          "absolute right-0 flex h-9 w-9 items-center justify-center rounded-lg",
          "border border-borderSubtle bg-white text-brand/50 transition-colors hover:bg-gray-50 hover:text-brand",
        ),
        // table + rows — keep native table layout so cells size correctly
        month_grid: "w-full border-collapse",
        weekdays: "",
        weekday: "font-jakarta text-brand/40 w-9 text-center text-xs font-medium pb-1",
        weeks: "",
        week: "",

        // ── day cell (td) ────────────────────────────────────────────────
        // range_* and selected are added to this element by react-day-picker
        day: "relative h-9 w-9 p-0 text-center align-middle",

        // ── day button (button inside td) ───────────────────────────────
        day_button: cn(
          "font-jakarta h-9 w-9 rounded-full text-sm font-medium transition-colors",
          "text-brand hover:bg-primary/8 hover:text-primary",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
        ),

        // ── selection states — applied to td, use [&>button]: to reach button ─
        today: "[&>button]:font-semibold [&>button]:text-primary",
        selected:
          "[&>button]:bg-primary [&>button]:text-white [&>button]:hover:bg-primary [&>button]:hover:text-white",
        range_start: cn(
          // right-half tinted strip + circle button
          "bg-gradient-to-r from-transparent to-primary/8",
          "[&>button]:bg-primary [&>button]:text-white [&>button]:hover:bg-primary [&>button]:hover:text-white",
        ),
        range_end: cn(
          // left-half tinted strip + circle button
          "bg-gradient-to-l from-transparent to-primary/8",
          "[&>button]:bg-primary [&>button]:text-white [&>button]:hover:bg-primary [&>button]:hover:text-white",
        ),
        range_middle: cn(
          // full-width tinted strip, no circle
          "bg-primary/8 rounded-none",
          "[&>button]:bg-transparent [&>button]:hover:bg-transparent [&>button]:text-brand",
        ),
        outside: "[&>button]:text-brand/30 [&>button]:opacity-40",
        disabled: "cursor-not-allowed [&>button]:opacity-30",
        hidden: "invisible",
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation }) =>
          orientation === "left" ? <ChevronLeft size={16} /> : <ChevronRight size={16} />,
      }}
      {...props}
    />
  )
}
