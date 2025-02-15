ALTER TABLE "manga" ALTER COLUMN "images" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "manga" ALTER COLUMN "titles" SET DATA TYPE json;--> statement-breakpoint
ALTER TABLE "manga" ALTER COLUMN "titles" SET NOT NULL;