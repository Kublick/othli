import type { ColumnDef } from "@tanstack/react-table";
import { Search } from "lucide-react";
import { useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";

import { toast } from "sonner";
import { client } from "@/lib/client";
import { format } from "date-fns/format";
import { es } from "date-fns/locale/es";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { MyCombobox } from "@/components/ui/combobox";
import { getCategories } from "@/features/dashboard/api/get-categories";
import { getPayees } from "@/features/dashboard/api/get-payees"; // Import getPayees
import { useQueryClient } from "@tanstack/react-query";
import { AmountInput } from "@/components/ui/AmountInput";

const transactionSchema = z.object({
  id: z.string(),
  date: z.date(),
  amount: z.string(),
  categories: z.object({
    id: z.union([z.coerce.number(), z.string()]),
    name: z.string(),
  }),
  payee: z.object({
    id: z.union([z.coerce.number(), z.string()]),
    name: z.string(),
  }),
});

export type TransactionType = z.infer<typeof transactionSchema>;

const updateField = async ({
  id,
  field,
  value,
}: {
  id: string;
  field: string;
  value: string | number | Date;
}) => {
  const resp = await client.api.transactions.field.$patch({
    json: {
      id,
      field,
      value,
    },
  });

  if (resp.ok) {
    toast.success("Transacción actuallizada");

    return true;
  } else {
    toast.error("Error al actualizar la transacción");

    return false;
  }
};

const formatDate = (date: Date): string => {
  let formatted = format(date, "EEE, MMM d", { locale: es });

  formatted = formatted.replace(/\./g, "");

  return formatted.replace(/(^|\s)([a-z])/g, (match) => match.toUpperCase());
};

export const Columns: ColumnDef<TransactionType>[] = [
  {
    accessorKey: "date",
    header: "Fecha",
    cell: (info) => {
      const [value, setValue] = useState(info.row.original.date);
      const [isPopoverOpen, setIsPopoverOpen] = useState(false);
      const handleDateChange = (newDate?: Date) => {
        if (newDate) {
          setValue(newDate);
          updateField({
            id: String(info.row.original.id),
            field: "date",
            value: newDate,
          });
          setIsPopoverOpen(false);
          setValue(newDate);
        }
      };
      return (
        <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
          <PopoverTrigger asChild>
            <Button
              variant={"ghost"}
              className={cn(
                "w-full justify-start text-left font-normal",
                !value && "text-muted-foreground"
              )}
              onClick={(e) => e.stopPropagation()}
            >
              {value ? (
                formatDate(value as Date)
              ) : (
                <span>Selecciona una fecha</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={value as Date}
              onSelect={(newDate) => {
                handleDateChange(newDate);
              }}
              initialFocus
              locale={es}
            />
          </PopoverContent>
        </Popover>
      );
    },
  },
  {
    accessorKey: "categories.name",
    header: "Categoria",
    cell: (info) => {
      const { data: categories } = getCategories();
      const [value, setValue] = useState(info.getValue());
      const handleUpdate = async (newValue: string) => {
        if (newValue !== info.getValue()) {
          await updateField({
            id: String(info.row.original.id),
            field: "categoryId",
            value: newValue,
          });
        }
      };
      const categoriesMap = categories?.map((category) => ({
        value: category.id.toString(),
        label: category.name,
      }));
      const handleChange = (selectedValue: string | number) => {
        const selectedCategory = categories?.find(
          (cat) => cat.id.toString() === selectedValue
        );
        if (selectedCategory) {
          const categoryId = selectedCategory.id;
          setValue(selectedCategory.name);
          handleUpdate(String(categoryId));
        }
      };
      return (
        <div>
          <MyCombobox
            options={categoriesMap ?? []}
            value={categoriesMap?.find((cat) => cat.label === value)?.value} // Set value based on current name
            onChange={handleChange}
            placeholder="Selecciona una categoria"
            disabled={!categories}
          />
        </div>
      );
    },
  },
  {
    accessorKey: "payee.name",
    header: "Beneficiario",
    cell: (info) => {
      const queryClient = useQueryClient();
      const { data: payees } = getPayees();
      const [value, setValue] = useState(info.getValue());
      const handleUpdate = async (newValue: string | number) => {
        const originalPayee = payees?.find(
          (p) => p.id.toString() === info.row.original.payee.id.toString()
        );
        const currentPayeeName = originalPayee
          ? originalPayee.name
          : info.getValue();
        const selectedPayee = payees?.find(
          (p) => p.id.toString() === newValue.toString()
        );
        const selectedValueOrName = selectedPayee ? selectedPayee.id : newValue;
        if (
          selectedValueOrName !== currentPayeeName &&
          selectedValueOrName !== info.row.original.payee.id
        ) {
          const success = await updateField({
            id: String(info.row.original.id),
            field: "payeeId",
            value: selectedValueOrName,
          });
          if (success) {
            // Invalidate payees query on successful update
            queryClient.invalidateQueries({ queryKey: ["payees"] });
          }
        }
      };
      const payeesMap = payees?.map((payee) => ({
        value: payee.id.toString(),
        label: payee.name,
      }));
      const handleChange = (selectedValue: string | number) => {
        const selectedPayee = payees?.find(
          (p) => p.id.toString() === selectedValue.toString()
        );
        if (selectedPayee) {
          setValue(selectedPayee.name);
        } else if (typeof selectedValue === "string") {
          setValue(selectedValue);
        }
        handleUpdate(selectedValue);
      };
      return (
        <div>
          <MyCombobox
            options={payeesMap ?? []}
            value={
              payeesMap?.find((p) => p.label === value)?.value ??
              (typeof value === "string" ? value : undefined)
            }
            onChange={handleChange}
            placeholder="Selecciona o crea beneficiario"
            disabled={!payees}
            disableClear={true}
            allowCreate
          />
        </div>
      );
    },
  },
  {
    accessorKey: "amount",
    header: "Monto",
    maxSize: 125,
    cell: (info) => {
      const [value, setValue] = useState<string>(info.row.original.amount);
      const [originalValue, setOriginalValue] = useState<string>(
        info.row.original.amount
      );
      // Handler for when the AmountInput value changes
      const handleChange = (newValue: string) => {
        setValue(newValue);
      };
      // Handler for when the input loses focus (onBlur)
      const handleBlur = async () => {
        // Only update if the value has actually changed
        if (value !== originalValue) {
          const success = await updateField({
            id: String(info.row.original.id),
            field: "amount",
            value: value,
          });
          if (success) {
            setOriginalValue(value);
            setValue(value);
          } else {
            setValue(originalValue);
          }
        }
      };
      // Handler for key down events
      const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Enter") {
          handleBlur(); // Trigger the same update logic as onBlur
        }
      };
      return (
        <AmountInput
          onChange={handleChange}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          placeholder="0.00"
          value={value}
        />
      );
    },
  },
  {
    accessorKey: "id",
    header: "Acciones",
    cell: () => {
      return (
        <div className="flex ">
          <Button size={"icon"} variant={"ghost"}>
            <Search />
            {/* {isLoading ? (
              <Loader2 className="animate-spin text-muted-foreground " />
            ) : (
              <CircleCheck className="text-primary" />
            )} */}
          </Button>
          {/* <RowDragHandleCell rowId={row.id} /> */}
          {/* <CategoryUpdateSheet id={row.id} /> */}
        </div>
      );
    },
  },
];
