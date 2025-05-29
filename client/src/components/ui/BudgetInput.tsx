import * as React from "react";
import { useState } from "react";
import { cn, formatCurrency } from "@/lib/utils";
import { Input } from "./input";

interface AmountInputProps
  extends Omit<React.ComponentProps<"input">, "onChange" | "value"> {
  value?: string | number;
  onChange?: (value: string) => void;
  onBlur?: React.FocusEventHandler<HTMLInputElement>;
}

function BudgetInput({
  className,
  value: controlledValue,
  onChange,
  onBlur,
  ...props
}: AmountInputProps) {
  const [internalValue, setInternalValue] = useState<string>("");
  const [isFocused, setIsFocused] = useState(false);

  // Sync controlled value
  React.useEffect(() => {
    if (controlledValue !== undefined) {
      const valueStr = String(controlledValue);
      const numericValue = parseFloat(valueStr);

      if (!isNaN(numericValue) && numericValue !== 0) {
        setInternalValue(Math.abs(numericValue).toString());
      } else {
        setInternalValue(numericValue === 0 ? "0" : "");
      }
    } else {
      setInternalValue("");
    }
  }, [controlledValue]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = event.target.value;
    const sanitizedValue = rawValue
      .replace(/[^0-9.]/g, "")
      .replace(/(\..*)\./g, "$1");
    setInternalValue(sanitizedValue);

    if (onChange) {
      onChange(sanitizedValue);
    }
  };

  const handleInputFocus = () => setIsFocused(true);

  const handleInputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);
    if (onBlur) {
      onBlur(e);
    }
  };

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <Input
        type="text"
        value={
          isFocused
            ? internalValue
            : internalValue !== ""
              ? formatCurrency(Number(internalValue))
              : ""
        }
        onChange={handleInputChange}
        onFocus={handleInputFocus}
        onBlur={handleInputBlur}
        className={cn("tabular-nums", {
          "border-transparent bg-transparent shadow-none": !isFocused,
        })}
        {...props}
      />
    </div>
  );
}

export { BudgetInput };
