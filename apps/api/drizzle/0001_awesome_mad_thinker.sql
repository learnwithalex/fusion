CREATE TABLE "bids" (
	"id" serial PRIMARY KEY NOT NULL,
	"asset_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"amount" numeric(18, 8) NOT NULL,
	"tnxhash" text,
	"status" text DEFAULT 'active',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "assets" ADD COLUMN "bidding_enabled" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "assets" ADD COLUMN "bidding_start_price" numeric(18, 8);--> statement-breakpoint
ALTER TABLE "assets" ADD COLUMN "bidding_duration" integer;--> statement-breakpoint
ALTER TABLE "assets" ADD COLUMN "bidding_started_at" timestamp;--> statement-breakpoint
ALTER TABLE "assets" ADD COLUMN "bidding_ends_at" timestamp;--> statement-breakpoint
ALTER TABLE "assets" ADD COLUMN "bidding_winner_id" integer;--> statement-breakpoint
ALTER TABLE "assets" ADD COLUMN "bidding_status" text DEFAULT 'pending';--> statement-breakpoint
ALTER TABLE "bids" ADD CONSTRAINT "bids_asset_id_assets_id_fk" FOREIGN KEY ("asset_id") REFERENCES "public"."assets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bids" ADD CONSTRAINT "bids_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assets" ADD CONSTRAINT "assets_bidding_winner_id_users_id_fk" FOREIGN KEY ("bidding_winner_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;