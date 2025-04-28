import * as React from "react";
import { Check, ChevronsUpDown, PlusCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export interface ComboboxOption {
  value: string;
  label: string;
}

export interface ComboboxProps {
  options: ComboboxOption[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  createMessage?: string;
  allowCreate?: boolean;
  clearable?: boolean;
  disableClear?: boolean; // Add this new prop
  disabled?: boolean;
  loading?: boolean;
  error?: boolean;
  className?: string;
}

export const MyCombobox = React.forwardRef<HTMLButtonElement, ComboboxProps>(
  (
    {
      options,
      value,
      defaultValue,
      onChange,
      placeholder = "Selecciona una opcion",
      searchPlaceholder = "Buscar",
      emptyMessage = "No se encontraron resultados",
      createMessage = "Agregar",
      allowCreate = true,
      clearable = true,
      disableClear = false, // Default to false
      disabled = false,
      error = false,
      className,
    },
    ref
  ) => {
    const [open, setOpen] = React.useState(false);
    const [searchQuery, setSearchQuery] = React.useState("");
    const [selectedValue, setSelectedValue] = React.useState<
      string | undefined
    >(value !== undefined ? value : defaultValue);

    React.useEffect(() => {
      if (value !== undefined) {
        setSelectedValue(value);
      }
    }, [value]);

    const selectedOption = React.useMemo(
      () => options.find((option) => option.value === selectedValue),
      [options, selectedValue]
    );

    const filteredOptions = React.useMemo(() => {
      if (!searchQuery) return options;
      return options.filter((option) =>
        option.label.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }, [options, searchQuery]);

    const exactMatch = React.useMemo(() => {
      return options.some(
        (option) => option.label.toLowerCase() === searchQuery.toLowerCase()
      );
    }, [options, searchQuery]);

    const handleSelect = (currentValue: string) => {
      const newValue =
        currentValue === selectedValue ? undefined : currentValue;
      setSelectedValue(newValue);
      onChange?.(newValue || "");
      setOpen(false);
    };

    const handleCreate = () => {
      if (!searchQuery.trim()) return;
      setSelectedValue(searchQuery);
      onChange?.(searchQuery);
      setOpen(false);
    };

    const handleClear = () => {
      setSelectedValue(undefined);
      onChange?.("");
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === "Enter" && searchQuery && !exactMatch && allowCreate) {
        e.preventDefault();
        handleCreate();
      }
    };

    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            ref={ref}
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              "w-full justify-between font-normal",
              error ? "border-destructive" : "",
              !selectedValue && "text-muted-foreground",
              className
            )}
            disabled={disabled}
            onClick={() => setOpen(!open)}
            type="button"
          >
            <span className="truncate">
              {selectedValue
                ? selectedOption
                  ? selectedOption.label
                  : selectedValue
                : placeholder}
            </span>
            <div className="flex items-center">
              {clearable && !disableClear && selectedValue && (
                <span
                  role="button"
                  tabIndex={0}
                  className="h-4 w-4 p-0 mr-1 hover:bg-transparent flex items-center justify-center rounded focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 cursor-pointer disabled:opacity-50"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClear();
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      e.stopPropagation();
                      handleClear();
                    }
                  }}
                  aria-label="Clear selection"
                  style={{
                    pointerEvents: disabled ? "none" : "auto",
                    opacity: disabled ? 0.5 : 1,
                  }}
                >
                  <X className="h-3 w-3" />
                </span>
              )}
              <ChevronsUpDown className="h-4 w-4 opacity-50 shrink-0" />
            </div>
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-[var(--radix-popover-trigger-width)] p-0"
          align="start"
        >
          <Command shouldFilter={false} onKeyDown={handleKeyDown}>
            <CommandInput
              placeholder={searchPlaceholder}
              value={searchQuery}
              onValueChange={setSearchQuery}
              className="h-9"
            />
            <CommandList>
              <CommandEmpty>{emptyMessage}</CommandEmpty>
              <CommandGroup>
                {filteredOptions.map((option) => (
                  <CommandItem
                    key={option.value}
                    value={option.value}
                    onSelect={handleSelect}
                    className="cursor-pointer"
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selectedValue === option.value
                          ? "opacity-100"
                          : "opacity-0"
                      )}
                    />
                    {option.label}
                  </CommandItem>
                ))}
              </CommandGroup>
              {allowCreate && searchQuery && !exactMatch && (
                <>
                  <CommandSeparator />
                  <CommandGroup>
                    <div
                      className="flex items-center cursor-pointer px-2 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground select-none"
                      role="option"
                      aria-selected="false"
                      tabIndex={0}
                      onClick={handleCreate}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          handleCreate();
                        }
                      }}
                    >
                      <PlusCircle className="mr-2 h-4 w-4" />
                      {createMessage} "{searchQuery}"
                    </div>
                  </CommandGroup>
                </>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    );
  }
);
