import { z } from "zod/v4";

export const insertCategorySchema = z.object({
    name: z.string(),
    description: z.string().optional(),
    excludeFromBudget: z.boolean(),
    excludeFromTotals: z.boolean(),
    isIncome: z.boolean(),
});

export const updateCategorySchema = insertCategorySchema.extend({
    id: z.string(),
})

export type InsertCategoryType = z.infer<typeof insertCategorySchema>;

export type UpdateCategorySchemaType = z.infer<typeof updateCategorySchema>;


export const insertAccountSchema = z.object({
    name: z.string(),
    balance: z.string(),
    institutionName: z.string(),
    typeName: z.enum(["efectivo", "debito", "credito", "inversion"]),
});

export type InsertAccountType = z.infer<typeof insertAccountSchema>;


export const budgetResponseSchema = z.object({
    overallInflow: z.number(),
    overallOutflow: z.number(),
    netChange: z.number(),
    categories: z.array(
        z.object({
            id: z.number(),
            name: z.string(),
            isIncome: z.boolean(),
            isGroup: z.boolean(),
            groupId: z.any(),
            groupCategoryName: z.any(),
            totalActivity: z.number(),
            totalBudgeted: z.number(),
            totalBalance: z.number(),
            occurrences: z.array(
                z.object({
                    month: z.string(),
                    activity: z.number(),
                    budgeted: z.number(),
                    balance: z.number(),
                })
            ).optional()
        })
    )
})

export type BudgetResponseType = z.infer<typeof budgetResponseSchema>;