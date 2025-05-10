import { getOverViewSummary } from "../../api/getOverviewSummary";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress-bar";
import type { client } from "@/lib/client";
import type { InferResponseType } from "hono";

interface Props {
  firstDayOfMonth: Date;
  lastDayOfMonth: Date;
}

type ResponseType = InferResponseType<
  typeof client.api.transactions.summary.$get,
  200
>;

// Define a list of colors to cycle through
const categoryColors = [
  "#FF6384", // Red
  "#36A2EB", // Blue
  "#FFCE56", // Yellow
  "#4BC0C0", // Teal
  "#9966FF", // Purple
  "#FF9F40", // Orange
  "#80CBC4", // Light Teal
  "#F48FB1", // Pink
];

const SpendingBreakdown = ({ firstDayOfMonth, lastDayOfMonth }: Props) => {
  const { data: overviewData } = getOverViewSummary({
    start_date: firstDayOfMonth.toISOString().substring(0, 10),
    end_date: lastDayOfMonth.toISOString().substring(0, 10),
  });

  const data = overviewData as ResponseType;

  // Handle cases where data might not be loaded yet
  if (!data) {
    // Optionally return a loading state or null
    return <div>Loading spending breakdown...</div>; // Or <Skeleton /> components
  }

  return (
    <div>
      <Card>
        <CardHeader>Gastos</CardHeader>
        <CardContent>
          <div className="flex flex-col gap-6 mb-4">
            {" "}
            {/* Added margin bottom */}
            {/* Income Progress Bar */}
            <ProgressBar
              label="Ingreso"
              value={data?.totalIncome}
              max={data?.totalIncome > 0 ? data.totalIncome : 1} // Avoid max=0
              color="#26B99A" // Keep income color consistent
              currencyCode="MX$"
              height={16}
            />
            {/* Total Expenses Progress Bar */}
            <ProgressBar
              label="Gastos Totales" // More descriptive label
              value={data?.totalExpenses}
              max={data?.totalExpenses}
              height={16}
              currencyCode="MX$"
              showMax={false} // Keep showMax as false if desired
              color="var(--destructive)" // Keep total expenses color consistent
            />
          </div>

          {/* Expenses by Category */}
          {data.expensesByCategory?.map(
            (
              expense,
              index // Added index
            ) => (
              <div key={expense.categoryId} className="py-2">
                {" "}
                {/* Added key */}
                <ProgressBar
                  label={expense.categoryName}
                  value={expense.total}
                  max={data?.totalExpenses > 0 ? data.totalExpenses : 1}
                  height={10}
                  currencyCode="MX$"
                  showMax={false}
                  color={categoryColors[index % categoryColors.length]}
                />
              </div>
            )
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SpendingBreakdown;
