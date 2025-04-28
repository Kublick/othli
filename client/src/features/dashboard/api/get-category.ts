import { client } from "@/lib/client";
import { useQuery } from "@tanstack/react-query";
import type { Category } from "../components/categories/columns";

export const useGetCategory = (id: string, isOpen: boolean) => {
  const query = useQuery({
    queryKey: ["category", { id }],
    enabled: isOpen,
    queryFn: async () => {
      const respose = await client.api.categories[":id"].$get({
        param: {
          id,
        },
      });
      if (!respose.ok) {
        throw new Error("Failed to fetch categories");
      }

      const data = await respose.json();

      return data as Category;
    },
  });

  return query;
};
