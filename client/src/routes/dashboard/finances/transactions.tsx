import { Button } from "@/components/ui/button";
import { getTransactions } from "@/features/dashboard/api/get-transactions";

import BulkUpload from "@/features/dashboard/transactions/components/bulk-upload";
import { Columns } from "@/features/dashboard/transactions/components/columns";
import CreateTransactionSheet from "@/features/dashboard/transactions/components/create-transaction-sheet";
import { TransactionTable } from "@/features/dashboard/transactions/components/transaction-table";
import { createFileRoute } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
// Import date-fns functions
import {
  startOfMonth,
  endOfMonth,
  subMonths,
  addMonths,
  format,
} from "date-fns";

const INITIAL_UPLOAD = {
  data: [],
  errors: [],
  meta: [],
};

export const Route = createFileRoute("/dashboard/finances/transactions")({
  component: RouteComponent,
});

function RouteComponent() {
  // const queryClient = useQueryClient(); // Remove if not used elsewhere after changes
  const [importedResults, setImportedResults] = useState(INITIAL_UPLOAD);
  const [currentDate, setCurrentDate] = useState(new Date());

  const firstDayOfMonth = startOfMonth(currentDate);
  const lastDayOfMonth = endOfMonth(currentDate);

  const start_date = format(firstDayOfMonth, "yyyy-MM-dd");
  const end_date = format(lastDayOfMonth, "yyyy-MM-dd");

  const { data: transactions, isLoading: isLoadingTransactions } =
    getTransactions({
      start_date,
      end_date,
    });

  const formattedDate = currentDate.toLocaleDateString("es-MX", {
    month: "long",
    year: "numeric",
  });

  const displayDate =
    formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);

  const goToPreviousMonth = () => {
    setCurrentDate((prevDate) => subMonths(prevDate, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate((prevDate) => addMonths(prevDate, 1));
  };

  const onUpload = (results: typeof INITIAL_UPLOAD) => {
    setImportedResults(results);
  };

  if (isLoadingTransactions) {
    return (
      <div className="flex flex-col h-screen justify-center items-center">
        Cargando Registros
      </div>
    );
  }

  if (!transactions)
    return (
      <div className="flex flex-col h-screen justify-center items-center">
        No hay registros
      </div>
    );

  return (
    <div>
      <div className="md:my-16">
        <div className="flex space-x-2 items-center">
          <Button variant={"ghost"} onClick={goToPreviousMonth}>
            <ChevronLeft />
          </Button>
          <Button variant={"ghost"} onClick={goToNextMonth}>
            <ChevronRight />
          </Button>
          <h2 className="scroll-m-20 text-3xl font-semibold tracking-tight first:mt-0">
            {displayDate}
          </h2>
        </div>
        <div className="md:py-8">
          <div className="flex space-x-4">
            <CreateTransactionSheet />

            <BulkUpload onUpload={onUpload} />
          </div>
        </div>
        <div className="mb-6">{/* <CategorySheet /> */}</div>
        <TransactionTable data={transactions} columns={Columns} />
      </div>
    </div>
  );
}
