import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { cn } from "@/lib/utils";

type ProgressSegment = {
  value: number;
  color?: string;
  categoryName: string;
  total: number;
};

type Props = React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> & {
  segments: ProgressSegment[];
};

const NewProgress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  Props
>(({ className, segments, ...props }, ref) => {
  const sortedSegments = [...segments].sort((a, b) => b.value - a.value);
  const totalPercent = segments.reduce((sum, seg) => sum + seg.value, 0);
  const EPSILON = 0.01;

  let left = 0;

  console.log(segments);
  return (
    <ProgressPrimitive.Root
      ref={ref}
      className={cn(
        "relative w-full overflow-hidden rounded bg-slate-200 h-6",
        className
      )}
      {...props}
    >
      <div className="flex w-full rounded-lg overflow-hidden h-6">
        {sortedSegments.map((seg) => (
          <Tooltip key={seg.categoryName}>
            <TooltipTrigger asChild>
              <div
                className={seg.color}
                style={{ width: `${seg.value}%`, height: "100%" }}
              />
            </TooltipTrigger>
            <TooltipContent>
              <div>
                <div>
                  <strong>{seg.categoryName}</strong>
                </div>
                <div>Total: ${Number(seg.total).toLocaleString()}</div>
              </div>
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
      {100 - totalPercent > EPSILON && (
        <ProgressPrimitive.Indicator
          className={cn(
            "h-full transition-all absolute top-0 rounded-r bg-gray-200"
          )}
          style={{
            width: `${100 - totalPercent}%`,
            left: `${totalPercent}%`,
            zIndex: sortedSegments.length + 1,
          }}
        />
      )}
    </ProgressPrimitive.Root>
  );
});

NewProgress.displayName = "Progress";

export { NewProgress };
