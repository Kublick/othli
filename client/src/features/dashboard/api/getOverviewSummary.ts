import { client } from "@/lib/client";
import { useQuery } from "@tanstack/react-query";

export const getOverViewSummary = ({
    start_date,
    end_date,
}: {
    start_date: string;
    end_date: string;
}) => {
    const query = useQuery({
        queryKey: ["overview_summary", { start_date, end_date }],
        queryFn: async () => {
            const resp = await client.api.transactions.summary.$get({
                query: {
                    start_date,
                    end_date,
                },
            });

            const response = await resp.json();
            return response;
        },
    });

    return query;
};
