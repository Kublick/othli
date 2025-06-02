import { Hono } from "hono";

import { db } from "../db/drizzle";
import {
  categories,

} from "../db/schema";
import { asc, eq } from "drizzle-orm";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { auth } from "../lib/auth";
import { insertCategorySchema, type SelectCategoryType } from "../db/schema";

export const categoriesRouter = new Hono<{
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
        .from(categories)
        .where(eq(categories.userId, user.id))
        .orderBy(asc(categories.order));
      return c.json(data, 200);
    } catch (e) {
      console.log(e);
      return c.json({ message: "error" }, 500);
    }
  })
  .get(
    "/:id",
    zValidator(
      "param",
      z.object({
        id: z.string(),
      })
    ),
    async (c) => {
      const user = c.get("user");
      if (!user) return c.json({ message: "unauthorized" }, 401);
      const { id } = c.req.valid("param");

      try {
        const data = await db
          .select()
          .from(categories)
          .where(eq(categories.id, Number(id)))
          .orderBy(asc(categories.order));

        if (data.length === 0) {
          return c.json({ message: "category not found" }, 404);
        }
        return c.json<SelectCategoryType>(data[0], 200);
      } catch (e) {
        console.log(e);
        return c.json({ message: "error" }, 500);
      }


    }
  )
  .post("/", zValidator("json", insertCategorySchema), async (c) => {
    const user = c.get("user");

    if (!user) return c.json({ message: "unauthorized" }, 401);

    const {
      name,
      description,
      isIncome,
      excludeFromBudget,
      excludeFromTotals,
    } = c.req.valid("json");

    try {
      await db.insert(categories).values({
        name,
        description,
        isIncome,
        excludeFromBudget,
        excludeFromTotals,
        createdAt: new Date(),
        updatedAt: new Date(),
        userId: user.id,
      });
      return c.json(
        {
          message: "ok",
        },
        200
      );
    } catch (e) {
      console.log(e);
      return c.json({ message: "error" }, 500);
    }
  })
  .patch(
    "/field",
    zValidator(
      "json",
      z.object({
        id: z.string(),
        field: z.string(),
        value: z.string(),
      })
    ),
    async (c) => {
      const user = c.get("user");

      if (!user) return c.json({ message: "unauthorized" }, 401);
      const { id, field, value } = c.req.valid("json");

      try {
        await db
          .update(categories)
          .set({
            [field]: value,
          })
          .where(eq(categories.id, Number(id)));
      } catch (e) {
        console.log(e);
        return c.json({ message: "error" }, 500);
      }

      return c.json({ message: "ok" }, 200);
    }
  )
  .post(
    "/order",
    zValidator(
      "json",
      z.array(
        z.object({
          id: z.number(),
          order: z.number(),
        })
      )
    ),
    async (c) => {
      const user = c.get("user");

      if (!user) return c.json({ message: "unauthorized" }, 401);
      const categoriesGroup = c.req.valid("json");

      categoriesGroup.forEach(async (element) => {
        try {
          await db
            .update(categories)
            .set({
              order: element.order,
            })
            .where(eq(categories.id, element.id))
            .returning();
        } catch (e) {
          console.log(e);
          return c.json({ message: "error" }, 500);
        }
      });

      return c.json({ message: "ok" }, 200);
    }
  )
  .patch(
    "/:id",
    zValidator("param", z.object({ id: z.coerce.number() })),
    zValidator("json", insertCategorySchema),
    async (c) => {
      const user = c.get("user");
      if (!user) return c.json({ error: "Unauthorized" }, 401);

      const { id } = c.req.valid("param");
      const req = c.req.valid("json");

      try {
        const result = await db
          .update(categories)
          .set({
            updatedAt: new Date(),
            ...req,
          })
          .where(eq(categories.id, id));

        if (result.rowCount === 0) {
          return c.json({ message: "Not found" }, 404);
        }

        return c.json({ message: "done" }, 200);
      } catch (e) {
        console.error("Failed to update category", { error: e });
        return c.json({ message: "error" }, 500);
      }
    }
  );
