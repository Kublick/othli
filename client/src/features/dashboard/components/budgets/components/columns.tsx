import { BudgetInput } from "@/components/ui/BudgetInput";
import { useUpdateBudget } from "@/features/dashboard/api/update-budget-item";
import { client } from "@/lib/client";
import { useLoadingStore } from "@/store/loading-store";
import type { ColumnDef } from "@tanstack/react-table";
import type { InferResponseType } from "hono";
import { useState, useEffect } from "react";
import { toast } from "sonner";

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
  return `MX$${value.toLocaleString("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

// This will be the type for each row in the budget tables
export interface CategoryRowData {
  id: string;
  name: string;
  isIncome: boolean; // Used for filtering into inflow/outflow lists by parent
  // Inflow specific fields (populated if isIncome is true)
  budgetable: number | null;
  // Outflow specific fields (populated if isIncome is false)
  budgeted: number | null;
  available: number | null;
  // Common field for activity
  activity: number;
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

  console.log(start_date);

  const isRowLoading = useLoadingStore((state) => state.isRowLoading(rowId));
  const setRowLoading = useLoadingStore((state) => state.setRowLoading);

  const handleChange = (newValue: string) => setValue(newValue);

  if (initialValue === null && value === null)
    return (
      <div className="text-right text-gray-500">{formatCurrency(null)} </div>
    );

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
    <BudgetInput
      onChange={handleChange}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      value={value}
      disabled={isRowLoading}
    />
  );
}

export const inflowTableColumns: ColumnDef<CategoryRowData>[] = [
  {
    id: "categoryName",
    accessorKey: "name",
    header: () => (
      <div className="text-left pl-4 font-semibold text-gray-600 uppercase tracking-wider">
        Presupuestado
      </div>
    ),
    cell: (info) => (
      <div className="pl-4 font-medium text-gray-800">
        {info.getValue<string>()}
      </div>
    ),
    size: 280, // Increased size for name
  },
  {
    accessorKey: "expected",
    header: () => (
      <div className="font-semibold text-gray-600 uppercase tracking-wider">
        Presupuesto
      </div>
    ),
    cell: (info) => <ExpectedCell info={info} />,
    size: 180,
  },
  {
    accessorKey: "activity",
    header: () => (
      <div className="text-right font-semibold text-gray-600 uppercase tracking-wider">
        Actividad
      </div>
    ),
    cell: (info) => (
      <div className="text-right text-gray-700">
        {formatCurrency(info.getValue<number>())}
      </div>
    ),
    size: 180, // Adjusted size
  },
  {
    accessorKey: "budgetable",
    header: () => (
      <div className="text-right font-semibold text-gray-600 uppercase tracking-wider">
        Disponible
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
      <div className="text-center text-gray-400 hover:text-gray-600 cursor-pointer">
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
      <div className="text-left pl-4 font-semibold text-gray-600 uppercase tracking-wider">
        Gastos
      </div>
    ),
    cell: (info) => (
      <div className="pl-4 font-medium text-gray-800">
        {info.getValue<string>()}
      </div>
    ),
    size: 280,
  },
  {
    accessorKey: "budgeted",
    header: () => (
      <div className=" font-semibold text-gray-600 uppercase tracking-wider">
        Presupuestado
      </div>
    ),
    cell: (info) => <ExpectedCell info={info} />,

    size: 180,
  },
  {
    accessorKey: "activity",
    header: () => (
      <div className="text-right font-semibold text-gray-600 uppercase tracking-wider">
        Actividad
      </div>
    ),
    cell: (info) => {
      return (
        <div className="text-right text-gray-700">
          {formatCurrency(info.getValue<number>())}
        </div>
      );
    },
    size: 180,
  },
  {
    accessorKey: "available",
    header: () => (
      <div className="text-right font-semibold text-gray-600 uppercase tracking-wider">
        Disponible
      </div>
    ),
    cell: (info) => {
      const available = info.getValue<number | null>();
      let textColor = "text-gray-700";
      if (available !== null && available > 0)
        textColor = "text-green-700 font-bold";
      else if (available !== null && available < 0)
        textColor = "text-red-700 font-bold";
      else if (available === 0) textColor = "text-gray-500"; // For MX$0.00

      return (
        <div className={`text-right ${textColor}`}>
          {formatCurrency(available)}
        </div>
      );
    },
    size: 180,
  },
  {
    id: "actionsOutflow",
    header: () => <div className="w-8"></div>, // Empty header for spacing
    cell: () => (
      <div className="text-center text-gray-400 hover:text-gray-600 cursor-pointer">
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
