import { Hono } from "hono";
import { auth } from "../lib/auth";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { db } from "../db/drizzle";
import {
  categories,
  payees,
  selectTransactionSchema,
  transactions,
  transactionHistory,
  selectTransactionHistorySchema,
} from "../db/schema";
import { nanoid } from "nanoid";
import { and, desc, eq, gte, lte, sql, sum } from "drizzle-orm";
import { inArray } from "drizzle-orm"; // Import inArray for batch fetching

export const DateRangeSchema = z.object({
  start_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in format YYYY-MM-DD"),
  end_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in format YYYY-MM-DD"),
});

export const logEntrySchema = z.object({
  id: z.number(),
  transactionId: z.string(),
  userId: z.string(),
  action: z.string(),
  details: z.union([
    z.object({
      field: z.literal("payeeId"),
      source: z.string(),
      newValue: z.string(),
      oldValue: z.string(),
      user_name: z.string(),
      oldValueName: z.string(),
      newValueName: z.string(),
    }),
    z.object({
      source: z.string(),
      metadata: z.object({
        source: z.string(),
      }),
      user_name: z.string(),
      descriptor: z.string(),
    }),
  ]),
  timestamp: z.date(),
});

export const insertTransactionSchema = z.object({
  date: z.coerce.date(),
  categoryId: z.union([z.coerce.number(), z.string()]),
  payeeId: z
    .union([z.coerce.number(), z.string()])
    .refine(
      (val) =>
        (typeof val === "number" && val > 0) ||
        (typeof val === "string" && val.trim().length > 0),
      {
        message: "Ingrese un beneficiario válido o seleccione uno existente",
      }
    ), // Add validation
  accountId: z.string().min(1, { message: "Ingrese un beneficiario" }), // Add validation
  amount: z.coerce.number().refine((val) => !isNaN(val), {
    message: "Debe ingresar un monto válido",
  }),
  description: z.string(),
});

