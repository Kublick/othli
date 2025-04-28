import { createFileRoute } from "@tanstack/react-router";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { cn, formatCurrency } from "@/lib/utils";

import { getUserAccounts } from "@/features/dashboard/api/get-user-accounts";
import CreateAccountSheet from "@/features/dashboard/components/accounts/create-account-sheet";

export const Route = createFileRoute("/dashboard/setup/accounts")({
  component: RouteComponent,
});

function RouteComponent() {
  const { data, isLoading } = getUserAccounts();

  const handleType = (text: string) => {
    return (
      <span
        className={cn(
          text === "debito" && "text-sky-400 ",
          text === "efectivo" && "text-blue-400",
          text === "credito" && "text-red-500",
          text === "inversion" && "text-green-400",
          "capitalize"
        )}
      >
        {text}
      </span>
    );
  };

  if (isLoading || !data) {
    return <div>Loading</div>;
  }

  return (
    <div className="container mx-auto">
      <h2 className="scroll-m-20  text-3xl font-semibold tracking-tight first:mt-0">
        Cuentas
      </h2>
      <div className="md:my-16">
        <CreateAccountSheet />
        <Table className="border mt-8">
          <TableHeader>
            <TableRow>
              <TableHead className="border-b">Nombre</TableHead>
              <TableHead className="border-b">Saldo</TableHead>
              <TableHead className="border-b">Tipo</TableHead>
              <TableHead className="border-b">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((account) => (
              <TableRow key={account.id} className="border-b">
                <TableCell className="font-medium">{account.name}</TableCell>
                <TableCell className="font-medium">
                  {formatCurrency(Number(account.balance))}
                </TableCell>
                <TableCell className="font-medium">
                  {handleType(account.typeName)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
