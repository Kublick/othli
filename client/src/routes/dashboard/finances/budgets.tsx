import { createFileRoute } from "@tanstack/react-router";
import {
  inflowTableColumns,
  outflowTableColumns,
  type CategoryRowData,
} from "@/features/dashboard/components/budgets/components/columns";

import { client } from "@/lib/client";

import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import {
  addMonths,
  endOfMonth,
  format,
  startOfMonth,
  subMonths,
} from "date-fns";
import { getBudgets } from "@/features/dashboard/api/get-budgets";
import { BudgetCategoryTable } from "@/features/dashboard/components/budgets/components/budget-category-table";
import BudgetOverview from "@/features/dashboard/components/budgets/components/budget-overview";

const fetchBudgetSummary = async (start_date: string, end_date: string) => {
  const res = await client.api.budgets.summary.$get({
    query: {
      start_date,
      end_date,
    },
  });
  if (!res.ok) {
    throw new Error("Failed to fetch budget summary");
  }

  return res.json();
};

export const Route = createFileRoute("/dashboard/finances/budgets")({
  component: BudgetsPage,
});

function transformBudgetData(
  data: Awaited<ReturnType<typeof fetchBudgetSummary>>
): {
  inflowData: CategoryRowData[];
  outflowData: CategoryRowData[];
} {
  const inflowData: CategoryRowData[] = [];
  const outflowData: CategoryRowData[] = [];

  data.categories.forEach((category) => {
    const categoryRow: CategoryRowData = {
      id: category.id.toString(),
      name: category.name,
      isIncome: category.isIncome,
      budgeted: category.totalBudgeted,
      activity: category.totalActivity,
      budgetable: category.totalBalance,
      ocurrences: category.occurrences,
    };

    if (category.isIncome) {
      inflowData.push(categoryRow);
    } else {
      outflowData.push(categoryRow);
    }

    return { inflowData, outflowData };
  });

  return { inflowData, outflowData };
}

function BudgetsPage() {
  const [currentDate, setCurrentDate] = useState(new Date());

  const firstDayOfMonth = startOfMonth(currentDate);
  const lastDayOfMonth = endOfMonth(currentDate);

  const start_date = format(firstDayOfMonth, "yyyy-MM-dd");
  const end_date = format(lastDayOfMonth, "yyyy-MM-dd");

  const { data: budgetData } = getBudgets({
    start_date,
    end_date,
  });

  const formattedDate = currentDate.toLocaleDateString("es-MX", {
    month: "long",
    year: "numeric",
  });

  const displayDate =
    formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);

  const { inflowData, outflowData } = budgetData
    ? transformBudgetData(budgetData)
    : { inflowData: [], outflowData: [] };

  const goToPreviousMonth = () => {
    setCurrentDate((prevDate) => subMonths(prevDate, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate((prevDate) => addMonths(prevDate, 1));
  };

  return (
    <div>
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
      <div className="grid lg:grid-cols-5 gap-4 ">
        <div className="col-span-4 space-y-8">
          <BudgetCategoryTable
            data={inflowData}
            columns={inflowTableColumns}
            start_date={start_date}
          />
          <BudgetCategoryTable
            data={outflowData}
            columns={outflowTableColumns}
            start_date={start_date}
          />
        </div>

        <div className="mt-8">
          <BudgetOverview inflowData={inflowData} outflowData={outflowData} />
        </div>
      </div>
    </div>
  );
}
