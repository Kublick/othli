import { Button } from "@/components/ui/button";
import { budgetQueryOptions } from "@/features/dashboard/api/get-budgets";
import { BudgetCategoryTable } from "@/features/dashboard/components/budgets/components/budget-category-table";
import BudgetOverview from "@/features/dashboard/components/budgets/components/budget-overview";
import {
  inflowTableColumns,
  outflowTableColumns,
  type CategoryRowData,
} from "@/features/dashboard/components/budgets/components/columns";
import { createFileRoute, redirect, useRouter } from "@tanstack/react-router";
import { format, startOfMonth } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { type BudgetResponseType } from "@/types/index";
import { Suspense, useCallback, useMemo } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import LoadingComponent from "@/features/dashboard/components/budgets/components/loading-component";

export const Route = createFileRoute("/dashboard/budgets/$year/$month/$day")({
  parseParams: (
    params
  ): {
    year: number;
    month: number;
    day: number;
  } => ({
    year: parseInt(params.year, 10),
    month: parseInt(params.month, 10),
    day: parseInt(params.day, 10),
  }),
  beforeLoad: async ({ params }) => {
    const { year, month, day } = params;

    if (year < 2021 || year > 2025 || month < 1 || month > 12 || day > 31) {
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();
      const currentMonth = currentDate.getMonth() + 1;

      throw redirect({
        to: `/dashboard/budgets/$year/$month/$day`,
        params: { year: currentYear, month: currentMonth, day: 1 },
      });
    }

    return { params: { year, month, day } };
  },
  loader: async ({ params, context }) => {
    const { year, month, day } = params;
    const firstDayOfMonth = startOfMonth(new Date(year, month - 1, day));
    const lastDayOfMonth = new Date(year, month, 0);
    const start_date = format(firstDayOfMonth, "yyyy-MM-dd");
    const end_date = format(lastDayOfMonth, "yyyy-MM-dd");

    void context.queryClient.prefetchQuery(
      budgetQueryOptions(start_date, end_date)
    );

    return {
      firstDayOfMonth,
      start_date,
      end_date,
    };
  },
  component: RouteComponent,
});

function transformBudgetData(data: BudgetResponseType): {
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
  });

  return { inflowData, outflowData };
}

function BudgetContent({
  start_date,
  end_date,
}: {
  start_date: string;
  firstDayOfMonth: Date;
  end_date: string;
}) {
  const { data } = useSuspenseQuery(budgetQueryOptions(start_date, end_date));
  const { inflowData, outflowData } = useMemo(
    () => transformBudgetData(data),
    [data]
  );

  const totalExpected = inflowData.reduce(
    (sum, row) => sum + (Number(row.budgeted) || 0),
    0
  );
  console.log("🚀 ~ totalExpected:", totalExpected);

  const totalOutflowBudggeted = outflowData.reduce(
    (sum, row) => sum + (Number(row.budgeted) || 0),
    0
  );

  const leftToBudget = totalExpected - totalOutflowBudggeted;
  console.log("🚀 ~ leftToBudget:", leftToBudget);

  return (
    <div className="grid lg:grid-cols-5 gap-4">
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
  );
}

function RouteComponent() {
  const { start_date, firstDayOfMonth, end_date } = Route.useLoaderData();
  const router = useRouter();

  const formattedDate = useMemo(() => {
    const date = firstDayOfMonth.toLocaleDateString("es-MX", {
      month: "long",
      year: "numeric",
    });
    return date.charAt(0).toUpperCase() + date.slice(1);
  }, [firstDayOfMonth]);

  const goToPreviousMonth = useCallback(() => {
    const date = firstDayOfMonth;
    const currentYear = date.getFullYear();
    const currentMonth = date.getMonth() + 1;

    router.navigate({
      to: `/dashboard/budgets/$year/$month/$day`,
      params: { year: currentYear, month: currentMonth - 1, day: 1 },
    });
  }, [firstDayOfMonth, router]);

  const goToNextMonth = useCallback(() => {
    const date = firstDayOfMonth;
    const currentYear = date.getFullYear();
    const currentMonth = date.getMonth() + 1;

    router.navigate({
      to: `/dashboard/budgets/$year/$month/$day`,
      params: { year: currentYear, month: currentMonth + 1, day: 1 },
    });
  }, [firstDayOfMonth, router]);

  return (
    <div className="container mx-auto">
      <div className="flex space-x-2 items-center">
        <Button variant="ghost" onClick={goToPreviousMonth}>
          <ChevronLeft />
        </Button>
        <Button variant="ghost" onClick={goToNextMonth}>
          <ChevronRight />
        </Button>
        <h2 className="scroll-m-20 text-3xl font-semibold tracking-tight first:mt-0">
          {formattedDate}
        </h2>
      </div>

      <Suspense fallback={<LoadingComponent />}>
        <BudgetContent
          start_date={start_date}
          firstDayOfMonth={firstDayOfMonth}
          end_date={end_date}
        />
      </Suspense>
    </div>
  );
}
