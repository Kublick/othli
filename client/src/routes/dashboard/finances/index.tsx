import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard/finances/")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/dashboard/finances/"!</div>;
}
