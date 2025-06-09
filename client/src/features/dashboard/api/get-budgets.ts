import { client } from "@/lib/client";
import {
  queryOptions,
  useQuery,
  useSuspenseQuery,
} from "@tanstack/react-query";
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
  const query = useSuspenseQuery({
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

const newGetBudgets = async (start_date: string, end_date: string) => {
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
};

export const budgetQueryOptions = (start_date: string, end_date: string) =>
  queryOptions({
    queryKey: ["budgets", { start_date, end_date }],
    queryFn: () => newGetBudgets(start_date, end_date),
  });
