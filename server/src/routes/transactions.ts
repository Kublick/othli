import { Hono } from "hono";
import { auth } from "../lib/auth";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { db } from "../db/drizzle";
import { categories, payees, transactions } from "../db/schema";
import { nanoid } from "nanoid";
import { and, desc, eq, gte, lte } from "drizzle-orm";

const DateRangeSchema = z.object({
  start_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in format YYYY-MM-DD"),
  end_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in format YYYY-MM-DD"),
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

    console.log(start_date, end_date);

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
  })
  .post("/", zValidator("json", insertTransactionSchema), async (c) => {
    const user = c.get("user");

    if (!user) return c.json({ message: "unauthorized" }, 401);

    const { date, categoryId, payeeId, accountId, amount, description } =
      await c.req.json();

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
      const transaction = await db.insert(transactions).values({
        id: nanoid(),
        description: description ?? "",
        date: new Date(date),
        categoryId:
          typeof categoryId === "number" ? categoryId : finalCategoryId,
        payeeId: typeof payeeId === "number" ? payeeId : finalPayeeId,
        accountId,
        amount,
        userId: user.id,
      });
      return c.json(
        {
          message: "Transaction created",
          transaction,
        },
        200
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
          })
          .where(eq(transactions.id, id));
      } catch (e) {
        console.log(e);
        return c.json({ message: "error" }, 500);
      }

      return c.json({ message: "ok" }, 200);
    }
  );
