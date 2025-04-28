import type { ColumnDef } from "@tanstack/react-table";
import { Check, GripVertical, Search } from "lucide-react";
import { useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { client } from "@/lib/client";

import CategoryUpdateSheet from "./update-category-sheet";
import { toast } from "sonner";
import { useSortable } from "@dnd-kit/sortable";

const CategorySchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string(),
  isIncome: z.boolean(),
  excludeFromBudget: z.boolean(),
  excludeFromTotals: z.boolean(),
  order: z.number(),
});

const updateField = async ({
  id,
  field,
  value,
}: {
  id: string;
  field: string;
  value: string;
}) => {
  await client.api.categories.field.$patch({
    json: {
      id,
      field,
      value,
    },
  });

  toast.success("Categoria actuallizada");
};

export type Category = z.infer<typeof CategorySchema>;

const RowDragHandleCell = ({ rowId }: { rowId: string }) => {
  const { attributes, listeners } = useSortable({
    id: rowId,
  });

  return (
    <Button size={"icon"} variant={"ghost"} {...attributes} {...listeners}>
      <GripVertical />
    </Button>
  );
};

export const columns: ColumnDef<Category>[] = [
  {
    accessorKey: "name",
    header: "Nombre",
    cell: (info) => {
      const [value, setValue] = useState(info.getValue());

      const handleUpdate = async () => {
        if (value !== info.getValue()) {
          await updateField({
            id: String(info.row.original.id),
            field: "name",
            value: value as string,
          });
        }
      };

      const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
          handleUpdate();
        }
      };

      return (
        <input
          className="w-full p-2 border border-transparent hover:border-primary focus:ring-1"
          value={value as string}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyPress}
          onBlur={handleUpdate}
        />
      );
    },
  },
  {
    accessorKey: "description",
    header: "Descripcion",
    cell: (info) => {
      const [value, setValue] = useState(info.getValue());

      const handleUpdate = async () => {
        if (value !== info.getValue()) {
          await updateField({
            id: String(info.row.original.id),
            field: "description",
            value: value as string,
          });
        }
      };

      const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
          handleUpdate();
        }
      };

      return (
        <input
          className="w-full p-2 border border-transparent hover:border-primary focus:ring-1  "
          value={value as string}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyPress}
          onBlur={handleUpdate}
        />
      );
    },
  },
  {
    accessorKey: "isIncome",
    header: "¿Es Ingreso?",

    cell: (info) => {
      return <div className="w-[24px]">{info.getValue() ? <Check /> : ""}</div>;
    },
  },
  {
    accessorKey: "excludeFromBudget",
    header: "Excluir ",

    cell: (info) => {
      return <div>{info.getValue() ? <Check /> : ""}</div>;
    },
  },
  {
    accessorKey: "excludeFromTotals",
    header: "ExcluirT",
    size: 100,
    cell: (info) => {
      return <div>{info.getValue() ? <Check /> : ""}</div>;
    },
  },
  {
    accessorKey: "id",
    header: "Acciones",
    cell: ({ row }) => {
      return (
        <div className="flex ">
          <Button size={"icon"} variant={"ghost"}>
            <Search />
          </Button>
          <RowDragHandleCell rowId={row.id} />
          <CategoryUpdateSheet id={row.id} />
        </div>
      );
    },
  },
];
