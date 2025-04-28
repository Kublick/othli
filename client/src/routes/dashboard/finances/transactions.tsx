import { Button } from "@/components/ui/button";
import { getTransactions } from "@/features/dashboard/api/get-transactions";

import BulkUpload from "@/features/dashboard/transactions/components/bulk-upload";
import { Columns } from "@/features/dashboard/transactions/components/columns";
import CreateTransactionSheet from "@/features/dashboard/transactions/components/create-transaction-sheet";
import { TransactionTable } from "@/features/dashboard/transactions/components/transaction-table";
import { createFileRoute } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";

const INITIAL_UPLOAD = {
  data: [],
  errors: [],
  meta: [],
};

export const Route = createFileRoute("/dashboard/finances/transactions")({
  component: RouteComponent,
});

function RouteComponent() {
  const [importedResults, setImportedResults] = useState(INITIAL_UPLOAD);
  const [currentDate, setCurrentDate] = useState(new Date());
  console.log(importedResults);
  // Calculate first and last day of the current month
  const firstDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  );
  const lastDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  );

  const { data: transactions, isLoading: isLoadingTransactions } =
    getTransactions({
      start_date: firstDayOfMonth.toISOString().slice(0, 10),
      end_date: lastDayOfMonth.toISOString().slice(0, 10),
    });

  const formattedDate = currentDate.toLocaleDateString("es-MX", {
    month: "long",
    year: "numeric",
  });

  const displayDate =
    formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);

  const goToPreviousMonth = () => {
    setCurrentDate((prevDate) => {
      const newDate = new Date(prevDate);
      newDate.setMonth(newDate.getMonth() - 1);
      return newDate;
    });
  };

  const goToNextMonth = () => {
    setCurrentDate((prevDate) => {
      const newDate = new Date(prevDate);
      newDate.setMonth(newDate.getMonth() + 1);
      return newDate;
    });
  };

  useEffect(() => {
    console.log("Selected date changed:", currentDate);
  }, [currentDate]);

  const onUpload = (results: typeof INITIAL_UPLOAD) => {
    console.log({ results });
    setImportedResults(results);
  };

  // const onCancelImport = () => {
  //   setImportedResults(INITIAL_UPLOAD);
  // };

  if (isLoadingTransactions) {
    return (
      <div className="flex flex-col h-screen justify-center items-center">
        Cargando Registros
      </div>
    );
  }
  console.log({ transactions });
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
