import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { InferRequestType, InferResponseType } from "hono";
import { toast } from "sonner";
import { client } from "@/lib/client";

type ResponseType = InferResponseType<typeof client.api.accounts.$post, 200>;

type RequestType = InferRequestType<typeof client.api.accounts.$post>["json"];

export const useCreateAccounts = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async (json) => {
      const { name, balance, institutionName, typeName } = json;

      const response = await client.api.accounts.$post({
        json: {
          name,
          typeName,
          balance,
          institutionName,
        },
      });

      return response.json();
    },
    onSuccess: () => {
      toast.success("Cuenta creada");
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
    },
    onError: (error) => {
      console.log(error);
      toast.error("Ocurrio un error al crear la cuenta");
    },
  });

  return mutation;
};
