ALTER TABLE "accounts" ALTER COLUMN "created_at" SET DEFAULT '2025-04-25 03:39:56.896';--> statement-breakpoint
ALTER TABLE "accounts" ALTER COLUMN "updated_at" SET DEFAULT '2025-04-25 03:39:56.896';--> statement-breakpoint
ALTER TABLE "payees" ALTER COLUMN "created_at" SET DEFAULT '2025-04-25 03:39:56.897';--> statement-breakpoint
ALTER TABLE "payees" ALTER COLUMN "updated_at" SET DEFAULT '2025-04-25 03:39:56.897';--> statement-breakpoint
ALTER TABLE "rules" ALTER COLUMN "created_at" SET DEFAULT '2025-04-25 03:39:56.897';--> statement-breakpoint
ALTER TABLE "rules" ALTER COLUMN "updated_at" SET DEFAULT '2025-04-25 03:39:56.897';--> statement-breakpoint
ALTER TABLE "transactions" ALTER COLUMN "description" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "transactions" ALTER COLUMN "created_at" SET DEFAULT '2025-04-25 03:39:56.896';--> statement-breakpoint
ALTER TABLE "transactions" ALTER COLUMN "updated_at" SET DEFAULT '2025-04-25 03:39:56.896';