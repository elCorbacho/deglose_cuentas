"use client"

import * as React from "react"
import { ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react"
import { getDefaultClassNames, type DayButton } from "react-day-picker"
import { DayPicker } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button, buttonVariants } from "@/components/ui/button"

export function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  captionLayout = "label",
  buttonVariant = "ghost",
  formatters,
  components,
  ...props
}: React.ComponentProps<typeof DayPicker> & {
  buttonVariant?: React.ComponentProps<typeof Button>["variant"]
}) {
  const defaultClassNames = getDefaultClassNames()

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn(
        "p-3",
        className
      )}
      captionLayout={captionLayout}
      formatters={{
        formatMonthDropdown: (date) =>
          date.toLocaleString("default", { month: "short" }),
        ...formatters,
      }}
      classNames={{
        root: cn("w-fit", defaultClassNames.root),
        months: cn(
          "relative flex flex-col gap-4 sm:flex-row sm:space-x-4 sm:space-y-0",
          defaultClassNames.months
        ),
        month: cn("space-y-3", defaultClassNames.month),
        caption: cn(
          "flex items-center justify-between px-2 py-3 mb-2",
          defaultClassNames.caption
        ),
        caption_label: cn(
          "text-sm font-semibold tracking-wide",
          defaultClassNames.caption_label
        ),
        nav: cn(
          "flex items-center justify-between w-full absolute inset-x-0 top-3",
          defaultClassNames.nav
        ),
        nav_button: cn(
          "h-6 w-6 p-0 opacity-60 hover:opacity-100 transition-opacity",
          defaultClassNames.nav_button
        ),
        nav_button_previous: "",
        nav_button_next: "",
        table: "w-full border-collapse",
        head_row: "flex gap-0 mb-2",
        head_cell: cn(
          "text-xs font-medium text-muted-foreground/70 w-10 h-8 flex items-center justify-center uppercase tracking-wide",
          defaultClassNames.head_cell
        ),
        row: "flex w-full gap-0 mb-2",
        cell: cn(
          "relative p-0 text-center text-sm",
          defaultClassNames.cell
        ),
        day: cn(
          "h-10 w-10 p-0 font-semibold rounded-md hover:bg-input/20 transition-colors",
          defaultClassNames.day
        ),
        day_range_end: "day-range-end",
        day_selected:
          "bg-input/30 border border-primary/50 text-foreground rounded-md font-semibold",
        day_today: "border border-primary/40 text-primary font-bold",
        day_outside:
          "text-muted-foreground/50",
        day_disabled: "text-muted-foreground/30 cursor-not-allowed",
        day_range_middle:
          "bg-accent/15 rounded-none",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ ...props }) => (
          <ChevronLeftIcon className="h-4 w-4" />
        ),
        IconRight: ({ ...props }) => (
          <ChevronRightIcon className="h-4 w-4" />
        ),
      }}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"
