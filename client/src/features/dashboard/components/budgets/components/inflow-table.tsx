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
} from "../../../../../components/ui/table";

import { useEffect, useState } from "react";

import type { BudgetType } from "./columns";
// import { InputIcon } from '@/components/ui/input-icon';
import React from "react";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: BudgetType[];
}

export function InflowTable({
  columns,
  data,
}: DataTableProps<BudgetType, unknown>) {
  const [tableData, setTableData] = useState<BudgetType[]>([]);
  const [filtering, setFiltering] = useState("");

  useEffect(() => {
    setTableData(data);
  }, [data]);

  const table = useReactTable({
    data: tableData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (row) => row.categories[0].id.toString(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      globalFilter: filtering,
    },
    onGlobalFilterChange: setFiltering,
    // globalFilterFn: "includesString",
  });

  return (
    <div>
      <div className="flex justify-end pb-8 items-center">
        {/* <InputIcon
          type="text w-64"
          value={filtering ?? ""}
          onChange={(e) => setFiltering(String(e.target.value))}
          placeholder="Buscar"
          fullWidth={false}
        /> */}
      </div>

      <div className="rounded-md border">
        {/* Apply table-layout: fixed here */}
        <Table style={{ tableLayout: "fixed" }}>
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
