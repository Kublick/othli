
import { client } from "@/lib/client";
import { useQuery } from "@tanstack/react-query";


// Explicit type definition based on server's logEntrySchema and augmentation
interface LogEntryDetailsBase {
    source: string;
    user_name: string | null;
}

interface LogEntryDetailsUpdate extends LogEntryDetailsBase {
    field: string; // Can be 'payeeId', 'categoryId', 'amount', etc.
    newValue: string;
    oldValue: string;
    oldValueName?: string; // Conditionally added for payee/category
    newValueName?: string; // Conditionally added for payee/category
    metadata?: { // Conditionally added for amount
        original_amount?: string;
        new_amount?: string;
    };
}

interface LogEntryDetailsCreate extends LogEntryDetailsBase {
    descriptor: string;
    metadata: {
        source: string;
    };
    // Ensure no conflicting properties from the update type
    field?: never;
    newValue?: never;
    oldValue?: never;
    oldValueName?: never;
    newValueName?: never;
}


type LogEntryDetails = LogEntryDetailsUpdate | LogEntryDetailsCreate;


interface LogEntry {
    id: number;
    transactionId: string;
    userId: string;
    action: string;
    details: LogEntryDetails;
    timestamp: string; // Dates become strings over JSON
}

// The overall response type is an array of LogEntry
type TransactionHistoryResponse = LogEntry[];


export const getTransactionHistoryById = (id: string) => {
    const query = useQuery({
        queryKey: ["transactionHistory", { id }],
        queryFn: async (): Promise<TransactionHistoryResponse> => { // Use the explicit type here
            const respose = await client.api.transactions.history[":id"].$get({
                param: {
                    id
                }
            });

            if (!respose.ok) {
                throw new Error("Failed to fetch transactionHistory");
            }

            const data = await respose.json();


            return data;
        },
    });

    return query;
};
