import { Separator } from "@radix-ui/react-separator";
import {
  createFileRoute,
  Link,
  linkOptions,
  Outlet,
} from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard/finances")({
  component: RouteComponent,
});

const options = [
  linkOptions({
    to: "/dashboard/finances/budgets",
    label: "Prespuesto",
  }),
  linkOptions({
    to: "/dashboard/finances/transactions",
    label: "Transacciones",
  }),
];

function RouteComponent() {
  return (
    <div className="container mx-auto">
      <div className="flex px-2 text-sm">
        {options.map((option) => {
          return (
            <Link
              key={option.to}
              {...option}
              activeProps={{
                className: `underline underline-offset-4 font-semibold text-accent-foreground`,
              }}
              className="px-4 py-4 hover:underline hover:font-semibold underline-offset-4"
              activeOptions={{ exact: true }}
            >
              {option.label}
            </Link>
          );
        })}
      </div>
      <Separator className="mb-6" />
      <Outlet />
    </div>
  );
}
