import { client } from "@/lib/client";
import { useQuery } from "@tanstack/react-query";
import type { SelectTransacionType } from "../../../../../server/src/db/schema";


export const getTransaction = (id: string, isOpen: boolean) => {
    const query = useQuery({
        queryKey: ["transaction-id", { id }],
        enabled: isOpen,
        queryFn: async () => {
            const respose = await client.api.transactions[":id"].$get({
                param: {
                    id
                },
            });
            if (!respose.ok) {
                throw new Error("Failed to fetch transactions");
            }

            const data = await respose.json();
            return {
                ...data,
                date: new Date(data.date),
                createdAt: data.createdAt ? new Date(data.createdAt) : undefined,
                updatedAt: data.updatedAt ? new Date(data.updatedAt) : undefined
            } as SelectTransacionType
        },
    });

    return query;
};

