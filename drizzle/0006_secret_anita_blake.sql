CREATE TABLE "budgets" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"category_id" integer NOT NULL,
	"start_date" timestamp NOT NULL,
	"amount" numeric(14, 2) NOT NULL,
	"created_at" timestamp DEFAULT '2025-05-12 01:12:19.468' NOT NULL,
	"updated_at" timestamp DEFAULT '2025-05-12 01:12:19.468' NOT NULL
);
--> statement-breakpoint
ALTER TABLE "accounts" ALTER COLUMN "created_at" SET DEFAULT '2025-05-12 01:12:19.467';--> statement-breakpoint
ALTER TABLE "accounts" ALTER COLUMN "updated_at" SET DEFAULT '2025-05-12 01:12:19.467';--> statement-breakpoint
ALTER TABLE "payees" ALTER COLUMN "created_at" SET DEFAULT '2025-05-12 01:12:19.468';--> statement-breakpoint
ALTER TABLE "payees" ALTER COLUMN "updated_at" SET DEFAULT '2025-05-12 01:12:19.468';--> statement-breakpoint
ALTER TABLE "rules" ALTER COLUMN "created_at" SET DEFAULT '2025-05-12 01:12:19.468';--> statement-breakpoint
ALTER TABLE "rules" ALTER COLUMN "updated_at" SET DEFAULT '2025-05-12 01:12:19.468';--> statement-breakpoint
ALTER TABLE "transaction_history" ALTER COLUMN "timestamp" SET DEFAULT '2025-05-12 01:12:19.468';--> statement-breakpoint
ALTER TABLE "transactions" ALTER COLUMN "created_at" SET DEFAULT '2025-05-12 01:12:19.467';--> statement-breakpoint
ALTER TABLE "transactions" ALTER COLUMN "updated_at" SET DEFAULT '2025-05-12 01:12:19.467';--> statement-breakpoint
ALTER TABLE "budgets" ADD CONSTRAINT "budgets_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "budgets" ADD CONSTRAINT "budgets_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;