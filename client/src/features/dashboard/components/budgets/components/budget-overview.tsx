import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { CategoryRowData } from "./columns";
import { CheckCheckIcon, CheckCircle, X } from "lucide-react";
import { formatCurrency } from "../../../../../lib/utils";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Props {
  inflowData: CategoryRowData[];
  outflowData: CategoryRowData[];
}

const BudgetOverview = ({ inflowData, outflowData }: Props) => {
  const totalInflowBudgetable = inflowData.reduce(
    (sum, row) => sum + (Number(row.budgetable) || 0),
    0
  );

  const totalOutflowBudgeteable = outflowData.reduce(
    (sum, row) => sum + (Number(row.budgetable) || 0),
    0
  );

  const totalOutflowBudggeted = inflowData.reduce(
    (sum, row) => sum + (Number(row.budgeted) || 0),
    0
  );

  const leftToBudget = totalInflowBudgetable - totalOutflowBudgeteable;

  const budgetStatus = () => {
    if (leftToBudget === 0) {
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="text-primary flex gap-2">
              <CheckCheckIcon />
            </span>
          </TooltipTrigger>
          <TooltipContent>Presupueto Balancedo</TooltipContent>
        </Tooltip>
      );
    }

    if (leftToBudget > 0) {
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="text-warning">
              <CheckCircle />
            </span>
          </TooltipTrigger>
          <TooltipContent>Presupueto con remanante</TooltipContent>
        </Tooltip>
      );
    }
    if (leftToBudget < 0) {
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="text-red-600">
              <X />
            </span>
          </TooltipTrigger>
          <TooltipContent>Presupuesto Excedido</TooltipContent>
        </Tooltip>
      );
    }
  };
  return (
    <Card>
      <CardHeader className="font-semibold text-center text-muted-foreground">
        Resumen Prespuesto
      </CardHeader>
      <Separator />
      <CardContent>
        <div className="flex flex-col space-y-2">
          <div className="flex justify-between">
            <p className="text-sm text-muted-foreground font-semibold">
              Presupuestable
            </p>
            <p className="text-sm text-muted-foreground font-mono">
              {formatCurrency(leftToBudget)}
            </p>
          </div>
          <div className="flex justify-between">
            <p className="text-sm text-muted-foreground font-semibold">Total</p>
            <p className="text-sm text-muted-foreground font-mono">
              {formatCurrency(totalOutflowBudggeted)}
            </p>
          </div>
          <Separator />
          <div className="flex justify-between">
            <p className="text-sm text-muted-foreground font-semibold">
              A Presupuestar
            </p>
            <p className="text-sm text-muted-foreground font-mono">
              {formatCurrency(leftToBudget)}
            </p>
          </div>
          <div className="flex justify-between">
            <p className="text-sm text-muted-foreground font-semibold">
              Estado
            </p>
            <p className="text-sm  font-mono">{budgetStatus()}</p>
          </div>
          {/* <Separator />
          <div className="flex justify-between">
            <p className="text-sm text-muted-foreground font-semibold">Neto</p>
            <p className="text-sm text-muted-foreground font-mono">amount</p>
          </div> */}
        </div>
      </CardContent>
    </Card>
  );
};

export default BudgetOverview;
