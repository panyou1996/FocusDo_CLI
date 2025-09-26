
"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker, DropdownProps } from "react-day-picker"
import { format } from "date-fns"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import { ScrollArea } from "./scroll-area"

export type CalendarProps = React.ComponentProps<typeof DayPicker> & {
  tasksPerDay?: { [key: string]: { total: number; important: number } };
};


function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  tasksPerDay = {},
  components,
  ...props
}: CalendarProps) {
  const defaultComponents = {
    IconLeft: ({ className, ...props }: React.HTMLAttributes<HTMLElement>) => (
      <ChevronLeft className={cn("h-4 w-4", className)} {...props} />
    ),
    IconRight: ({ className, ...props }: React.HTMLAttributes<HTMLElement>) => (
      <ChevronRight className={cn("h-4 w-4", className)} {...props} />
    ),
    DayContent: (dayProps: any) => {
      const date = dayProps.date;
      const formattedDate = format(date, 'yyyy-MM-dd');
      const taskInfo = tasksPerDay[formattedDate];
      const isSelected = cn(props.selected).includes(cn(date));
      const isToday = format(new Date(), 'yyyy-MM-dd') === formattedDate;

      const renderDots = () => {
        if (!taskInfo || taskInfo.total === 0) return null;

        const importantCount = taskInfo.important || 0;
        const normalCount = taskInfo.total - importantCount;

        const dots = [];
        for (let i = 0; i < Math.min(importantCount, 3); i++) {
          dots.push(
            <div key={`dot-imp-${i}`} className="h-1 w-1 rounded-full bg-yellow-500" />
          );
        }
        const remainingSpace = 3 - dots.length;
        for (let i = 0; i < Math.min(normalCount, remainingSpace); i++) {
          dots.push(
            <div
              key={`dot-norm-${i}`}
              className={cn(
                "h-1 w-1 rounded-full",
                (isSelected || isToday) ? "bg-primary-foreground" : "bg-primary"
              )}
            />
          );
        }
        return dots;
      };

      return (
        <div className="relative h-full w-full flex items-center justify-center">
          <span>{dayProps.date.getDate()}</span>
          <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex space-x-0.5">
            {renderDots()}
          </div>
        </div>
      );
    },
  };

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4 w-full",
        caption: "flex justify-center pt-1 relative items-center",
        caption_label: "text-sm font-medium",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-1",
        head_row: "flex w-full justify-around",
        head_cell:
          "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
        row: "flex w-full mt-2 justify-around",
        cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20 flex items-center justify-center",
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-9 w-9 p-0 font-normal aria-selected:opacity-100 rounded-full aspect-square"
        ),
        day_range_end: "day-range-end",
        day_selected:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
        day_today: "bg-accent text-accent-foreground",
        day_outside:
          "day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
        day_disabled: "text-muted-foreground opacity-50",
        day_range_middle:
          "aria-selected:bg-accent aria-selected:text-accent-foreground",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{ ...defaultComponents, ...components }}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }
