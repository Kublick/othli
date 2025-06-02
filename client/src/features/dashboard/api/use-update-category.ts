
import { client } from "@/lib/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { InferResponseType } from "hono";
import { toast } from "sonner";
import type { UpdateCategorySchemaType } from "@/types/index";

type ResponseType = InferResponseType<typeof client.api.categories[":id"]["$patch"]>;



export const useUpdateCategory = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error, UpdateCategorySchemaType>({

    mutationFn: async (json) => {
      const {
        id,
        name,
        isIncome,
        description,
        excludeFromBudget,
        excludeFromTotals,
      } = json;

      const response = await client.api.categories[":id"].$patch({
        json: {
          name,
          isIncome,
          description,
          excludeFromBudget,
          excludeFromTotals,
        },
        param: {
          id
        }
      });

      if (!response.ok) {
        const error = await response.json();
        if (error instanceof Error) {
          throw new Error(error.message);
        }
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success("Categoria actualizada");
    },
    onError: (error) => {
      console.log(error);
      toast.error("Ocurrio un error al crear la cuenta");
    },
  });

  return mutation;
};
