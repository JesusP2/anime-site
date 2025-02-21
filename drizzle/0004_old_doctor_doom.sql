ALTER TABLE "manga" ALTER COLUMN "mal_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "manga" ALTER COLUMN "genres" SET DATA TYPE json;--> statement-breakpoint
ALTER TABLE "manga" ALTER COLUMN "genres" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "manga" ALTER COLUMN "demographics" SET NOT NULL;