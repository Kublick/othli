import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/profile/subscription")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/profile/subscription"!</div>;
}
