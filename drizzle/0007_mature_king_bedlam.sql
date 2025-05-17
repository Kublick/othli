ALTER TABLE "accounts" ALTER COLUMN "created_at" SET DEFAULT '2025-05-12 02:31:10.333';--> statement-breakpoint
ALTER TABLE "accounts" ALTER COLUMN "updated_at" SET DEFAULT '2025-05-12 02:31:10.333';--> statement-breakpoint
ALTER TABLE "budgets" ALTER COLUMN "created_at" SET DEFAULT '2025-05-12 02:31:10.334';--> statement-breakpoint
ALTER TABLE "budgets" ALTER COLUMN "updated_at" SET DEFAULT '2025-05-12 02:31:10.334';--> statement-breakpoint
ALTER TABLE "payees" ALTER COLUMN "created_at" SET DEFAULT '2025-05-12 02:31:10.334';--> statement-breakpoint
ALTER TABLE "payees" ALTER COLUMN "updated_at" SET DEFAULT '2025-05-12 02:31:10.334';--> statement-breakpoint
ALTER TABLE "rules" ALTER COLUMN "created_at" SET DEFAULT '2025-05-12 02:31:10.334';--> statement-breakpoint
ALTER TABLE "rules" ALTER COLUMN "updated_at" SET DEFAULT '2025-05-12 02:31:10.334';--> statement-breakpoint
ALTER TABLE "transaction_history" ALTER COLUMN "timestamp" SET DEFAULT '2025-05-12 02:31:10.334';--> statement-breakpoint
ALTER TABLE "transactions" ALTER COLUMN "created_at" SET DEFAULT '2025-05-12 02:31:10.334';--> statement-breakpoint
ALTER TABLE "transactions" ALTER COLUMN "updated_at" SET DEFAULT '2025-05-12 02:31:10.334';--> statement-breakpoint
ALTER TABLE "budgets" ADD COLUMN "end_date" timestamp NOT NULL;