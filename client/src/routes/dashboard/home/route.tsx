import {
  createFileRoute,
  Link,
  linkOptions,
  Outlet,
} from "@tanstack/react-router";
import { Separator } from "@/components/ui/separator";

const options = [
  linkOptions({
    to: "/dashboard/home/overview",
    label: "Resumen",
  }),
  linkOptions({
    to: "/dashboard/home/net-worth",
    label: "Patrimonio",
  }),
  linkOptions({
    to: "/dashboard/home/stats",
    label: "Estadisticas",
  }),
];

export const Route = createFileRoute("/dashboard/home")({
  component: RouteComponent,
});

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
              className="px-4 py-4"
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
