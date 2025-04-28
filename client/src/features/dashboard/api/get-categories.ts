import { client } from "@/lib/client";
import { useQuery } from "@tanstack/react-query";
import type { InferResponseType } from "hono/client";

type ResponseType = InferResponseType<typeof client.api.categories.$get, 200>;

export const getCategories = () => {
  const query = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const respose = await client.api.categories.$get();
      if (!respose.ok) {
        throw new Error("Failed to fetch categories");
      }

      const data = await respose.json();
      return data as ResponseType;
    },
  });

  return query;
};
