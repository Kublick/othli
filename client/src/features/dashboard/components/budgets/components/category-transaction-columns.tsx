import type { CategoryTransactionType } from "@/types/index";
import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { es } from "date-fns/locale/es";
import { formatCurrency } from "@/lib/utils";

const formatDate = (date: Date): string => {
  let formatted = format(date, "EEE, MMM d y", { locale: es });
  formatted = formatted.replace(/\./g, "");
  return formatted.replace(/(^|\s)([a-z])/g, (match) => match.toUpperCase());
};

export const categoryTransactionColumns: ColumnDef<CategoryTransactionType>[] =
  [
    {
      accessorKey: "date",
      header: () => (
        <div className="text-left pl-4 font-semibold uppercase tracking-wider">
          Fecha
        </div>
      ),
      cell: (info) => {
        const newDate = info.getValue() as Date;

        const date = formatDate(newDate);

        return <div>{date}</div>;
      },
    },
    {
      id: "categoryName",
      accessorKey: "category.name",
      header: () => (
        <div className="text-left pl-4 font-semibold uppercase tracking-wider">
          Categoria
        </div>
      ),
      cell: (info) => {
        return (
          <div className="pl-4 font-medium ">{info.getValue<string>()}</div>
        );
      },
    },
    {
      id: "payeeName",
      accessorKey: "payee.name",
      header: () => (
        <div className="text-left pl-4 font-semibold uppercase tracking-wider">
          Beneficiario
        </div>
      ),
      cell: (info) => (
        <div className="pl-4 font-medium ">{info.getValue<string>()}</div>
      ),
    },
    {
      id: "amount",
      accessorKey: "amount",
      header: () => (
        <div className="text-left pl-4 font-semibold uppercase tracking-wider">
          Monto
        </div>
      ),
      cell: (info) => {
        const amount = Number(info.getValue<string>());

        return (
          <div
            className={` ${amount > 0 ? "text-primary" : "text-red-600"}  pl-4 font-medium `}
          >
            {formatCurrency(amount)}
          </div>
        );
      },
    },
  ];
