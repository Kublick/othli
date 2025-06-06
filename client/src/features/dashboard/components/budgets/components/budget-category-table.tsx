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

import type { CategoryRowData } from "./columns";

interface DataTableProps<TData extends CategoryRowData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  tableTitle?: string;
  start_date: string;
}

export function BudgetCategoryTable({
  columns,
  data,
  start_date,
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
      start_date,
    },
  });

  return (
    <div className="py-4 lg:py-8">
      {/* <div className="flex justify-end pb-8 items-center">
        <InputIcon
          type="text w-64"
          value={filtering ?? ""}
          onChange={(e) => setFiltering(String(e.target.value))}
          placeholder="Buscar"
          fullWidth={false}
        />
      </div> */}

      <div className="rounded-md border">
        <Table style={{ tableLayout: "fixed" }}>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      style={{ width: `${header.getSize()}px` }}
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
