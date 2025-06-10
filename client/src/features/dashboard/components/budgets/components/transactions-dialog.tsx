import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Search } from "lucide-react";
import { CategoryTransactionTable } from "./category-transaction-table";
import { categoryTransactionColumns } from "./category-transaction-columns";
import { getCategoryTransactions } from "@/features/dashboard/api/get-category-transactions";
import { useState } from "react";

interface Props {
  id: string;
}

const TransactionsDialog = ({ id }: Props) => {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost">
          <Search />
        </Button>
      </DialogTrigger>
      <DialogContent className="min-w-6xl">
        <DialogHeader>
          <DialogTitle>Transacciones</DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>

        {open && <TransactionsTableContent id={id} />}

        <DialogFooter className="justify-end">
          <DialogClose asChild>
            <Button type="button" variant="default">
              Cerrar
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

function TransactionsTableContent({ id }: { id: string }) {
  const { data } = getCategoryTransactions({
    id,
    start_date: "2025-06-01",
    end_date: "2025-06-30",
    enabled: true,
  });

  if (!data) return;
  return (
    <CategoryTransactionTable
      columns={categoryTransactionColumns}
      data={data}
    />
  );
}

export default TransactionsDialog;
