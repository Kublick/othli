CREATE TABLE "transaction_history" (
	"id" serial PRIMARY KEY NOT NULL,
	"transaction_id" text NOT NULL,
	"user_id" text NOT NULL,
	"action" text NOT NULL,
	"details" jsonb,
	"timestamp" timestamp DEFAULT '2025-05-02 03:47:20.250' NOT NULL
);
--> statement-breakpoint
ALTER TABLE "accounts" ALTER COLUMN "created_at" SET DEFAULT '2025-05-02 03:47:20.249';--> statement-breakpoint
ALTER TABLE "accounts" ALTER COLUMN "updated_at" SET DEFAULT '2025-05-02 03:47:20.249';--> statement-breakpoint
ALTER TABLE "payees" ALTER COLUMN "created_at" SET DEFAULT '2025-05-02 03:47:20.250';--> statement-breakpoint
ALTER TABLE "payees" ALTER COLUMN "updated_at" SET DEFAULT '2025-05-02 03:47:20.250';--> statement-breakpoint
ALTER TABLE "rules" ALTER COLUMN "created_at" SET DEFAULT '2025-05-02 03:47:20.250';--> statement-breakpoint
ALTER TABLE "rules" ALTER COLUMN "updated_at" SET DEFAULT '2025-05-02 03:47:20.250';--> statement-breakpoint
ALTER TABLE "transactions" ALTER COLUMN "created_at" SET DEFAULT '2025-05-02 03:47:20.249';--> statement-breakpoint
ALTER TABLE "transactions" ALTER COLUMN "updated_at" SET DEFAULT '2025-05-02 03:47:20.249';--> statement-breakpoint
ALTER TABLE "transaction_history" ADD CONSTRAINT "transaction_history_transaction_id_transactions_id_fk" FOREIGN KEY ("transaction_id") REFERENCES "public"."transactions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transaction_history" ADD CONSTRAINT "transaction_history_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;