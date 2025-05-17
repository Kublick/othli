
import {
  pgTable,
  text,
  timestamp,
  boolean,
  serial,
  varchar,
  pgEnum,
  integer,
  numeric,
  jsonb, // Import jsonb type
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const userRoleEnum = pgEnum("user_role", ["user", "assistant", "admin"]);

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull(),
  image: text("image"),
  role: userRoleEnum("role").notNull().default("user"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  isActive: boolean("is_active").default(true),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at"),
  updatedAt: timestamp("updated_at"),
});

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 40 }).notNull(),
  description: varchar("description", { length: 140 }),
  isIncome: boolean("is_income").default(false).notNull(),
  excludeFromBudget: boolean("exclude_from_budget").default(false).notNull(),
  excludeFromTotals: boolean("exclude_from_totals").default(false).notNull(),
  archived: boolean("archived").default(false).notNull(),
  archivedOn: timestamp("archived_on"),
  updatedAt: timestamp("updated_at"),
  createdAt: timestamp("created_at"),
  isGroup: boolean("is_group").default(false).notNull(),
  groupId: integer("group_id"),
  order: integer("order").default(0).notNull(),
  groupCategoryName: varchar("group_category_name", { length: 100 }),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const insertCategorySchema = createInsertSchema(categories).omit({
  id: true,
  userId: true,
});

export const selectCategorySchema = createInsertSchema(categories).omit({
  userId: true,
});

export const categoryGroups = pgTable("category_groups", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 40 }).notNull(),
  description: varchar("description", { length: 140 }),
  isIncome: boolean("is_income").default(false).notNull(),
  excludeFromBudget: boolean("exclude_from_budget").default(false).notNull(),
  excludeFromTotals: boolean("exclude_from_totals").default(false).notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const accountsTypeEnum = pgEnum("account_type", [
  "efectivo",
  "debito",
  "credito",
  "inversion",
]);

export const accounts = pgTable("accounts", {
  id: text("id").primaryKey(),
  typeName: accountsTypeEnum("type_name").notNull(),
  subtypeName: text("subtype_name"),
  name: text("name").notNull(),
  displayName: text("display_name"),
  balance: numeric("balance", { precision: 14, scale: 4 }).notNull(), // saldo con 4 decimales
  balanceAsOf: timestamp("balance_as_of").notNull(),
  closedOn: timestamp("closed_on"),
  institutionName: text("institution_name"),
  excludeTransactions: boolean("exclude_transactions").notNull().default(false),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().default(new Date()),
  updatedAt: timestamp("updated_at").notNull().default(new Date()),
});

export const baseSchema = createInsertSchema(accounts).omit({
  id: true,
  closedOn: true,
  excludeTransactions: true,
  userId: true,
  balanceAsOf: true,
});

export const insertAccountSchema = baseSchema.extend({
  name: z.string().min(1, { message: "Nombre es obligatorio" }),
  typeName: z.enum(["debito", "credito", "efectivo", "inversion"]),
  subtypeName: z.string().optional(),
  balance: z.string(),
  institutionNAme: z.string().optional(),
});

export const transactions = pgTable("transactions", {
  id: text("id").primaryKey(),
  payeeId: integer("payee_id").references(() => payees.id, {
    onDelete: "set null",
  }), // Reference to payees table
  accountId: text("account_id")
    .notNull()
    .references(() => accounts.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  description: text("description"),
  amount: numeric("amount", { precision: 14, scale: 4 }).notNull(),
  currency: text("currency").notNull().default("mxn"),
  categoryId: integer("category_id").references(() => categories.id, {
    onDelete: "set null",
  }),
  isTransfer: boolean("is_transfer").notNull().default(false),
  transferAccountId: text("transfer_account_id").references(() => accounts.id, {
    onDelete: "set null",
  }),
  date: timestamp("date").notNull(),
  createdAt: timestamp("created_at").default(new Date()).notNull(),
  updatedAt: timestamp("updated_at").default(new Date()).notNull(),
});

// export const transactionsRelations = relations(transactions, ({ one }) => ({
//   account: one(accounts, {
//     fields: [transactions.accountId],
//     references: [accounts.id],
//   }),
//   user: one(user, {
//     fields: [transactions.userId],
//     references: [user.id],
//   }),
//   categoryRelation: one(categories, {
//     fields: [transactions.categoryId],
//     references: [categories.id],
//   }),
//   transferAccount: one(accounts, {
//     fields: [transactions.transferAccountId],
//     references: [accounts.id],
//     relationName: "transferAccount",
//   }),
//   payee: one(payees, {
//     fields: [transactions.payeeId],
//     references: [payees.id],
//   }),
// }));

export const insertTransactionSchema = createInsertSchema(transactions).omit({

  userId: true,
  createdAt: true,
  updatedAt: true,
});

export const selectTransactionSchema = createInsertSchema(transactions)
export type SelectTransacionType = z.infer<typeof selectTransactionSchema>;

export const rules = pgTable("rules", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  priority: integer("priority").notNull().default(1),
  conditions: text("conditions").notNull(),
  actions: text("actions").notNull(),
  stopProcessing: boolean("stop_processing").default(false).notNull(),
  deleteAfterUse: boolean("delete_after_use").default(false).notNull(),
  runOnUpdates: boolean("run_on_updates").default(false).notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }), // Rule belongs to a user
  createdAt: timestamp("created_at").notNull().default(new Date()),
  updatedAt: timestamp("updated_at").notNull().default(new Date()),
});

export const payees = pgTable("payees", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(), // Payee name
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }), // Payee belongs to a user
  createdAt: timestamp("created_at").notNull().default(new Date()),
  updatedAt: timestamp("updated_at").notNull().default(new Date()),
});

export const transactionHistory = pgTable("transaction_history", {
  id: serial("id").primaryKey(),
  transactionId: text("transaction_id")
    .notNull()
    .references(() => transactions.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  action: text("action").notNull(), // 'created' or 'updated'
  // Use jsonb to store varying details based on action
  details: jsonb("details"), // Can store { field, oldValue, newValue, metadata } or { descriptor, metadata }
  timestamp: timestamp("timestamp").notNull().default(new Date()), // Renamed from changedAt for clarity
});


export const selectTransactionHistorySchema = createInsertSchema(transactionHistory);
export type SelectTransacionHistoryType = z.infer<typeof selectTransactionHistorySchema>;

export const budgets = pgTable("budgets", {
  id: serial("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  categoryId: integer("category_id")
    .notNull()
    .references(() => categories.id, { onDelete: "cascade" }),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  amount: numeric("amount", { precision: 14, scale: 2 }).notNull(), // Assuming 2 decimal places for currency
  createdAt: timestamp("created_at").default(new Date()).notNull(),
  updatedAt: timestamp("updated_at").default(new Date()).notNull(),
});

export const insertBudgetSchema = createInsertSchema(budgets, {
  startDate: z.coerce.date(),
  amount: z.number().positive(),
  categoryId: z.number().int(),
}).omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
});

export const selectBudgetSchema = createInsertSchema(budgets).omit({
  userId: true,
});