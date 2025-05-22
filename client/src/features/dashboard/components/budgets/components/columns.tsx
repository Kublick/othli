import { client } from "@/lib/client";
import type { ColumnDef } from "@tanstack/react-table";
import type { InferResponseType } from "hono";
import { useState, useEffect } from "react";

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
  expected: number | null;
  budgetable: number | null;

  // Outflow specific fields (populated if isIncome is false)
  budgeted: number | null;
  available: number | null;

  // Common field for activity
  activity: number;
}

export const inflowTableColumns: ColumnDef<CategoryRowData>[] = [
  {
    id: "categoryName",
    accessorKey: "name",
    header: () => (
      <div className="text-left pl-4 font-semibold text-gray-600 uppercase tracking-wider">
        INFLOW
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
      <div className="text-right font-semibold text-gray-600 uppercase tracking-wider">
        EXPECTED
      </div>
    ),
    cell: (info) => {
      const initialValue = info.getValue<number | null>();
      const [value, setValue] = useState(initialValue);
      const { updateBudget } = info.table.options.meta as any; // Assuming meta.updateBudget exists

      useEffect(() => {
        setValue(initialValue);
      }, [initialValue]);

      const handleUpdate = () => {
        const numericValue = Number(value);
        if (!isNaN(numericValue) && numericValue !== initialValue) {
          updateBudget?.(info.row.original.id, "expected", numericValue);
        }
      };

      if (initialValue === null && value === null)
        // Show placeholder if initial is null and not being edited
        return (
          <div className="text-right text-gray-500">
            {formatCurrency(null)}{" "}
            {/* Or a specific placeholder like "MX$0.00" if preferred */}
          </div>
        );

      return (
        <input
          type="number" // Use type="number" for better input handling
          className="text-right w-full px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          value={value ?? ""}
          onChange={(e) => setValue(Number(e.target.value))}
          onBlur={handleUpdate}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleUpdate();
              (e.target as HTMLInputElement).blur(); // Lose focus to prevent double update on blur
            }
          }}
          placeholder="MX$0.00"
        />
      );
    },

    size: 180,
  },
  {
    accessorKey: "activity",
    header: () => (
      <div className="text-right font-semibold text-gray-600 uppercase tracking-wider">
        ACTIVITY
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
        BUDGETABLE
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
        OUTFLOW
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
      <div className="text-right font-semibold text-gray-600 uppercase tracking-wider">
        BUDGETED
      </div>
    ),
    cell: (info) => {
      const initialValue = info.getValue<number | null>();
      const [value, setValue] = useState(initialValue);
      const { updateBudget } = info.table.options.meta as any; // Assuming meta.updateBudget exists

      useEffect(() => {
        setValue(initialValue);
      }, [initialValue]);

      const handleUpdate = () => {
        const numericValue = Number(value);
        if (!isNaN(numericValue) && numericValue !== initialValue) {
          updateBudget?.(info.row.original.id, "budgeted", numericValue);
        }
      };

      if (initialValue === null && value === null)
        // Show placeholder if initial is null and not being edited
        return (
          <div className="text-right text-gray-500">
            {formatCurrency(null)}{" "}
            {/* Or a specific placeholder like "MX$0.00" if preferred */}
          </div>
        );

      return (
        <input
          type="number" // Use type="number" for better input handling
          className="text-right w-full px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          value={value ?? ""}
          onChange={(e) => setValue(Number(e.target.value))}
          onBlur={handleUpdate}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleUpdate();
              (e.target as HTMLInputElement).blur(); // Lose focus to prevent double update on blur
            }
          }}
          placeholder="MX$0.00"
        />
      );
    },
    size: 180,
  },
  {
    accessorKey: "activity",
    header: () => (
      <div className="text-right font-semibold text-gray-600 uppercase tracking-wider">
        ACTIVITY
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
        AVAILABLE
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
export const InflowColumn: ColumnDef<BudgetType>[] = [
  {
    header: "Ingresos",
    accessorKey: "categories",
    cell: (info) => {
      return info.row.original.categories.map((category) => category.isIncome);
    },
  },
];
