import { Bar, BarChart, LabelList, XAxis, YAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { getOverViewSummary } from "../../api/getOverviewSummary";
import type { InferResponseType } from "hono";
import type { client } from "@/lib/client";

const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "hsl(var(--chart-1))",
  },
  ingreso: {
    label: "Mobile",
    color: "hsl(var(--chart-2))",
  },
  label: {
    color: "hsl(0 0% 100%)",
  },
} satisfies ChartConfig;

interface Props {
  firstDayOfMonth: Date;
  lastDayOfMonth: Date;
}

type ResponseType = InferResponseType<
  typeof client.api.transactions.summary.$get,
  200
>;

export function ChartComponent({ firstDayOfMonth, lastDayOfMonth }: Props) {
  const { data, isLoading } = getOverViewSummary({
    start_date: firstDayOfMonth.toISOString().substring(0, 10),
    end_date: lastDayOfMonth.toISOString().substring(0, 10),
  });
  console.log("🚀 ~ ChartComponent ~ data:", data);

  if (!data) {
    return <div>No existen registros</div>;
  }

  if (isLoading) {
    return <div>Loading...</div>;
  }
  console.log(data);

  let newCharData = (data as ResponseType).expensesByCategory.map((item) => {
    return {
      month: item.categoryName,
      desktop: item.total,
    };
  });

  newCharData = [
    {
      month: "Ingresos",
      desktop: (data as ResponseType).totalIncome,
    },
    {
      month: "Gastos",
      desktop: (data as ResponseType).totalExpenses,
    },
    ...newCharData,
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gastos</CardTitle>
        <CardDescription></CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart
            accessibilityLayer
            data={newCharData}
            layout="vertical"
            margin={{
              left: 80,
              right: 80,
            }}
          >
            <XAxis type="number" dataKey="desktop" hide />
            <YAxis
              dataKey="month"
              type="category"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Bar dataKey="desktop" fill="var(--color-desktop)" radius={5}>
              <LabelList
                dataKey="desktop"
                position="right"
                offset={1}
                className="fill-foreground"
                fontSize={14}
                formatter={(value: number) => `$${value}`}
              />
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
