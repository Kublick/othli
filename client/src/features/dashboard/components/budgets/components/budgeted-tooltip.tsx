import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatCurrency } from "@/lib/utils";
import { Info } from "lucide-react"; // Import an Info icon

interface Ocurrence {
  month: string;
  activity: number;
  budgeted: number;
  balance: number;
}

interface BudgetData {
  id: string;
  name: string;
  isIncome: boolean;
  budgeted: number;
  activity: number;
  budgetable: number;
  ocurrences: Ocurrence[];
}

interface BudgetTooltipProps {
  data: BudgetData;
  onClear?: () => void;
}

export function BudgetTooltip({ data, onClear }: BudgetTooltipProps) {
  const sortedOcurrences = [...data.ocurrences].sort((a, b) =>
    b.month.localeCompare(a.month)
  );

  const lastPeriod = sortedOcurrences[0];
  const previousPeriod = sortedOcurrences[1];
  const last3Periods = sortedOcurrences.slice(0, 3);

  const avgSpendLast3Periods =
    last3Periods.length > 0
      ? last3Periods.reduce((sum, o) => sum + o.activity, 0) /
        last3Periods.length
      : 0;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            className="ml-2 p-1 text-muted-foreground hover:text-foreground"
          >
            <Info size={16} />
          </button>
        </TooltipTrigger>
        <TooltipContent className="w-96 p-2 bg-white shadow-lg rounded-md border text-primary">
          <div className="space-y-1">
            {lastPeriod && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  {data.isIncome
                    ? "Ingreso ultimo periodo"
                    : "Gastado ultimo periodo"}
                </span>
                <span className="text-sm font-medium">
                  {formatCurrency(lastPeriod.activity)}
                </span>
              </div>
            )}
            {lastPeriod && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  Presupuestado ultimo periodo
                </span>
                <span className="text-sm font-medium">
                  {formatCurrency(previousPeriod.budgeted)}
                </span>
              </div>
            )}
            {last3Periods.length > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  {data.isIncome
                    ? "Promedio de ingresos ultimos 3 periodos"
                    : "Promedio de gastos ultimos 3 periodos"}
                </span>
                <span className="text-sm font-medium">
                  {formatCurrency(avgSpendLast3Periods)}
                </span>
              </div>
            )}
            {onClear && (
              <div
                className="flex justify-between items-center pt-1 border-t border-border mt-1 cursor-pointer hover:bg-muted p-1 rounded"
                onClick={onClear} // Directly use onClear here
              >
                <span className="text-sm text-muted-foreground">Clear</span>
                <span className="text-sm font-medium">{formatCurrency(0)}</span>
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
