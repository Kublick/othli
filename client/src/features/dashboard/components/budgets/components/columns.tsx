import { BudgetInput } from "@/components/ui/BudgetInput";
import { Tooltip, TooltipContent } from "@/components/ui/tooltip";
import { useUpdateBudget } from "@/features/dashboard/api/update-budget-item";
import { client } from "@/lib/client";
import { useLoadingStore } from "@/store/loading-store";
import { TooltipTrigger } from "@radix-ui/react-tooltip";
import type { ColumnDef } from "@tanstack/react-table";
import type { InferResponseType } from "hono";
import { MessageCircleQuestion, Search } from "lucide-react";
import { useState } from "react";
// import { BudgetTooltip } from "./budgeted-tooltip";

export type BudgetType = InferResponseType<
  typeof client.api.budgets.summary.$get,
  200
>;

// Helper for currency formatting
const formatCurrency = (
  value: number | null | undefined,
  placeholder: string = "MX$0.00"
) => {
  if (value === null || value === undefined || isNaN(value)) return placeholder;
  return `$${value.toLocaleString("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

// This will be the type for each row in the budget tables
export interface CategoryRowData {
  id: string;
  name: string;
  isIncome: boolean;
  budgetable: number | null;
  budgeted: number | null;
  activity: number;
  ocurrences?: {
    month: string;
    activity: number;
    budgeted: number;
    balance: number;
  }[];
}

function ExpectedCell({ info }: { info: any }) {
  const rowId = String(info.row.original.id);
  const initialValue = info.getValue();
  const [value, setValue] = useState<string>(info.row.original.budgeted ?? "");
  const [originalValue, setOriginalValue] = useState<string>(
    info.row.original.budgeted ?? ""
  );

  const updateItemMutation = useUpdateBudget();

  const { start_date } = info.table.options?.meta;

  const isRowLoading = useLoadingStore((state) => state.isRowLoading(rowId));
  const setRowLoading = useLoadingStore((state) => state.setRowLoading);

  const handleChange = (newValue: string) => setValue(newValue);

  if (initialValue === null && value === null)
    return <div className="text-right ">{formatCurrency(null)} </div>;

  const handleBlur = async () => {
    if (value !== originalValue) {
      setRowLoading(rowId, true);

      try {
        await updateItemMutation.mutateAsync({
          id: rowId,
          amount: +value,
          budget_month: start_date,
        });
        setOriginalValue(value);
      } catch (e) {
        setValue(originalValue);
      } finally {
        setRowLoading(rowId, false);
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
    <div className="flex items-center gap-2">
      <BudgetInput
        onChange={handleChange}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        value={value}
        disabled={isRowLoading}
      />
      {/* <BudgetTooltip
        data={info.row.original}
        // onClear={() => handleInputChange(itemData.id, '0')} // Example clear handler
      /> */}
    </div>
  );
}

export const inflowTableColumns: ColumnDef<CategoryRowData>[] = [
  {
    id: "categoryName",
    accessorKey: "name",
    header: () => (
      <div className="text-left pl-4 font-semibold uppercase tracking-wider">
        Ingresos
      </div>
    ),
    cell: (info) => (
      <div className="pl-4 font-medium ">{info.getValue<string>()}</div>
    ),
    size: 280,
  },
  {
    accessorKey: "expected",
    header: () => (
      <div className="font-semibold  uppercase tracking-wider flex gap-2 items-center hover:text-black">
        Presupuesto
        <Tooltip>
          <TooltipTrigger asChild>
            <MessageCircleQuestion size={14} />
          </TooltipTrigger>
          <TooltipContent>
            Cantidad de ingresos esperados en esta categoria.
          </TooltipContent>
        </Tooltip>
      </div>
    ),
    cell: (info) => <ExpectedCell info={info} />,
    size: 180,
  },
  {
    accessorKey: "activity",
    header: () => (
      <div className="flex justify-end gap-2 items-center text-right font-semibold uppercase tracking-wider">
        Actividad
      </div>
    ),
    cell: (info) => (
      <div className="flex justify-end w-full">
        <div className="flex justify-between items-center gap-2">
          {info.getValue<number>() !== 0 && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Search size={14} />
              </TooltipTrigger>
              <TooltipContent>Ver transacciones</TooltipContent>
            </Tooltip>
          )}
          <div className="text-right ">
            {formatCurrency(info.getValue<number>())}
          </div>
        </div>
      </div>
    ),
    size: 120, // Adjusted size
  },
  {
    accessorKey: "budgetable",
    header: () => (
      <div className="flex items-center gap-2 justify-end text-right font-semibold  uppercase tracking-wider hover:text-black">
        Disponible
        <Tooltip>
          <TooltipTrigger asChild>
            <MessageCircleQuestion size={14} />
          </TooltipTrigger>
          <TooltipContent>
            Cantidad disponible para presupuestar en esta categoria.
          </TooltipContent>
        </Tooltip>
      </div>
    ),
    cell: (info) => (
      <div className="text-right font-bold text-green-700">
        {formatCurrency(info.getValue<number | null>())}
      </div>
    ),
    size: 180, // Adjusted size
  },
  {
    id: "actionsInflow",
    header: () => <div className="w-8"></div>, // Empty header for spacing
    cell: () => (
      <div className="text-center  hover: cursor-pointer">
        {/* Icon placeholder e.g. ChevronRightIcon */}❯
      </div>
    ),
    size: 60, // Adjusted size
  },
];

export const outflowTableColumns: ColumnDef<CategoryRowData>[] = [
  {
    id: "categoryName",
    accessorKey: "name",
    header: () => (
      <div className="text-left pl-4 font-semibold  uppercase tracking-wider">
        Gastos
      </div>
    ),
    cell: (info) => (
      <div className="pl-4 font-medium ">{info.getValue<string>()}</div>
    ),
    size: 280,
  },
  {
    accessorKey: "budgeted",
    header: () => (
      <div className="font-semibold  uppercase tracking-wider flex gap-2 items-center hover:text-black">
        Presupuestado
        <Tooltip>
          <TooltipTrigger asChild>
            <MessageCircleQuestion size={14} />
          </TooltipTrigger>
          <TooltipContent>
            Cantidad de gastos esperados en esta categoria.
          </TooltipContent>
        </Tooltip>
      </div>
    ),
    cell: (info) => <ExpectedCell info={info} />,

    size: 180,
  },
  {
    accessorKey: "activity",
    header: () => (
      <div className="text-right font-semibold  uppercase tracking-wider">
        Actividad
      </div>
    ),
    cell: (info) => {
      return (
        <div className="flex justify-end">
          <div className="flex justify-between items-center gap-2">
            {info.getValue<number>() !== 0 && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Search size={14} />
                </TooltipTrigger>
                <TooltipContent>Ver transacciones</TooltipContent>
              </Tooltip>
            )}
            <div className="text-right ">
              {formatCurrency(info.getValue<number>())}
            </div>
          </div>
        </div>
      );
    },

    size: 120,
  },
  {
    accessorKey: "budgetable", // Changed from "available"
    header: () => (
      <div className="flex items-center gap-2 justify-end text-right font-semibold  uppercase tracking-wider hover:text-black">
        Disponible
        <Tooltip>
          <TooltipTrigger asChild>
            <MessageCircleQuestion size={14} />
          </TooltipTrigger>
          <TooltipContent>
            Cantidad disponible para presupuestar en este periodo.
          </TooltipContent>
        </Tooltip>
      </div>
    ),
    cell: (info) => {
      const budgetableAmount = info.getValue<number | null>(); // Changed variable name for clarity
      let textColor = "";
      if (budgetableAmount !== null && budgetableAmount > 0)
        textColor = "text-green-700 font-bold";
      else if (budgetableAmount !== null && budgetableAmount < 0)
        textColor = "text-red-700 font-bold";
      else if (budgetableAmount === 0) textColor = ""; // For MX$0.00

      return (
        <div className={`text-right ${textColor}`}>
          {formatCurrency(budgetableAmount)}
        </div>
      );
    },
    size: 180,
  },
  {
    id: "actionsOutflow",
    header: () => <div className="w-8"></div>, // Empty header for spacing
    cell: () => (
      <div className="text-center  hover: cursor-pointer">
        {/* Icon placeholder e.g. ChevronRightIcon */}❯
      </div>
    ),
    size: 60,
  },
];

// Keeping the original InflowColumn and BudgetType for now, in case they are used elsewhere.
// Consider removing if they are fully replaced by the new structure for budget display.
// const InflowColumn: ColumnDef<BudgetType>[] = [
//   {
//     header: "Ingresos",
//     accessorKey: "categories",
//     cell: (info) => {
//       return info.row.original.categories.map((category) => category.isIncome);
//     },
//   },
// ];
