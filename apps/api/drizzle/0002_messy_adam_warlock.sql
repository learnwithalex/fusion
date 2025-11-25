ALTER TABLE "assets" ADD COLUMN "ownership_accepted" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "assets" ADD COLUMN "deletion_requested" boolean DEFAULT false;