import { useMemo } from "react";
import { NewProgress } from "@/components/ui/new-progress";
import { getOverViewSummary } from "../../api/getOverviewSummary";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress-bar";
import type { client } from "@/lib/client";
import type { InferResponseType } from "hono";
import { formatCurrency } from "@/lib/utils";

interface Props {
  firstDayOfMonth: Date;
  lastDayOfMonth: Date;
}

type ResponseType = InferResponseType<
  typeof client.api.transactions.summary.$get,
  200
>;

type Segment = {
  value: number;
  color: string;
  categoryName: string;
  total: number;
};

// Define a list of colors to cycle through
const CATEGORY_COLORS = [
  "bg-teal-600",
  "bg-fuchsia-400",
  "bg-emerald-400",
  "bg-yellow-300",
  "bg-rose-400",
  "bg-blue-500",
  "bg-lime-400",
  "bg-red-400",
  "bg-teal-400",
  "bg-pink-400",
  "bg-cyan-600",
  "bg-pink-500",
  "bg-blue-600",
  "bg-orange-400",
] as const;

const SpendingBreakdown = ({ firstDayOfMonth, lastDayOfMonth }: Props) => {
  const dateRange = useMemo(
    () => ({
      start_date: firstDayOfMonth.toISOString().substring(0, 10),
      end_date: lastDayOfMonth.toISOString().substring(0, 10),
    }),
    [firstDayOfMonth, lastDayOfMonth]
  );

  const { data: overviewData } = getOverViewSummary(dateRange);
  const data = overviewData as ResponseType;

  const processedData = useMemo(() => {
    if (!data) return null;

    const createSegments = (
      categories: Array<{ categoryName: string; total: number }>,
      totalAmount: number
    ): Segment[] => {
      return categories
        .map((category) => ({
          value: totalAmount > 0 ? (category.total / totalAmount) * 100 : 0,
          color: "", // Will be assigned later
          categoryName: category.categoryName,
          total: category.total,
        }))
        .sort((a, b) => b.value - a.value);
    };

    const incomeSegments = createSegments(
      data.incomeByCategory,
      data.totalIncome
    );
    const expenseSegments = createSegments(
      data.expensesByCategory,
      data.totalExpenses
    );

    // Assign colors globally to avoid immediate repetition
    let colorIndex = 0;
    const assignColorsGlobally = (segments: Segment[]): Segment[] => {
      return segments.map((segment) => ({
        ...segment,
        color: CATEGORY_COLORS[colorIndex++ % CATEGORY_COLORS.length],
      }));
    };

    console.log(assignColorsGlobally(expenseSegments));

    return {
      income: assignColorsGlobally(incomeSegments),
      expenses: assignColorsGlobally(expenseSegments),
      totalExpenses: data.totalExpenses,
    };
  }, [data]);

  // Early return for loading state
  if (!data || !processedData) {
    return (
      <Card>
        <CardContent>
          <div className="animate-pulse">Cargando Datos...</div>
        </CardContent>
      </Card>
    );
  }

  console.log(processedData);

  return (
    <Card>
      <CardHeader>Resumen</CardHeader>
      <CardContent className="space-y-6">
        {/* Income Section */}
        <div>
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold mb-3 ">Ingresos</h2>
            <p className="font-semibold font-mono">
              {formatCurrency(data.totalIncome)}
            </p>
          </div>
          <NewProgress segments={processedData.income} />
        </div>

        {/* Expenses Section */}
        <div>
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold mb-3 ">Gastos</h2>
            <p className="font-semibold font-mono">
              {formatCurrency(data.totalExpenses)}
            </p>
          </div>

          <NewProgress segments={processedData.expenses} />
        </div>

        {/* Detailed Expenses Breakdown */}
        <div className="space-y-2">
          {processedData.expenses.map((expense) => (
            <ProgressBar
              key={expense.categoryName}
              label={expense.categoryName}
              value={expense.total}
              max={Math.max(processedData.totalExpenses, 1)}
              height={10}
              currencyCode="MX$"
              showMax={false}
              color={expense.color}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default SpendingBreakdown;