export const transactionsRouter = new Hono<{
  Variables: {
    user: typeof auth.$Infer.Session.user | null;
    session: typeof auth.$Infer.Session.session | null;
  };
}>()
  .get("/", zValidator("query", DateRangeSchema), async (c) => {
    const { start_date, end_date } = c.req.valid("query");

    const user = c.get("user");
    if (!user) return c.json({ message: "unauthorized" }, 401);
    try {
      const query = await db
        .select({
          id: transactions.id,
          payees: {
            id: payees.id,
            name: payees.name,
          },
          date: transactions.date,
          categories: {
            id: categories.id,
            name: categories.name,
          },
          amount: transactions.amount,
        })
        .from(transactions)
        .leftJoin(categories, eq(transactions.categoryId, categories.id))
        .leftJoin(payees, eq(transactions.payeeId, payees.id))
        .where(
          and(
            eq(transactions.userId, user.id),
            gte(transactions.date, new Date(start_date)),
            lte(transactions.date, new Date(end_date))
          )
        )
        .orderBy(desc(transactions.date));

      return c.json(query, 200);
    } catch (error) {
      console.log(error);
      return c.json({ message: "Invalid date range" }, 400);
    }
  }).get("/summary", zValidator("query", DateRangeSchema), async (c) => {

    const { start_date, end_date } = c.req.valid("query");

    const user = c.get("user");
    if (!user) return c.json({ message: "unauthorized" }, 401);

    const startDate = new Date(start_date);
    const endDate = new Date(end_date);

    try {


      const [incomeResult] = await db.select({
        totalIncome: sum(sql<number>`CAST(${transactions.amount} AS numeric)`).mapWith(Number),
      }).from(transactions).innerJoin(categories, eq(transactions.categoryId, categories.id))
        .where(
          and(
            eq(transactions.userId, user.id),
            gte(transactions.date, startDate),
            lte(transactions.date, endDate),
            eq(categories.isIncome, true)
          )
        )

      const totalIncome = incomeResult?.totalIncome ?? 0;

      const [expensesResult] = await db
        .select({
          totalExpenses: sum(sql<number>`CAST(${transactions.amount} AS numeric)`).mapWith(Number),
        })
        .from(transactions)
        .innerJoin(categories, eq(transactions.categoryId, categories.id))
        .where(
          and(
            eq(transactions.userId, user.id),
            gte(transactions.date, startDate),
            lte(transactions.date, endDate),
            eq(categories.isIncome, false)
          )
        );
      const totalExpenses = Math.abs(expensesResult?.totalExpenses ?? 0);

      const expensesByCategoryResult = await db
        .select({
          categoryId: categories.id,
          categoryName: categories.name,
          total: sum(sql<number>`CAST(${transactions.amount} AS numeric)`).mapWith(Number),
        })
        .from(transactions)
        .innerJoin(categories, eq(transactions.categoryId, categories.id))
        .where(
          and(
            eq(transactions.userId, user.id),
            gte(transactions.date, startDate),
            lte(transactions.date, endDate),
            eq(categories.isIncome, false)
          )
        )
        .groupBy(categories.id, categories.name)
        .orderBy(desc(sql`sum(CAST(${transactions.amount} AS numeric))`));


      const expensesByCategory = expensesByCategoryResult.map(item => ({
        ...item,
        total: Math.abs(item.total ?? 0)
      }));

      const projectedExpenses = 0;
      const projectedIncome = 0;
      const netIncome = totalIncome - totalExpenses;
      const projectedNetIncome = projectedIncome - projectedExpenses;
      const currentSavingsRate = totalIncome > 0 ? (netIncome / totalIncome) * 100 : 0;

      // Return the actual calculated data
      return c.json({
        totalIncome,
        totalExpenses,
        netIncome,
        projectedNetIncome,
        currentSavingsRate,
        expensesByCategory,
      }, 200);

    } catch (error) {
      console.log(error);
      return c.json({ message: "Invalid date range" }, 400);
    }


  })
  .post("/", zValidator("json", insertTransactionSchema), async (c) => {
    const user = c.get("user");

    if (!user) return c.json({ message: "unauthorized" }, 401);

    const { date, categoryId, payeeId, accountId, amount, description } =
      c.req.valid("json");

    let finalCategoryId;
    let finalPayeeId;

    if (typeof categoryId === "string") {
      const [existingCategory] = await db
        .select()
        .from(categories)
        .where(
          and(eq(categories.name, categoryId), eq(categories.userId, user.id))
        );

      if (existingCategory) {
        finalCategoryId = existingCategory.id;
      }

      const newCategory = await db
        .insert(categories)
        .values({
          name: categoryId,
          userId: user.id,
          isIncome: false,
          excludeFromBudget: false,
          excludeFromTotals: false,
        })
        .returning({
          id: categories.id,
        });

      finalCategoryId = newCategory[0].id;
    }

    if (typeof payeeId === "string") {
      const newPayee = await db
        .insert(payees)
        .values({
          name: payeeId,
          userId: user.id,
        })
        .returning({
          id: payees.id,
        });

      finalPayeeId = newPayee[0].id;
    }

    try {
      const [transaction] = await db
        .insert(transactions)
        .values({
          id: nanoid(),
          description: description ?? "",
          date: new Date(date),
          categoryId:
            typeof categoryId === "number" ? categoryId : finalCategoryId,
          payeeId: typeof payeeId === "number" ? payeeId : finalPayeeId,
          accountId,
          amount: String(amount),
          userId: user.id,
        })
        .returning();

      const history = await db.insert(transactionHistory).values({
        transactionId: transaction.id,
        userId: user.id,
        action: "created",
        details: {
          descriptor: "Transaccion Manual",
          source: "user",
          user_name: user?.name ?? null,
          metadata: {
            source: "manual",
          },
        },
        timestamp: new Date(),
      });

      return c.json(
        {
          message: "Transaction created",
          transaction,
        },
        201
      );
    } catch (error) {
      console.log(error);
      return c.json({ message: "error while creating" });
    }
  })
  .patch(
    "/field",
    zValidator(
      "json",
      z.object({
        id: z.string(),
        field: z.string(),
        value: z.union([z.string(), z.boolean(), z.date(), z.number()]),
      })
    ),
    async (c) => {
      const user = c.get("user");

      if (!user) return c.json({ message: "unauthorized" }, 401);
      const { id, field, value } = c.req.valid("json");

      let oldValue;
      try {
        const [currentTransaction] = await db
          .select()
          .from(transactions)
          .where(
            and(eq(transactions.id, id), eq(transactions.userId, user.id))
          );

        if (!currentTransaction) {
          return c.json({ message: "Transaction not found" }, 404);
        }

        oldValue = currentTransaction[field as keyof typeof currentTransaction];
      } catch (e) {
        console.error("Error fetching current transaction:", e);
        return c.json({ message: "Error fetching transaction data" }, 500);
      }

      let updateValue = value;

      if (field === "date") {
        updateValue = new Date(value as Date);
      }

      if (field === "categoryId") {
        updateValue = value;
      }

      if (field === "payeeId") {
        if (typeof value === "string") {
          const [existingPayee] = await db
            .select()
            .from(payees)
            .where(and(eq(payees.name, value), eq(payees.userId, user.id)));
          if (existingPayee) {
            console.log("existing payee", existingPayee.id);
            updateValue = existingPayee.id;
          } else {
            const [newPayee] = await db
              .insert(payees)
              .values({
                name: value,
                userId: user.id,
              })
              .returning({
                id: payees.id,
              });

            updateValue = newPayee.id;
          }
        }
      }

      try {
        await db
          .update(transactions)
          .set({
            [field]: updateValue,
            updatedAt: new Date(),
          })
          .where(
            and(eq(transactions.id, id), eq(transactions.userId, user.id))
          );

        await db // Use db directly
          .insert(transactionHistory)
          .values({
            transactionId: id,
            userId: user.id,
            action: "updated",
            details: {
              field: field,
              oldValue: String(oldValue),
              newValue: String(updateValue),
              source: "user",
              user_name: user?.name ?? null, // Use user from context directly
              metadata:
                field === "amount"
                  ? {
                    original_amount: String(oldValue),
                    new_amount: String(updateValue),
                  }
                  : undefined,
            },
            timestamp: new Date(),
          });
      } catch (e) {
        console.error("Error updating transaction or recording history:", e);
        return c.json({ message: "Error processing update" }, 500);
      }

      return c.json({ message: "ok" }, 200);
    }
  )
  .get("/:id", async (c) => {
    const user = c.get("user");

    if (!user) return c.json({ message: "unauthorized" }, 401);
    const { id } = c.req.param();
    console.log(id);
    try {
      const [transaction] = await db
        .select()
        .from(transactions)

        .where(and(eq(transactions.id, id), eq(transactions.userId, user.id)));

      const validate = selectTransactionSchema.parse(transaction);

      return c.json(validate, 200);
    } catch (e) {
      console.log(e);
      return c.json({ message: "error" }, 500);
    }
  })
  .get(
    "/history/:id",
    zValidator(
      "param",
      z.object({
        id: z.string(),
      })
    ),
    async (c) => {
      const user = c.get("user");
      if (!user) return c.json({ message: "unauthorized" }, 401);
      const { id } = c.req.param();

      try {
        // 1. Fetch Raw History
        const rawHistory = await db
          .select()
          .from(transactionHistory)
          .where(
            and(
              eq(transactionHistory.transactionId, id),
              eq(transactionHistory.userId, user.id) // Important: Ensure user owns the history records
            )
          )
          .orderBy(desc(transactionHistory.timestamp));

        const payeeIds = new Set<number>();
        const categoryIds = new Set<number>();

        rawHistory.forEach((entry) => {
          if (entry.details && typeof entry.details === "object") {
            const details = entry.details as any; // Type assertion for easier access
            if (details.field === "payeeId" || details.field === "categoryId") {
              const oldValueId = parseInt(details.oldValue, 10);
              const newValueId = parseInt(details.newValue, 10);
              const targetSet =
                details.field === "payeeId" ? payeeIds : categoryIds;
              if (!isNaN(oldValueId)) targetSet.add(oldValueId);
              if (!isNaN(newValueId)) targetSet.add(newValueId);
            }
          }
        });

        const payeeMap: Record<number, string> = {};
        const categoryMap: Record<number, string> = {};

        if (payeeIds.size > 0) {
          const payeesData = await db
            .select({ id: payees.id, name: payees.name })
            .from(payees)
            .where(
              and(
                inArray(payees.id, Array.from(payeeIds)),
                eq(payees.userId, user.id) // Ensure user owns the payees
              )
            );
          payeesData.forEach((p) => {
            payeeMap[p.id] = p.name;
          });
        }

        if (categoryIds.size > 0) {
          const categoriesData = await db
            .select({ id: categories.id, name: categories.name })
            .from(categories)
            .where(
              and(
                inArray(categories.id, Array.from(categoryIds)),
                eq(categories.userId, user.id) // Ensure user owns the categories
              )
            );
          categoriesData.forEach((cat) => {
            categoryMap[cat.id] = cat.name;
          });
        }

        // 4. Augment History
        const augmentedHistory = rawHistory.map((entry) => {
          if (entry.details && typeof entry.details === "object") {
            const details = entry.details as any;
            let augmentedDetails = { ...details }; // Clone details

            if (details.field === "payeeId" || details.field === "categoryId") {
              const oldValueId = parseInt(details.oldValue, 10);
              const newValueId = parseInt(details.newValue, 10);
              const lookupMap =
                details.field === "payeeId" ? payeeMap : categoryMap;

              if (!isNaN(oldValueId)) {
                augmentedDetails.oldValueName =
                  lookupMap[oldValueId] ?? `(ID: ${oldValueId})`; // Add name or fallback
              }
              if (!isNaN(newValueId)) {
                augmentedDetails.newValueName =
                  lookupMap[newValueId] ?? `(ID: ${newValueId})`; // Add name or fallback
              }
            }
            return { ...entry, details: augmentedDetails };
          }
          return entry;
        });

        console.log(JSON.stringify(augmentedHistory));

        // 5. Validate and Return Augmented History
        // Adjust selectTransactionHistorySchema if needed to allow optional name fields
        // Or create a new schema for the augmented response
        const response = z.array(logEntrySchema).parse(augmentedHistory); // Use existing schema for now

        return c.json(response, 200);
      } catch (e) {
        console.error("Error fetching or processing transaction history:", e); // Log the actual error
        return c.json(
          { message: "Ocurrio un error al obtener el historial" },
          500
        );
      }
    }
  );
