import * as React from "react"
import { DayPicker } from "react-day-picker"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"

import { cn } from "@/lib/utils"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("w-full", className)}
      classNames={{
        months: "flex flex-col space-y-3",
        month: "space-y-3",
        caption: "flex items-center justify-between px-1 py-2 mb-2",
        caption_label: "text-xs font-semibold uppercase tracking-wider",
        nav: "flex gap-1",
        nav_button: "h-6 w-6 rounded-md border border-input/50 hover:bg-input/30 transition-colors flex items-center justify-center hover:text-foreground text-muted-foreground p-0",
        nav_button_previous: "justify-start",
        nav_button_next: "justify-end",
        table: "w-full border-collapse",
        head_row: "flex mb-2",
        head_cell:
          "text-xs font-medium uppercase tracking-wide text-muted-foreground w-7 h-7 flex items-center justify-center",
        row: "flex gap-0 mb-1",
        cell: "relative p-0 text-center text-xs",
        day: "h-7 w-7 rounded-md border border-transparent hover:border-input/30 hover:bg-input/20 transition-all text-foreground",
        day_selected:
          "border-primary/60 bg-primary/20 text-primary font-semibold hover:bg-primary/30",
        day_today:
          "border-primary/40 text-primary font-semibold",
        day_outside:
          "text-muted-foreground/40",
        day_disabled: "text-muted-foreground/30 cursor-not-allowed",
        day_range_middle:
          "rounded-none border-l-0 border-r-0 bg-input/15",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ ...props }) => (
          <ChevronLeftIcon className="h-3.5 w-3.5" />
        ),
        IconRight: ({ ...props }) => (
          <ChevronRightIcon className="h-3.5 w-3.5" />
        ),
      }}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }
