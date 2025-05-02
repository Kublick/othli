import * as React from "react";

import { cn } from "@/lib/utils";
import { Search } from "lucide-react";

// Extend the props interface to include fullWidth
interface InputProps extends React.ComponentProps<"input"> {
  fullWidth?: boolean;
}

function InputIcon({
  className,
  type,
  fullWidth = true,
  ...props
}: InputProps) {
  return (
    // Add 'group' and focus-within styles here
    <div
      className={cn(
        "group file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 min-w-0 items-center rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        fullWidth && "w-full",
        "focus-within:border-ring focus-within:ring-ring/50 focus-within:ring-[3px]",
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        "gap-2",
        className
      )}
    >
      <Search
        className={cn(
          "h-4 w-4 text-muted-foreground transition-colors",
          "group-focus-within:text-primary"
        )}
      />
      <input
        type={type}
        className="h-full w-full flex-1 bg-transparent p-0 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50" // Basic input styles, remove default focus outline
        {...props}
      />
    </div>
  );
}

export { InputIcon };
