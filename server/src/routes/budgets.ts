import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { db } from "../db/drizzle";
import { budgets, categories, insertBudgetSchema, transactions } from "../db/schema";
import { auth } from "../lib/auth";
import { DateRangeSchema } from "./transactions";
import { and, eq, gte, lte } from "drizzle-orm";
import { eachMonthOfInterval, endOfMonth, format, lastDayOfMonth, startOfMonth } from 'date-fns';

const budgetUpsertPayloadSchema = z.object({
    category_id: z.string().refine(val => !isNaN(parseInt(val, 10)), {
        message: "category_id must be a string representing a number",
    }),
    amount: z.number(),
    budget_month: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { message: "Invalid budget_month format. Expected YYYY-MM-DD" }),
});

interface MonthlyBreakdownItem {
    month: string;
    activity: number;
    budgeted: number;
    balance: number;
}

interface CategorySummaryItem {
    id: number;
    name: string;
    isIncome: boolean;
    isGroup: boolean;
    groupId: number | null;
    groupCategoryName: string | null;
    totalActivity: number;
    totalBudgeted: number;
    totalBalance: number;
    occurrences: MonthlyBreakdownItem[];
}

export const budgetsRouter = new Hono<{
    Variables: {
        user: typeof auth.$Infer.Session.user | null;
        session: typeof auth.$Infer.Session.session | null;
    };
}>()
    .post("/", zValidator("json", budgetUpsertPayloadSchema), async (c) => {
        const user = c.get("user");
        if (!user) return c.json({ message: "Unauthorized" }, 401);

        const { category_id, amount, budget_month } = c.req.valid("json");
        console.log("category_id", category_id)
        // Validate category_id and budget_month as numbers and dat
        const categoryIdAsNumber = parseInt(category_id, 10);
        if (isNaN(categoryIdAsNumber)) {
            return c.json({ message: "Invalid category_id: must be a numeric string." }, 400);
        }

        const parsedBudgetMonthDate = new Date(budget_month);
        if (isNaN(parsedBudgetMonthDate.getTime())) {
            return c.json({ message: "Invalid budget_month: could not be parsed into a valid date." }, 400);
        }
        const startDateOfMonth = startOfMonth(parsedBudgetMonthDate);
        const endDateOfMonth = lastDayOfMonth(parsedBudgetMonthDate);

        try {

            const existingBudget = await db
                .select({ id: budgets.id })
                .from(budgets)
                .where(
                    and(
                        eq(budgets.userId, user.id),
                        eq(budgets.categoryId, categoryIdAsNumber),
                        eq(budgets.startDate, startDateOfMonth)
                    )
                )
                .limit(1);

            if (existingBudget.length > 0 && existingBudget[0].id) {
                console.log(`Existing budget found for category ${categoryIdAsNumber} and month ${budget_month}, updating.`);
                await db
                    .update(budgets)
                    .set({
                        amount: String(amount),
                        updatedAt: new Date(),
                    })
                    .where(eq(budgets.id, existingBudget[0].id));
                return c.json({ message: "Budget updated successfully" }, 200);
            } else {
                console.log(`No existing budget found for category ${categoryIdAsNumber} and month ${budget_month}, creating new one.`);
                await db.insert(budgets).values({
                    userId: user.id,
                    categoryId: categoryIdAsNumber,
                    startDate: startDateOfMonth,
                    endDate: endDateOfMonth,
                    amount: String(amount),
                    createdAt: new Date(),
                    updatedAt: new Date(),
                });
                return c.json({ message: "Budget created successfully" }, 201);
            }
        } catch (e) {
            console.error("Error upserting budget:", e);
            const errorMessage = e instanceof Error ? e.message : "An unknown error occurred";
            return c.json({ message: "Error upserting budget", error: errorMessage }, 500);
        }
    }).get("/summary", zValidator("query", DateRangeSchema), async (c) => {
        const user = c.get("user");
        if (!user) return c.json({ message: "unauthorized" }, 401);

        const { start_date, end_date } = c.req.valid("query");
        const startDate = new Date(start_date);
        const endDate = new Date(end_date);

        try {
            // 1. Fetch all categories for the user
            const userCategories = await db
                .select()
                .from(categories)
                .where(eq(categories.userId, user.id));

            // 2. Fetch all budgets for the user that overlap with the date range
            const userBudgets = await db
                .select()
                .from(budgets)
                .where(
                    and(
                        eq(budgets.userId, user.id),
                        lte(budgets.startDate, endDate), // Budget starts before or on the period end
                        gte(budgets.endDate, startDate)    // Budget ends after or on the period start
                    )
                );

            // 3. Fetch all transactions for the user within the date range
            const userTransactions = await db
                .select()
                .from(transactions)
                .where(
                    and(
                        eq(transactions.userId, user.id),
                        gte(transactions.date, startDate),
                        lte(transactions.date, endDate)
                    )
                );

            // 4. Calculate overall inflow and outflow
            let overallInflow = 0;
            let overallOutflow = 0;

            userTransactions.forEach(t => {
                const category = userCategories.find(cat => cat.id === t.categoryId);
                if (category) {
                    if (category.isIncome) {
                        overallInflow += parseFloat(t.amount || "0");
                    } else {
                        overallOutflow += parseFloat(t.amount || "0"); // Assuming expenses are positive numbers
                    }
                }
            });
            overallOutflow = Math.abs(overallOutflow); // Ensure outflow is positive

            // 5. Process data for each category and month
            const summaryByCategoRy: CategorySummaryItem[] = [];
            const monthsInInterval = eachMonthOfInterval({ start: startDate, end: endDate });

            for (const category of userCategories) {
                if (category.excludeFromBudget) continue;

                let totalActivity = 0;
                let totalBudgeted = 0;
                const monthlyBreakdown: MonthlyBreakdownItem[] = [];

                const categoryTransactions = userTransactions.filter(t => t.categoryId === category.id);
                categoryTransactions.forEach(t => {
                    totalActivity += parseFloat(t.amount || "0");
                });
                totalActivity = category.isIncome ? totalActivity : Math.abs(totalActivity);

                for (const monthDate of monthsInInterval) {
                    const monthStart = startOfMonth(monthDate);
                    const monthEnd = endOfMonth(monthDate);
                    const monthKey = format(monthStart, "yyyy-MM");

                    let monthActivity = 0;
                    categoryTransactions.forEach(t => {
                        if (t.date >= monthStart && t.date <= monthEnd) {
                            monthActivity += parseFloat(t.amount || "0");
                        }
                    });
                    monthActivity = category.isIncome ? monthActivity : Math.abs(monthActivity);

                    let monthBudgeted = 0;
                    const budgetsForCategoryInMonth = userBudgets.filter(b =>
                        b.categoryId === category.id &&
                        startOfMonth(new Date(b.startDate as Date)) <= monthStart && // Budget active in this month
                        endOfMonth(new Date(b.endDate as Date)) >= monthEnd
                    );


                    if (budgetsForCategoryInMonth.length > 0) {
                        budgetsForCategoryInMonth.forEach(b => {
                            monthBudgeted += parseFloat(b.amount || "0");
                        });
                    }
                    totalBudgeted += monthBudgeted;

                    monthlyBreakdown.push({
                        month: monthKey,
                        activity: monthActivity,
                        budgeted: monthBudgeted,
                        balance: monthBudgeted - monthActivity
                    });
                }

                summaryByCategoRy.push({
                    id: category.id,
                    name: category.name,
                    isIncome: category.isIncome,
                    isGroup: category.isGroup,
                    groupId: category.groupId,
                    groupCategoryName: category.groupCategoryName,
                    totalActivity,
                    totalBudgeted,
                    totalBalance: totalBudgeted - totalActivity,
                    occurrences: monthlyBreakdown
                });
            }

            return c.json({
                overallInflow,
                overallOutflow,
                netChange: overallInflow - overallOutflow,
                categories: summaryByCategoRy
            }, 200);

        } catch (error) {
            console.error("Error fetching budget summary:", error);
            return c.json({ message: "Error fetching budget summary" }, 500);
        }
    });