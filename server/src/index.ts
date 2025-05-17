import { Hono } from "hono";
import { auth } from "./lib/auth";
import { cors } from "hono/cors";
import { accountsRouter } from "./routes/accounts";
import { categoriesRouter } from "./routes/categories";
import { transactionsRouter } from "./routes/transactions";
import { payeeRouter } from "./routes/payee";
import { budgetsRouter } from "./routes/budgets";
import { serveStatic } from "hono/bun";

const app = new Hono<{
  Variables: {
    user: typeof auth.$Infer.Session.user | null;
    session: typeof auth.$Infer.Session.session | null;
  };
}>();

// CORS middleware
app.use(
  "*",
  cors({
    origin: ["http://localhost:3000", process.env.CLIENT_URL!],
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["POST", "GET", "OPTIONS", "PATCH", "DELETE", "PUT"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
    credentials: true,
  })
);

// Auth middleware
app.use("*", async (c, next) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });

  if (!session) {
    c.set("user", null);
    c.set("session", null);
    return next();
  }

  c.set("user", session.user);
  c.set("session", session.session);
  return next();
});

// Auth routes
app.on(["POST", "GET"], "/api/auth/*", (c) => {
  return auth.handler(c.req.raw);
});

// API Routes
const routes = app
  .get('/health', (c) => c.text('OK'))
  .basePath("/api")
  .route("/accounts", accountsRouter)
  .route("/categories", categoriesRouter)
  .route("/transactions", transactionsRouter)
  .route("/payees", payeeRouter)
  .route("/budgets", budgetsRouter);

app.use(
  "*",
  serveStatic({
    root: "./client/dist",
  })
);

app.use(
  "*",
  serveStatic({
    path: "./client/dist/index.html",
  })
);

export type AppType = typeof routes;

export default {
  port: process.env.PORT ? Number(process.env.PORT) : 4000,
  fetch: app.fetch,
};
