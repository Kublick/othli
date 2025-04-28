import { Hono } from "hono";
import { auth } from "../lib/auth";
import { db } from "../db/drizzle";
import { eq } from "drizzle-orm";
import { payees } from "../db/schema";

export const payeeRouter = new Hono<{
  Variables: {
    user: typeof auth.$Infer.Session.user | null;
    session: typeof auth.$Infer.Session.session | null;
  };
}>().get("/", async (c) => {
  const user = c.get("user");

  if (!user) return c.json({ message: "unauthorized" }, 401);

  const payes = await db
    .select()
    .from(payees)
    .where(eq(payees.userId, user.id));

  return c.json(payes, 200);
});
