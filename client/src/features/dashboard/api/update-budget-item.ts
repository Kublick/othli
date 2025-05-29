import { client } from "@/lib/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useUpdateBudget = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: async (json: {
      id: string;
      amount: number;
      budget_month: string;
    }) => {
      const { id, amount, budget_month } = json;

      const response = await client.api.budgets.$post({
        json: {
          category_id: id,
          budget_month,
          amount,
        },
      });

      if (response.ok) {
        toast.success(`Presupuesto actualizado a $${amount}`);
      }
      if (!response.ok) {
        toast.error("Ocurrio un error intente mas tarde");
        const errorData = await response.text();
        throw new Error(
          `Failed to update budget: ${errorData || response.statusText}`
        );
      }
    },
    onSuccess: () => {
      //invalidate query
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
    },
  });
  return mutation;
};
