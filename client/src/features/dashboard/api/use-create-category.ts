import { client } from "@/lib/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { InferRequestType, InferResponseType } from "hono";
import { toast } from "sonner";

type ResponseType = InferResponseType<typeof client.api.categories.$post, 200>;

type RequestType = InferRequestType<typeof client.api.categories.$post>["json"];

export const useCreateCategory = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async (json) => {
      const {
        name,
        isIncome,
        description,
        excludeFromBudget,
        excludeFromTotals,
      } = json;

      const response = await client.api.categories.$post({
        json: {
          name,
          isIncome,
          description,
          excludeFromBudget,
          excludeFromTotals,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }

      return response.json();
    },
    onSuccess: () => {
      toast.success("Cuenta creada");
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
    onError: (error) => {
      console.log(error);
      toast.error("Ocurrio un error al crear la cuenta");
    },
  });

  return mutation;
};
