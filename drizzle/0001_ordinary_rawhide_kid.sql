CREATE TYPE "public"."account_type" AS ENUM('efectivo', 'debito', 'credito', 'inversion');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('user', 'assistant', 'admin');--> statement-breakpoint
CREATE TABLE "accounts" (
	"id" text PRIMARY KEY NOT NULL,
	"type_name" "account_type" NOT NULL,
	"subtype_name" text,
	"name" text NOT NULL,
	"display_name" text,
	"balance" numeric(14, 4) NOT NULL,
	"balance_as_of" timestamp NOT NULL,
	"closed_on" timestamp,
	"institution_name" text,
	"exclude_transactions" boolean DEFAULT false NOT NULL,
	"user_id" text NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(40) NOT NULL,
	"description" varchar(140),
	"is_income" boolean DEFAULT false NOT NULL,
	"exclude_from_budget" boolean DEFAULT false NOT NULL,
	"exclude_from_totals" boolean DEFAULT false NOT NULL,
	"archived" boolean,
	"archived_on" timestamp,
	"updated_at" timestamp,
	"created_at" timestamp,
	"is_group" boolean DEFAULT false NOT NULL,
	"group_id" integer,
	"order" integer,
	"group_category_name" varchar(100)
);
--> statement-breakpoint
CREATE TABLE "category_groups" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(40) NOT NULL,
	"description" varchar(140),
	"is_income" boolean DEFAULT false NOT NULL,
	"exclude_from_budget" boolean DEFAULT false NOT NULL,
	"exclude_from_totals" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "transactions" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"user_id" text NOT NULL,
	"description" text NOT NULL,
	"amount" numeric(14, 4) NOT NULL,
	"currency" text DEFAULT 'mxn' NOT NULL,
	"category_id" integer,
	"is_transfer" boolean DEFAULT false NOT NULL,
	"transfer_account_id" text,
	"date" timestamp NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "role" "user_role" DEFAULT 'user' NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "is_active" boolean DEFAULT true;--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_transfer_account_id_accounts_id_fk" FOREIGN KEY ("transfer_account_id") REFERENCES "public"."accounts"("id") ON DELETE set null ON UPDATE no action;