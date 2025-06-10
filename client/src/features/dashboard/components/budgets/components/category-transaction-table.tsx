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
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { useEffect, useState } from "react";

import type { CategoryTransactionType } from "@/types/index";

interface DataTableProps<TData extends CategoryTransactionType, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  tableTitle?: string;
}

export function CategoryTransactionTable({
  columns,
  data,
}: DataTableProps<CategoryTransactionType, unknown>) {
  const [tableData, setTableData] = useState<CategoryTransactionType[]>([]);
  const [filtering, setFiltering] = useState("");

  useEffect(() => {
    setTableData(data);
  }, [data]);

  const table = useReactTable({
    data: tableData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    state: {
      globalFilter: filtering,
    },
    onGlobalFilterChange: setFiltering,
    // globalFilterFn: "includesString",
  });

  return (
    <div className="py-4 lg:py-8">
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
          {/* <TableFooter>
              <TableRow>
                <TableCell className="pl-6">Totales</TableCell>
                <TableCell className="pl-5">
                  {formatCurrency(totalBudgeted)}
                </TableCell>
                <TableCell className="text-right">
                  {formatCurrency(totalActivity)}
                </TableCell>
                <TableCell className="text-right">
                  {formatCurrency(totalBudgeteable)}
                </TableCell>
                <TableCell className="text-right"></TableCell>
              </TableRow>
            </TableFooter> */}
        </Table>
      </div>
    </div>
  );
}
