import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
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

import {
  DndContext,
  closestCenter,
  type DragEndEvent,
  useSensor,
  useSensors,
  PointerSensor,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { useEffect, useMemo, useState } from "react";
import type { Category } from "./columns";
import {
  restrictToParentElement,
  restrictToVerticalAxis,
} from "@dnd-kit/modifiers";
import { client } from "@/lib/client";
import { toast } from "sonner";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: Category[];
  onOrderChange?: (newData: Category[]) => void;
}

const NO_HOVER_COLUMNS = [
  "isIncome",
  "excludeFromBudget",
  "excludeFromTotals",
  "actions",
];

export function DataTable({
  columns,
  data,
  onOrderChange,
}: DataTableProps<Category, unknown>) {
  const [tableData, setTableData] = useState<Category[]>([]);

  useEffect(() => {
    setTableData(data);
  }, [data]);

  const rowIds = useMemo(
    () => tableData.map((item) => item.id.toString()),
    [tableData]
  );

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const table = useReactTable({
    data: tableData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (row) => row.id.toString(),
  });

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (active && over && active.id !== over.id) {
      setTableData((prevData) => {
        const oldIndex = prevData.findIndex(
          (item) => item.id.toString() === active.id
        );
        const newIndex = prevData.findIndex(
          (item) => item.id.toString() === over.id
        );
        let newData = arrayMove(prevData, oldIndex, newIndex);

        // Assign new order values: 0 at the top, nulls at the bottom
        let orderValue = 0;
        newData = newData.map((item) => {
          // If order is null, keep it at the bottom
          if (item.order === null) return item;
          return { ...item, order: orderValue++ };
        });
        // Move null order items to the bottom
        const withOrder = newData.filter((item) => item.order !== null);
        const withoutOrder = newData.filter((item) => item.order === null);
        newData = [...withOrder, ...withoutOrder];

        if (onOrderChange) {
          onOrderChange(newData);
        }

        (async () => {
          try {
            let updates = withOrder.map((item) => ({
              id: item.id,
              order: item.order,
            }));

            await client.api.categories.order.$post({
              json: updates,
            });
            toast.success("Orden de categorias actualizado");
          } catch (error) {
            // Optionally handle error (e.g., show toast)
            toast.error("No fue posible actualizar reporte al administrador");
          }
        })();

        return newData;
      });
    }
  };

  const DraggableRow = ({ row }: { row: any }) => {
    const { setNodeRef, transform, transition, isDragging } = useSortable({
      id: row.id,
    });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0.8 : 1,
      zIndex: isDragging ? 1 : 0,
      position: "relative" as const,
    };

    return (
      <TableRow
        ref={setNodeRef}
        style={style}
        data-state={row.getIsSelected() && "selected"}
        className={isDragging ? "text-primary" : ""}
      >
        {row.getVisibleCells().map((cell: any) => {
          const cellClasses = NO_HOVER_COLUMNS.includes(cell.column.id)
            ? ""
            : "hover:bg-transparent dark:bg-transparent";

          return (
            <TableCell key={cell.id} className={cellClasses}>
              {flexRender(cell.column.columnDef.cell, cell.getContext())}
            </TableCell>
          );
        })}
      </TableRow>
    );
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
      modifiers={[restrictToVerticalAxis, restrictToParentElement]}
    >
      <SortableContext items={rowIds} strategy={verticalListSortingStrategy}>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {tableData.length ? (
                table
                  .getRowModel()
                  .rows.map((row) => <DraggableRow key={row.id} row={row} />)
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length + 1}
                    className="h-24 text-center"
                  >
                    No hay resultados.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </SortableContext>
    </DndContext>
  );
}
