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
