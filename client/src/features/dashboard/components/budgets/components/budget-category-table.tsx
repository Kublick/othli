import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { useEffect, useState } from "react";

import { InputIcon } from "@/components/ui/input-icon";
import type { CategoryRowData } from "./columns";

interface DataTableProps<TData extends CategoryRowData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  tableTitle?: string; // Optional title for the table (e.g., INFLOW, OUTFLOW)
  updateBudget?: (
    categoryId: string,
    field: "expected" | "budgeted",
    value: number
  ) => void;
}

export function BudgetCategoryTable({
  columns,
  data,
  updateBudget,
}: DataTableProps<CategoryRowData, unknown>) {
  const [tableData, setTableData] = useState<CategoryRowData[]>([]);
  const [filtering, setFiltering] = useState("");

  useEffect(() => {
    setTableData(data);
  }, [data]);

  const table = useReactTable({
    data: tableData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (row) => row.id, // Use the id from CategoryRowData
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      globalFilter: filtering,
    },
    onGlobalFilterChange: setFiltering,
    // globalFilterFn: "includesString",
    meta: {
      updateBudget,
    },
  });

  return (
    <div>
      <div className="flex justify-end pb-8 items-center">
        {/* Search input can be kept or removed based on whether it's needed for both tables or handled by a parent */}
        <InputIcon
          type="text w-64"
          value={filtering ?? ""}
          onChange={(e) => setFiltering(String(e.target.value))}
          placeholder="Buscar"
          fullWidth={false}
        />
      </div>

      <div className="rounded-md border">
        {/* Apply table-layout: fixed here */}
        <Table style={{ tableLayout: "fixed" }}>
          {/* The header row with INFLOW/OUTFLOW is now part of the column definition */}
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      style={{ width: `${header.getSize()}px` }} // Use the size from columnDef
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      style={{ width: `${cell.column.getSize()}px` }}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  Uh ho no hay resultados aun...
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
