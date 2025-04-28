import * as React from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  subMonths,
  addMonths,
} from "date-fns";
import { CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { type DateRange } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export function DatePickerRange({
  className,
}: React.HTMLAttributes<HTMLDivElement>) {
  const [date, setDate] = React.useState<DateRange | undefined>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  });
  const [currentMonth, setCurrentMonth] = React.useState(new Date());

  const goToPreviousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
    setDate({
      from: startOfMonth(subMonths(currentMonth, 1)),
      to: endOfMonth(subMonths(currentMonth, 1)),
    });
  };

  const goToNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
    setDate({
      from: startOfMonth(addMonths(currentMonth, 1)),
      to: endOfMonth(addMonths(currentMonth, 1)),
    });
  };

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-[300px] justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "LLL dd, y")} -{" "}
                  {format(date.to, "LLL dd, y")}
                </>
              ) : (
                format(date.from, "LLL dd, y")
              )
            ) : (
              <span>Pick a date</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="border-b p-1.5 flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 rounded-md p-0"
              onClick={goToPreviousMonth}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <div className="font-semibold">
              {format(currentMonth, "MMMM yyyy")}
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 rounded-md p-0"
              onClick={goToNextMonth}
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={currentMonth}
            selected={date}
            onSelect={(newDate) => {
              setDate(newDate);
              if (newDate?.from) {
                setCurrentMonth(newDate.from);
              }
            }}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
