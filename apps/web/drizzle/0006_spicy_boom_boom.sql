ALTER TABLE "manga" ALTER COLUMN "images" SET DATA TYPE jsonb;--> statement-breakpoint
ALTER TABLE "manga" ALTER COLUMN "titles" SET DATA TYPE jsonb;--> statement-breakpoint
ALTER TABLE "manga" ALTER COLUMN "title_synonyms" SET DATA TYPE jsonb;--> statement-breakpoint
ALTER TABLE "manga" ALTER COLUMN "authors" SET DATA TYPE jsonb;--> statement-breakpoint
ALTER TABLE "manga" ALTER COLUMN "serializations" SET DATA TYPE jsonb;--> statement-breakpoint
ALTER TABLE "manga" ALTER COLUMN "genres" SET DATA TYPE jsonb;--> statement-breakpoint
ALTER TABLE "manga" ALTER COLUMN "explicit_genres" SET DATA TYPE jsonb;--> statement-breakpoint
ALTER TABLE "manga" ALTER COLUMN "themes" SET DATA TYPE jsonb;--> statement-breakpoint
ALTER TABLE "manga" ALTER COLUMN "demographics" SET DATA TYPE jsonb;--> statement-breakpoint
ALTER TABLE "manga" ALTER COLUMN "relations" SET DATA TYPE jsonb;--> statement-breakpoint
ALTER TABLE "manga" ALTER COLUMN "external" SET DATA TYPE jsonb;