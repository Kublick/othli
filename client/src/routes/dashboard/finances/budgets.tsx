import { createFileRoute } from "@tanstack/react-router";
import {
  inflowTableColumns,
  outflowTableColumns,
  type CategoryRowData,
} from "@/features/dashboard/components/budgets/components/columns";
import { BudgetCategoryTable } from "@/features/dashboard/components/budgets/components/budget-category-table";
import { client } from "@/lib/client";
import {
  useSuspenseQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton"; // For loading state

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
  loader: () => {
    const year = new Date().getFullYear();
    const start_date = `${year}-05-01`;
    const end_date = `${year}-05-30`;
    return fetchBudgetSummary(start_date, end_date);
  },
  pendingComponent: BudgetLoadingSkeleton, // Add a loading component
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
    const activity = category.totalActivity;
    const budgeted = category.totalBudgeted;

    const categoryRow: CategoryRowData = {
      id: category.id.toString(),
      name: category.name,
      isIncome: category.isIncome,
      expected: 0,
      budgeted: 0,
      available: 0,
      activity: activity, // Set activity from totalActivity
      budgetable: 0,
    };

    if (category.isIncome) {
      categoryRow.expected = budgeted; // Expected is totalBudgeted for inflow
      categoryRow.budgetable = activity; // Budgetable is totalActivity for inflow
      inflowData.push(categoryRow);
    } else {
      categoryRow.budgeted = budgeted; // Budgeted is totalBudgeted for outflow
      categoryRow.available = budgeted - activity; // Available is totalBudgeted - totalActivity for outflow
      outflowData.push(categoryRow);
    }
  });

  return { inflowData, outflowData };
}

function BudgetsPage() {
  const queryClient = useQueryClient();
  const year = new Date().getFullYear(); // Assuming month is fixed for now, or needs to be dynamic
  // Define start_date and end_date earlier and remove unused month variables
  const start_date = `${year}-05-01`;
  const end_date = `${year}-05-31`;

  const updateBudgetMutation = useMutation({
    mutationFn: async (variables: {
      categoryId: string;
      field: "expected" | "budgeted";
      value: number;
    }) => {
      // TODO: Replace with actual API endpoint and payload structure
      // This is a placeholder for the actual API call
      // The endpoint might be something like /api/budgets/:categoryId/month/:month
      // or a general /api/budgets/update endpoint
      console.log(
        "Updating budget:",
        variables.categoryId,
        variables.field,
        variables.value,
        start_date // Corrected: use start_date
      );
      const response = await client.api.budgets.$post({
        json: {
          category_id: variables.categoryId,
          amount: variables.value,
          budget_month: start_date,
        },
      });
      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(
          `Failed to update budget: ${errorData || response.statusText}`
        );
      }
      return response.json();
    },
    onSuccess: () => {
      // Invalidate and refetch the budget summary query to reflect changes
      // start_date and end_date are correctly captured from the outer scope
      queryClient.invalidateQueries({
        queryKey: ["budgetSummary", start_date, end_date],
      });
      console.log("Budget updated successfully, refetching data...");
    },
    onError: (error) => {
      // Handle error, e.g., show a notification to the user
      console.error("Error updating budget:", error);
      // You might want to add user-facing error handling here
    },
  });

  const handleUpdateBudget = (
    categoryId: string,
    field: "expected" | "budgeted",
    value: number
  ) => {
    updateBudgetMutation.mutate({ categoryId, field, value });
  };

  const initialData = Route.useLoaderData();

  const {
    data: queryData,
    isLoading,
    error,
  } = useSuspenseQuery({
    queryKey: ["budgetSummary", start_date, end_date],
    queryFn: () => fetchBudgetSummary(start_date, end_date),
    initialData: initialData,
  });

  if (isLoading) {
    return <BudgetLoadingSkeleton />;
  }

  if (error) {
    return <div>Error loading budget data: {error.message}</div>;
  }

  const { inflowData, outflowData } = transformBudgetData(queryData);

  return (
    <div className="p-4 space-y-8">
      <BudgetCategoryTable
        data={inflowData}
        columns={inflowTableColumns}
        updateBudget={handleUpdateBudget}
      />
      <BudgetCategoryTable
        data={outflowData}
        columns={outflowTableColumns}
        updateBudget={handleUpdateBudget}
      />
    </div>
  );
}

function BudgetLoadingSkeleton() {
  return (
    <div className="p-4 space-y-8">
      <div className="rounded-md border">
        <Skeleton className="h-12 w-full rounded-t-md" />
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-center space-x-4 p-4 border-t">
            <Skeleton className="h-8 flex-grow" />
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-8 w-8" />
          </div>
        ))}
      </div>
      <div className="rounded-md border">
        <Skeleton className="h-12 w-full rounded-t-md" />
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex items-center space-x-4 p-4 border-t">
            <Skeleton className="h-8 flex-grow" />
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-8 w-8" />
          </div>
        ))}
      </div>
    </div>
  );
}
