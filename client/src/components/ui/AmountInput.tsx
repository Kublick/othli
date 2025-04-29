import * as React from "react";
import { useState } from "react";
import { cn, formatCurrency } from "@/lib/utils";
import { Input } from "./input";
import { Button } from "./button";
import { CircleMinus, CirclePlus } from "lucide-react";

interface AmountInputProps
  extends Omit<React.ComponentProps<"input">, "onChange" | "value"> {
  value?: string | number; // Allow string or number
  onChange?: (value: string) => void; // Emit string
  onSignChange?: (isPositive: boolean) => void;
  onBlur?: React.FocusEventHandler<HTMLInputElement>; // Add onBlur prop
  startNegative?: boolean; // <-- Add new prop
}

function AmountInput({
  className,
  value: controlledValue,
  onChange,
  onSignChange,
  onBlur, // Accept the onBlur prop
  startNegative = false, // <-- Default startNegative to false
  ...props
}: AmountInputProps) {
  // Initialize isPositive based on startNegative prop
  const [internalValue, setInternalValue] = useState<string>("");
  const [isPositive, setIsPositive] = useState(!startNegative); // <-- Initialize based on prop
  const [isFocused, setIsFocused] = useState(false);

  // Effect to sync controlled value and sign
  React.useEffect(() => {
    const initialSignPositive = !startNegative; // Determine default sign from prop

    if (controlledValue !== undefined) {
      const valueStr = String(controlledValue);
      const numericValue = parseFloat(valueStr);

      if (!isNaN(numericValue) && numericValue !== 0) { // Only override default if value is non-zero
        const positive = numericValue >= 0;
        setIsPositive(positive);
        setInternalValue(Math.abs(numericValue).toString());
        if (onSignChange) {
          onSignChange(positive);
        }
      } else {
        // Handle 0, empty string, or non-numeric: use default sign
        setInternalValue(numericValue === 0 ? "0" : ""); // Keep "0" if it was 0
        setIsPositive(initialSignPositive);
        if (onSignChange) {
          onSignChange(initialSignPositive);
        }
      }
    } else {
      // Handle undefined controlledValue: use default sign
      setInternalValue("");
      setIsPositive(initialSignPositive);
       if (onSignChange) {
         onSignChange(initialSignPositive);
       }
    }
    // Add startNegative to dependency array
  }, [controlledValue, onSignChange, startNegative]);

  const handleSignToggle = () => {
    const newIsPositive = !isPositive;
    setIsPositive(newIsPositive);
    if (onSignChange) {
      onSignChange(newIsPositive);
    }
    // Update parent if onChange is provided
    if (onChange && internalValue) {
      // Ensure internalValue is treated as a number for sign application
      const numericInternalValue = parseFloat(internalValue);
      if (!isNaN(numericInternalValue)) {
        const signedValueString =
          (newIsPositive ? "" : "-") + String(numericInternalValue);
        onChange(signedValueString);
      } else if (internalValue === "") {
        onChange("0");
      }
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = event.target.value;
    const sanitizedValue = rawValue
      .replace(/[^0-9.]/g, "")
      .replace(/(\..*)\./g, "$1");
    setInternalValue(sanitizedValue);

    if (onChange) {
      const signedValueString = (isPositive ? "" : "-") + sanitizedValue;
      onChange(signedValueString);
    }
  };

  const handleInputFocus = () => setIsFocused(true);

  const handleInputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);

    if (onBlur) {
      onBlur(e);
    }
  };

  const textColorClass = isPositive ? "text-primary" : "text-destructive";

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className={cn(
          "h-9 w-9 shrink-0",
          isPositive
            ? "border-primary text-primary hover:bg-primary/10"
            : "border-destructive text-destructive hover:bg-destructive/10"
        )}
        onClick={handleSignToggle}
        aria-label={isPositive ? "Cambiar a negativo" : "Cambiar a positivo"}
      >
        {isPositive ? <CirclePlus /> : <CircleMinus />}
      </Button>
      <Input
        type="text"
        inputMode="decimal"
        value={
          isFocused
            ? internalValue
            : internalValue !== ""
              ? isPositive
                ? formatCurrency(Number(internalValue))
                : "-" + formatCurrency(Number(internalValue))
              : ""
        }
        onChange={handleInputChange}
        onFocus={handleInputFocus}
        onBlur={handleInputBlur}
        className={cn(textColorClass, "tabular-nums")}
        {...props}
      />
      {/* --- END UNCOMMENT --- */}
    </div> // Or </span> if you prefer, but add width constraint where used
  );
}

export { AmountInput };
