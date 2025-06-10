import { client } from "@/lib/client";
import type { CategoryTransactionType } from "@/types/index";
import { useQuery } from "@tanstack/react-query";
// import type { InferResponseType } from "hono/client";

interface Props {
  id: string;
  end_date: string;
  start_date: string;
  enabled?: boolean;
}

export const getCategoryTransactions = (json: Props) => {
  const query = useQuery({
    queryKey: ["category-transactions", json.id],
    enabled: json.enabled,
    queryFn: async () => {
      const { id, start_date, end_date } = json as Props;
      const respose = await client.api.transactions.category.$post({
        json: {
          id,
          start_date,
          end_date,
        },
      });
      if (!respose.ok) {
        throw new Error("Failed to fetch transactions");
      }

      const data = await respose.json();
      return data as CategoryTransactionType[];
    },
  });

  return query;
};
