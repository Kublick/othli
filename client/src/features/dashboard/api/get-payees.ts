import { client } from "@/lib/client";
import { useQuery } from "@tanstack/react-query";
import type { InferResponseType } from "hono/client";

type ResponseType = InferResponseType<typeof client.api.payees.$get, 200>;

export const getPayees = () => {
  const query = useQuery({
    queryKey: ["payees"],
    queryFn: async () => {
      const respose = await client.api.payees.$get();
      if (!respose.ok) {
        throw new Error("Failed to fetch payees");
      }

      const data = await respose.json();
      return data as ResponseType;
    },
  });

  return query;
};
