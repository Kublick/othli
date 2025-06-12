import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: App,
});

function App() {
  return (
    <div className=" flex h-screen flex-col items-center justify-center">
      <h1>miothli comming soon...</h1>
    </div>
  );
}
