import { getCategories } from "@/features/dashboard/api/get-categories";
import { columns } from "@/features/dashboard/components/categories/columns";
import CategorySheet from "@/features/dashboard/components/categories/create-category-sheet";
import { DataTable } from "@/features/dashboard/components/categories/data-table";

import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard/setup/categories")({
  component: RouteComponent,
});

function RouteComponent() {
  const { data: rawData, isLoading } = getCategories();

  const data = rawData?.map((item) => ({
    ...item,
    description: item.description ?? "",
  }));

  if (!data || isLoading) {
    return <div>Tomando datos...</div>;
  }
  return (
    <div>
      <h2 className="scroll-m-20  text-3xl font-semibold tracking-tight first:mt-0">
        Categorias
      </h2>

      <div className="md:my-16">
        <div className="mb-6">
          <CategorySheet />
        </div>
        <DataTable data={data} columns={columns} />
      </div>
    </div>
  );
}
