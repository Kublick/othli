import { client } from "@/lib/client";
import { useQuery } from "@tanstack/react-query";
import type { InferResponseType } from "hono/client";

type ResponseType = InferResponseType<typeof client.api.accounts.$get, 200>;

export const getUserAccounts = () => {
  const query = useQuery({
    queryKey: ["accounts"],
    queryFn: async () => {
      const respose = await client.api.accounts.$get();
      if (!respose.ok) {
        throw new Error("Failed to fetch accounts");
      }

      const data = await respose.json();
      return data as ResponseType;
    },
  });

  return query;
};
