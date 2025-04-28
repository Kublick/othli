import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard/home/net-worth")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/dashboard/net-worth"!</div>;
}
