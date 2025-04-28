CREATE TABLE "payees" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"user_id" text NOT NULL,
	"created_at" timestamp DEFAULT '2025-04-23 21:10:21.249' NOT NULL,
	"updated_at" timestamp DEFAULT '2025-04-23 21:10:21.249' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rules" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	"priority" integer DEFAULT 1 NOT NULL,
	"conditions" text NOT NULL,
	"actions" text NOT NULL,
	"stop_processing" boolean DEFAULT false NOT NULL,
	"delete_after_use" boolean DEFAULT false NOT NULL,
	"run_on_updates" boolean DEFAULT false NOT NULL,
	"user_id" text NOT NULL,
	"created_at" timestamp DEFAULT '2025-04-23 21:10:21.249' NOT NULL,
	"updated_at" timestamp DEFAULT '2025-04-23 21:10:21.249' NOT NULL
);
--> statement-breakpoint
ALTER TABLE "accounts" ALTER COLUMN "created_at" SET DEFAULT '2025-04-23 21:10:21.249';--> statement-breakpoint
ALTER TABLE "accounts" ALTER COLUMN "updated_at" SET DEFAULT '2025-04-23 21:10:21.249';--> statement-breakpoint
ALTER TABLE "categories" ALTER COLUMN "archived" SET DEFAULT false;--> statement-breakpoint
ALTER TABLE "categories" ALTER COLUMN "archived" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "categories" ALTER COLUMN "order" SET DEFAULT 0;--> statement-breakpoint
ALTER TABLE "categories" ALTER COLUMN "order" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "transactions" ALTER COLUMN "created_at" SET DEFAULT '2025-04-23 21:10:21.249';--> statement-breakpoint
ALTER TABLE "transactions" ALTER COLUMN "updated_at" SET DEFAULT '2025-04-23 21:10:21.249';--> statement-breakpoint
ALTER TABLE "categories" ADD COLUMN "user_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "category_groups" ADD COLUMN "user_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "transactions" ADD COLUMN "payee_id" integer;--> statement-breakpoint
ALTER TABLE "payees" ADD CONSTRAINT "payees_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rules" ADD CONSTRAINT "rules_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "categories" ADD CONSTRAINT "categories_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "category_groups" ADD CONSTRAINT "category_groups_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_payee_id_payees_id_fk" FOREIGN KEY ("payee_id") REFERENCES "public"."payees"("id") ON DELETE set null ON UPDATE no action;