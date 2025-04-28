import { client } from "@/lib/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { InferRequestType, InferResponseType } from "hono";
import { toast } from "sonner";


type ResponseType = InferResponseType<typeof client.api.transactions.$post, 200>;

type RequestType = InferRequestType<typeof client.api.transactions.$post>["json"];

export const useCreateTransaction = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async (json: RequestType): Promise<ResponseType> => {
      const {
        date,
        payeeId,
        accountId,
        categoryId,
        amount,
        description
      } = json;

      const response = await client.api.transactions.$post({
        json: {
          date,
          payeeId,
          accountId,
          categoryId,
          amount,
          description
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }

      return response.json();
    },
    onSuccess: () => {
      toast.success("Transacción creada");
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      queryClient.invalidateQueries({ queryKey: ["payees"] });
    },
    onError: (error) => {
      console.log(error);
      toast.error("Ocurrio un error al crear la cuenta");
    },
  });

  return mutation;
};
