import type { ColumnDef } from "@tanstack/react-table";
import { Loader2, CircleCheck } from "lucide-react";
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
import { getPayees } from "@/features/dashboard/api/get-payees";
import { useQueryClient } from "@tanstack/react-query";
import { AmountInput } from "@/components/ui/AmountInput";
import { useLoadingStore } from "@/store/loading-store";
import TransactionUpdateSheet from "./transaction-update-sheet";

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

// Enhanced updateField function that returns the response
const updateField = async ({
  id,
  field,
  value,
  setLoading,
}: {
  id: string;
  field: string;
  value: string | number | Date;
  setLoading: (isLoading: boolean) => void;
}) => {
  setLoading(true);
  try {
    ///ADD a delay of 2 secons to simulate a delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const resp = await client.api.transactions.field.$patch({
      json: {
        id,
        field,
        value,
      },
    });

    if (resp.ok) {
      toast.success("Transacción actualizada");
      return { success: true, data: await resp.json() };
    } else {
      toast.error("Error al actualizar la transacción");
      return { success: false, error: await resp.text() };
    }
  } catch (error) {
    toast.error("Error en la conexión");
    return { success: false, error };
  } finally {
    setLoading(false);
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
    size: 60,
    cell: (info) => {
      const rowId = String(info.row.original.id);
      const isRowLoading = useLoadingStore((state) =>
        state.isRowLoading(rowId)
      );
      const setRowLoading = useLoadingStore((state) => state.setRowLoading);
      const [value, setValue] = useState(info.row.original.date);
      const [isPopoverOpen, setIsPopoverOpen] = useState(false);

      const handleDateChange = async (newDate?: Date) => {
        if (newDate) {
          const result = await updateField({
            id: rowId,
            field: "date",
            value: newDate,
            setLoading: (isLoading) => setRowLoading(rowId, isLoading),
          });

          if (result.success) {
            setValue(newDate);
          }
          setIsPopoverOpen(false);
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
              disabled={isRowLoading}
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
    size: 100,
    cell: (info) => {
      const rowId = String(info.row.original.id);
      const isRowLoading = useLoadingStore((state) =>
        state.isRowLoading(rowId)
      );
      const setRowLoading = useLoadingStore((state) => state.setRowLoading);
      const { data: categories } = getCategories();
      const [value, setValue] = useState(info.getValue());

      const handleUpdate = async (newValue: string) => {
        if (newValue !== info.getValue()) {
          await updateField({
            id: rowId,
            field: "categoryId",
            value: newValue,
            setLoading: (isLoading) => setRowLoading(rowId, isLoading),
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
            value={categoriesMap?.find((cat) => cat.label === value)?.value}
            onChange={handleChange}
            placeholder="Selecciona una categoria"
            disabled={!categories || isRowLoading}
            disableClear={true}
          />
        </div>
      );
    },
  },
  {
    accessorKey: "payee.name",
    header: "Beneficiario",
    size: 300,
    cell: (info) => {
      const rowId = String(info.row.original.id);
      const isRowLoading = useLoadingStore((state) =>
        state.isRowLoading(rowId)
      );
      const setRowLoading = useLoadingStore((state) => state.setRowLoading);
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
          const result = await updateField({
            id: rowId,
            field: "payeeId",
            value: selectedValueOrName,
            setLoading: (isLoading) => setRowLoading(rowId, isLoading),
          });

          if (result.success) {
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
            disabled={!payees || isRowLoading}
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
    size: 90,
    cell: (info) => {
      const rowId = String(info.row.original.id);
      const isRowLoading = useLoadingStore((state) =>
        state.isRowLoading(rowId)
      );
      const setRowLoading = useLoadingStore((state) => state.setRowLoading);
      const [value, setValue] = useState<string>(info.row.original.amount);
      const [originalValue, setOriginalValue] = useState<string>(
        info.row.original.amount
      );

      const handleChange = (newValue: string) => {
        setValue(newValue);
      };

      const handleBlur = async () => {
        if (value !== originalValue) {
          const result = await updateField({
            id: rowId,
            field: "amount",
            value: value,
            setLoading: (isLoading) => setRowLoading(rowId, isLoading),
          });

          if (result.success) {
            setOriginalValue(value);
          } else {
            setValue(originalValue);
          }
        }
      };

      const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Enter") {
          event.preventDefault();
          (event.target as HTMLInputElement).blur();
        } else if (event.key === "Escape") {
          setValue(originalValue);
          (event.target as HTMLInputElement).blur();
        }
      };

      return (
        <div>
          <AmountInput
            onChange={handleChange}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            placeholder="0.00"
            value={value}
            disabled={isRowLoading}
          />
        </div>
      );
    },
  },
  {
    accessorKey: "id",
    size: 40,
    header: "Acciones",
    cell: (info) => {
      const [open] = useState(false);
      const rowId = String(info.row.original.id);
      const isRowLoading = useLoadingStore((state) =>
        state.isRowLoading(rowId)
      );

      return (
        <div className="flex">
          <Button size={"icon"} variant={"ghost"} disabled={isRowLoading}>
            {isRowLoading ? (
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
            ) : (
              <CircleCheck className="text-primary" />
            )}
          </Button>
          <TransactionUpdateSheet id={rowId} isOpen={open} />
        </div>
      );
    },
  },
];
