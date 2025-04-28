import { client } from "@/lib/client";
import { useQuery } from "@tanstack/react-query";
import type { InferResponseType } from "hono/client";

type ResponseType = InferResponseType<typeof client.api.transactions.$get, 200>;

export const getTransactions = ({ start_date, end_date }: {
  start_date: string,
  end_date: string
}) => {
  const query = useQuery({
    queryKey: ["transactions"],
    queryFn: async () => {
      const respose = await client.api.transactions.$get({
        query: {
          start_date,
          end_date,
        }
      });
      if (!respose.ok) {
        throw new Error("Failed to fetch categories");
      }

      const data = await respose.json();
      // Normalize transactions data to match TransactionTable expectations
      const normalized = (data as ResponseType).map((transaction) => ({
        id: transaction.id,
        date: new Date(transaction.date),
        categories: {
          id: transaction.categories?.id ?? 0,
          name: transaction.categories?.name ?? "",
        },
        amount: transaction.amount,
        payee: {
          id: transaction.payees?.id ?? 0,
          name: transaction.payees?.name ?? "",
        },
      }));
      return normalized;
    },
  });

  return query;
};
