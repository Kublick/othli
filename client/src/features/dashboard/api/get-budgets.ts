import { client } from "@/lib/client";
import { useQuery } from "@tanstack/react-query";
import type { InferResponseType } from "hono/client";

type ResponseType = InferResponseType<
  typeof client.api.budgets.summary.$get,
  200
>;

export const getBudgets = ({
  start_date,
  end_date,
}: {
  start_date: string;
  end_date: string;
}) => {
  const query = useQuery({
    queryKey: ["budgets", { start_date, end_date }],
    queryFn: async () => {
      const respose = await client.api.budgets.summary.$get({
        query: {
          start_date,
          end_date,
        },
      });
      if (!respose.ok) {
        throw new Error("Failed to fetch budgets");
      }

      const data = await respose.json();
      return data as ResponseType;
    },
  });

  return query;
};
