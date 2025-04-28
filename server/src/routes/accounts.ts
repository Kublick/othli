import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { accounts, insertAccountSchema } from "../db/schema";
import { db } from "../db/drizzle";
import { auth } from "../lib/auth";
import { eq } from "drizzle-orm";

export const accountsRouter = new Hono<{
  Variables: {
    user: typeof auth.$Infer.Session.user | null;
    session: typeof auth.$Infer.Session.session | null;
  };
}>()
  .get("/", async (c) => {
    const user = c.get("user");

    if (!user) return c.json({ message: "unauthorized" }, 401);

    try {
      const data = await db
        .select()
        .from(accounts)
        .where(eq(accounts.userId, user.id));

      // const totalBalance = data
      //   .filter((account) => !account.excludeTransactions)
      //   .reduce((sum, account) => sum + Number(account.balance), 0);

      // const finalData = {
      //   accounts: data,
      //   totalBalance: totalBalance.toFixed(2),
      // };

      return c.json(data, 200);
    } catch (error) {
      return c.json({ message: "error getting accounts" }, 500);
    }
  })
  .post("/", zValidator("json", insertAccountSchema), async (c) => {
    const user = c.get("user");

    if (!user) return c.json({ message: "unauthorized" }, 401);

    const { name, typeName, balance, institutionName } = c.req.valid("json");

    try {
      await db.insert(accounts).values({
        id: crypto.randomUUID(),
        name,
        typeName,
        balance: String(balance),
        institutionName,
        userId: user.id,
        balanceAsOf: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        excludeTransactions: false,
      });
    } catch (e) {
      return c.json({ message: "error creating account" }, 500);
    }

    return c.json({
      message: "Account created",
    });
  });
